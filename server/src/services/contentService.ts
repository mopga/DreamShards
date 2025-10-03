import fs from "fs/promises";
import path from "path";
import { createHttpError } from "../utils/http";

const CONTENT_KEYS = ["skills", "enemies", "palaceFear", "dialogueBeach"] as const;
export type ContentKey = (typeof CONTENT_KEYS)[number];

const contentKeySet = new Set<ContentKey>(CONTENT_KEYS);
const contentDirectory = path.resolve(process.cwd(), "shared", "content");

interface CacheEntry {
  data: unknown;
  mtimeMs: number;
}

const cache = new Map<ContentKey, CacheEntry>();

export function isContentKey(value: string): value is ContentKey {
  return contentKeySet.has(value as ContentKey);
}

export function assertContentKey(value: string): asserts value is ContentKey {
  if (!isContentKey(value)) {
    throw createHttpError(404, "content not found");
  }
}

async function loadContentFromDisk(key: ContentKey) {
  const filePath = path.join(contentDirectory, `${key}.json`);

  try {
    const stat = await fs.stat(filePath);
    const cached = cache.get(key);

    if (cached && cached.mtimeMs === stat.mtimeMs) {
      return cached.data;
    }

    const raw = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(raw);

    cache.set(key, { data, mtimeMs: stat.mtimeMs });
    return data;
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === "ENOENT") {
      cache.delete(key);
      throw createHttpError(404, "content not found");
    }

    if (nodeError instanceof SyntaxError) {
      cache.delete(key);
      throw createHttpError(500, `Failed to parse content file: ${key}.json`);
    }

    throw error;
  }
}

export async function getContent(key: ContentKey) {
  return loadContentFromDisk(key);
}

export function invalidateContentCache(key?: ContentKey) {
  if (key) {
    cache.delete(key);
    return;
  }

  cache.clear();
}

