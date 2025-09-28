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

const sqlite = new Database(defaultPath);
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