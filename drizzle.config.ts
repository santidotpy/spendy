import { type Config } from "drizzle-kit";

import { env } from "~/env";

const isDBPush = process.env.DB_PUSH === "true";
const DB_URL = isDBPush
  ? env.DATABASE_URL.replace(`6543`, `5432`)
  : env.DATABASE_URL;

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: DB_URL,
  },
  tablesFilter: ["spendy_*"],
} satisfies Config;
