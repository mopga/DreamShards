import { Router } from "express";
import { asyncHandler, sendOk } from "../utils/http";
import { assertContentKey, getContent } from "../services/contentService";

export const contentRouter = Router();

contentRouter.get(
  "/:key",
  asyncHandler(async (req, res) => {
    const key = req.params.key;
    assertContentKey(key);
    const data = await getContent(key);
    return sendOk(res, { data });
  }),
);
