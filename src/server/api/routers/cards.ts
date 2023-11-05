import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { PokemonTCG } from "pokemon-tcg-sdk-typescript";
import type { Card } from "pokemon-tcg-sdk-typescript/dist/sdk";

const filterCardForClient = (card: Card) => {
  return {
    name: card.name,
    images: card.images,
    id: card.id,
  };
};

export const cardsRouter = createTRPCRouter({
  getCards: publicProcedure
    .input(z.object({ name: z.string(), onlyStandard: z.boolean() }))
    .query(async ({ input }) => {
      const cards = await PokemonTCG.findCardsByQueries({
        q: `name:"${input.name.trim()}*" ${
          input.onlyStandard ? "legalities.standard:Legal" : ""
        }`,
      });

      return cards.map(filterCardForClient);
    }),
});
