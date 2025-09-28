import { defineConfig } from "drizzle-kit";
import path from "path";

const databaseFile = process.env.DATABASE_FILE
  ? path.resolve(process.env.DATABASE_FILE)
  : path.resolve(process.cwd(), "server", "dreamshards.db");

export default defineConfig({
  schema: "./server/src/db/schema.ts",
  out: "./server/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: databaseFile,
  },
});