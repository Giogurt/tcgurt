import { asc, gte } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const eventsRouter = createTRPCRouter({
  getFutureEvents: publicProcedure
    .input(z.object({ month: z.number().min(0).max(11).optional() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.event.findMany({
        where: (events) => gte(events.startDate, new Date()),
        orderBy: (events) => [asc(events.startDate)],
      });
    }),
});
