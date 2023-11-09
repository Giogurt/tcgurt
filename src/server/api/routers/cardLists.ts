import { clerkClient } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { cardLists, cards, events } from "~/server/db/schema";
import type { UserPublicMetadata, UserUnsafeMetadata } from "~/server/api/auth";
import { TRPCError } from "@trpc/server";

export const cardListsRouter = createTRPCRouter({
  findById: publicProcedure
    .input(z.object({ cardListId: z.number().nonnegative() }))
    .query(async ({ ctx, input }) => {
      const cardList = await ctx.db.query.cardLists.findFirst({
        with: { cards: true },
        where: eq(cardLists.id, input.cardListId),
      });

      if (!cardList) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "The card list was not found",
        });
      }

      return cardList;
    }),
  addCard: privateProcedure
    .input(
      z.object({
        cardId: z.string().trim(),
        cardListId: z.number().nonnegative(),
        imageUrl: z.string().url().trim(),
        name: z.string().trim(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await clerkClient.users.getUser(ctx.userId);

      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "The user is not logged in",
        });
      }

      const cardList = await ctx.db.query.cardLists.findFirst({
        with: { cards: true },
        where: eq(cardLists.id, input.cardListId),
      });

      if (user.id !== cardList?.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "The user is not authorized to add cards to this list",
        });
      }

      const cardExists = cardList.cards.find((card) => {
        card.apiId === input.cardId;
      });
      if (cardExists) {
        return ctx.db
          .update(cards)
          .set({ quantity: cardExists.quantity + 1 })
          .where(eq(cards.id, cardExists.id));
      }

      return ctx.db.insert(cards).values({
        apiId: input.cardId,
        quantity: 1,
        cardListId: input.cardListId,
        imageUrl: input.imageUrl,
        name: input.name,
      });
    }),
  create: privateProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        organizer: z.string().optional(),
        location: z.string().url().optional(),
        startDate: z.date(),
        fbLink: z.string().url().optional(),
        price: z.number().nonnegative(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await clerkClient.users.getUser(ctx.userId);

      const userMetadata = user.unsafeMetadata as UserUnsafeMetadata;
      const UserSafeMetadata = user.publicMetadata as UserPublicMetadata;

      if (!UserSafeMetadata.isOrganizer) {
        throw new Error("Not authorized");
      }

      const eventFields = {
        ...input,
        ...userMetadata,
        organizer: input.organizer!,
      };

      if (input.location) {
        eventFields.location = input.location;
      }

      return ctx.db.insert(events).values(eventFields);
    }),
});
