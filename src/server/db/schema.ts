// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations } from "drizzle-orm";
import {
  bigint,
  boolean,
  datetime,
  index,
  int,
  mysqlTableCreator,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const mysqlTable = mysqlTableCreator((name) => `tcgurt-app_${name}`);

export const events = mysqlTable("events", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull(),
  description: varchar("description", { length: 256 }),
  organizer: varchar("organizer", { length: 50 }).notNull(),
  location: varchar("location", { length: 256 }),
  startDate: datetime("start-date").notNull(),
  fbLink: varchar("facebook-link", { length: 256 }),
  price: int("price").notNull(),
});

export const cardLists = mysqlTable("card_lists", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  userId: varchar("user_id", { length: 50 }).notNull(),
  name: varchar("name", { length: 100 }),
  public: boolean("public").notNull(),
});

export const cardListsRelations = relations(cardLists, ({ many }) => ({
  cards: many(cards),
}));

export const cards = mysqlTable("cards", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  cardListId: int("card_list_id"),
  apiId: varchar("api_id", { length: 50 }).notNull(),
  quantity: int("quantity").notNull(),
});

export const cardsRelations = relations(cards, ({ one }) => ({
  cardList: one(cardLists, {
    fields: [cards.cardListId],
    references: [cardLists.id],
  }),
}));

// export const example = mysqlTable(
//   "example",
//   {
//     id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
//     name: varchar("name", { length: 256 }),
//     createdAt: timestamp("created_at")
//       .default(sql`CURRENT_TIMESTAMP`)
//       .notNull(),
//     updatedAt: timestamp("updatedAt").onUpdateNow(),
//   },
//   (example) => ({
//     nameIndex: uniqueIndex("name_idx").on(example.name),
//   }),
// );
