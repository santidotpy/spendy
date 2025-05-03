import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";

export type RouterOutputs = inferRouterOutputs<AppRouter>;
export type TransactionOutput = RouterOutputs["transactions"]["getAll"][number];
