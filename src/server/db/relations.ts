import { relations } from "drizzle-orm";
import { transactions, cards } from "./schema";

export const transactionsRelations = relations(transactions, ({ one }) => ({
  card: one(cards, {
    fields: [transactions.cardId],
    references: [cards.id],
  }),
}));

export const cardRelations = relations(cards, ({ many }) => ({
  transactions: many(transactions),
}));
