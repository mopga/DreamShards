import { Router } from "express";
import path from "path";
import fs from "fs/promises";

const allowedKeys = new Set(["skills", "enemies", "palaceFear", "dialogueBeach"]);

export const contentRouter = Router();

contentRouter.get("/:key", async (req, res, next) => {
  try {
    const key = req.params.key;
    if (!allowedKeys.has(key)) {
      return res.status(404).json({ ok: false, message: "content not found" });
    }

    const filePath = path.resolve(process.cwd(), "shared", "content", `${key}.json`);
    const raw = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(raw);

    res.json({ ok: true, data });
  } catch (error) {
    next(error);
  }
});