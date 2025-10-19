import type { Config } from "drizzle-kit";

export default {
  schema: "./drizzle/schema",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
