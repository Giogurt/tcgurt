// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  bigint,
  date,
  datetime,
  int,
  mysqlTableCreator,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const mysqlTable = mysqlTableCreator((name) => `tcgurt-app_${name}`);

export const event = mysqlTable("event", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }),
  description: varchar("description", { length: 256 }),
  organizer: varchar("organizer", { length: 50 }),
  location: varchar("location", { length: 256 }),
  startDate: datetime("start-date"),
  fbLink: varchar("facebook-link", { length: 256 }),
  price: int("price"),
});

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
