import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";


export type RouterOutput = inferRouterOutputs<AppRouter>;
export type TransactionOutput = RouterOutput["statement"]["parseText"]["transactions"][number];