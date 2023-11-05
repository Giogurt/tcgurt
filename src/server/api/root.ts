import { createTRPCRouter } from "~/server/api/trpc";
import { eventsRouter } from "./routers/events";
import { cardsRouter } from "./routers/cards";
import { cardListsRouter } from "./routers/cardLists";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  cards: cardsRouter,
  cardLists: cardListsRouter,
  events: eventsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
