import { asc, gte } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { events } from "~/server/db/schema";

export const eventsRouter = createTRPCRouter({
  getFutureEvents: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.events.findMany({
      where: (events) => gte(events.startDate, new Date()),
      orderBy: (events) => [asc(events.startDate)],
    });
  }),
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        organizer: z.string(),
        location: z.string().url(),
        startDate: z.date(),
        fbLink: z.string().url().optional(),
        price: z.number().nonnegative(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(events).values(input);
    }),
});
