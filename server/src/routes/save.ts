import { Router } from "express";
import { insertSave, getSave, listSaves } from "../db/drizzle";
import type { InsertSave } from "../db/schema";
import { savePayloadSchema } from "../schemas/appState";
import { asyncHandler, sendCreated, sendError, sendOk } from "../utils/http";
import { coercePositiveInt, formatZodError } from "../utils/validation";

export const saveRouter = Router();

saveRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const parseResult = savePayloadSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(res, 400, formatZodError(parseResult.error));
    }

    const { state } = parseResult.data;
    const id = await insertSave(state as InsertSave["payload"]);
    return sendCreated(res, { id });
  }),
);

saveRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const limit = coercePositiveInt(req.query.limit, { defaultValue: 5, min: 1, max: 25 });
    const saves = await listSaves(limit);
    return sendOk(res, { saves });
  }),
);


saveRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) {
      return sendError(res, 400, "invalid id");
    }

    const record = await getSave(id);
    if (!record) {
      return sendError(res, 404, "not found");
    }

    return sendOk(res, { save: record });
  }),
);
