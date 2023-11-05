import { clerkClient } from "@clerk/nextjs";
import { asc, eq, gte } from "drizzle-orm";
import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { cardLists, events } from "~/server/db/schema";
import type { UserPublicMetadata, UserUnsafeMetadata } from "~/server/api/auth";

export const cardListsRouter = createTRPCRouter({
  findById: publicProcedure
    .input(z.object({ wishlistId: z.number().nonnegative() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.cardLists.findFirst({
        with: { cards: true },
        where: eq(cardLists.id, input.wishlistId),
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
