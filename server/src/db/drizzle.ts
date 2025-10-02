import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq, desc } from "drizzle-orm";
import { saves, type InsertSave, type SaveRecord } from "./schema";

const defaultPath = process.env.DATABASE_FILE
  ? path.resolve(process.env.DATABASE_FILE)
  : path.resolve(process.cwd(), "server", "dreamshards.db");

fs.mkdirSync(path.dirname(defaultPath), { recursive: true });

const sqlite = (() => {
  const nativeBinding =
    typeof process.pkg !== "undefined"
      ? path.join(path.dirname(process.execPath), "better_sqlite3.node")
      : undefined;

  const options = nativeBinding ? { nativeBinding } : undefined;
  return new Database(defaultPath, options);
})();

function ensureSchema(database: typeof sqlite) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS "saves" (
      "id" integer PRIMARY KEY AUTOINCREMENT,
      "created_at" integer NOT NULL DEFAULT (strftime('%s','now')),
      "payload" text NOT NULL
    )
  `);
}

ensureSchema(sqlite);

export const db = drizzle(sqlite);

export async function insertSave(payload: InsertSave["payload"]): Promise<number> {
  const result = db.insert(saves).values({ payload }).run();
  return Number(result.lastInsertRowid);
}

export async function getSave(id: number): Promise<SaveRecord | undefined> {
  return db.select().from(saves).where(eq(saves.id, id)).get();
}

export async function listSaves(limit = 10): Promise<SaveRecord[]> {
  return db.select().from(saves).orderBy(desc(saves.createdAt)).limit(limit).all();
}