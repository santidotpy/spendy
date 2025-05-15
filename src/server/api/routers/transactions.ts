// src/server/api/routers/statement.ts
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import OpenAI from "openai";
import { transactions } from "~/server/db/schema";

const TransactionSchema = z.array(
  z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    description: z.string(),
    amount: z.number(),
    currency: z.enum(["ARS", "USD"]),
    category: z.string(),
  }),
);

export const transactionsRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const myTransactions = await ctx.db.query.transactions.findMany({
      where: (transactions, { eq }) => eq(transactions.userId, ctx.userId),
      orderBy: (transactions, { desc }) => [desc(transactions.date)],
    });
    return myTransactions;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const transaction = await ctx.db.query.transactions.findFirst({
        where: (transactions, { eq, and }) =>
          and(
            eq(transactions.id, input.id),
            eq(transactions.userId, ctx.userId),
          ),
      });
      return transaction;
    }),
});
