import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const saves = sqliteTable("saves", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s','now'))`),
  payload: text("payload", { mode: "json" }).notNull()
});

export type InsertSave = typeof saves.$inferInsert;
export type SaveRecord = typeof saves.$inferSelect;