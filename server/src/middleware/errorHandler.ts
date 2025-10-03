import type { ErrorRequestHandler } from "express";
import { log } from "../vite";
import { resolveStatusCode, sendError } from "../utils/http";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = resolveStatusCode(err);
  const message = err?.message?.trim?.() ? err.message : "Internal Server Error";

  log(`${status} ${message}`, "error");

  return sendError(res, status, message);
};

