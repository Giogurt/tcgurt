import { clerkClient } from "@clerk/nextjs";
import { asc, gte } from "drizzle-orm";
import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { events } from "~/server/db/schema";
import type { UserPublicMetadata, UserUnsafeMetadata } from "~/server/api/auth";
import { TRPCError } from "@trpc/server";

export const eventsRouter = createTRPCRouter({
  getFutureEvents: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.events.findMany({
      where: (events) => gte(events.startDate, new Date()),
      orderBy: (events) => [asc(events.startDate)],
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
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "The user is not an organizer",
        });
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
