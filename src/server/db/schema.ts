// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  index,
  pgTable,
  pgTableCreator,
  integer,
  serial,
  varchar,
} from "drizzle-orm/pg-core";
import { text, timestamp, boolean } from "drizzle-orm/pg-core";
import { users } from "./auth-schema";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `spendy_${name}`);

console.log("Creating tables with prefix spendy_");

export const cards = createTable("cards", (d) => ({
  id: serial("id").primaryKey(),
  holder: d.varchar("holder", { length: 256 }).notNull(), // nombre del dueño de la tarjeta
  number: d.varchar("number", { length: 4 }).notNull(), // últimos 4 dígitos
  issuer: d.varchar("issuer", { length: 256 }).notNull(), // nombre del banco
  type: d.varchar("type", { length: 256 }).notNull(), // visa o mastercard
  extensionHolder: d.varchar("extension_holder", { length: 256 }), // nombre del dueño de la tarjeta adicional
}));

export const transactions = createTable("transactions", (d) => ({
  id: serial("id").primaryKey(),
  date: d.date("date").notNull(), // fecha del gasto
  description: d.varchar("description", { length: 256 }).notNull(), // el nombre del gasto
  amount: d.numeric("amount").notNull(),
  currency: d.varchar("currency", { length: 3 }).notNull(), // "ARS" o "USD"
  category: d.varchar("category", { length: 256 }).notNull(), // tipo de gasto

  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),

  userId: varchar("user_id", { length: 50 }).notNull().references(() => users.id),

  cardId: integer("card_id")
    // .notNull()
    .references(() => cards.id),
}));

export const statements = createTable("statements", (d) => ({
  id: serial("id").primaryKey(),
  date: d.date("date").notNull(),
  bankName: d.varchar("bank_name", { length: 256 }).notNull(),
  userId: varchar("user_id", { length: 50 }).notNull().references(() => users.id),
  fileId: integer("file_id")
    .references(() => files.id),
}));

export const files = createTable("files", (d) => ({
  id: serial("id").primaryKey(),
  name: d.varchar("name", { length: 256 }).notNull(),
  path: d.varchar("path", { length: 256 }).notNull(),
  dataHash: d.text("data_hash").notNull(),
  userId: varchar("user_id", { length: 50 }).notNull().references(() => users.id),
  extension: d.varchar("extension", { length: 256 }).notNull(),
}));
