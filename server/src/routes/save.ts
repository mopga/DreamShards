import { Router } from "express";
import { insertSave, getSave, listSaves } from "../db/drizzle";

export const saveRouter = Router();

saveRouter.post("/", async (req, res, next) => {
  try {
    const { state } = req.body ?? {};
    if (!state || typeof state !== "object") {
      return res.status(400).json({ ok: false, message: "state payload required" });
    }

    const id = await insertSave(state as any);
    res.status(201).json({ ok: true, id });
  } catch (error) {
    next(error);
  }
});

saveRouter.get("/", async (_req, res, next) => {
  try {
    const saves = await listSaves(5);
    res.json({ ok: true, saves });
  } catch (error) {
    next(error);
  }
});

saveRouter.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ ok: false, message: "invalid id" });
    }

    const record = await getSave(id);
    if (!record) {
      return res.status(404).json({ ok: false, message: "not found" });
    }

    res.json({ ok: true, save: record });
  } catch (error) {
    next(error);
  }
});