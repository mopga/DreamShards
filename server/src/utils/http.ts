import type { NextFunction, Request, Response } from "express";

export interface HttpErrorLike extends Error {
  status?: number;
  statusCode?: number;
}

export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function createHttpError(status: number, message: string): HttpError {
  return new HttpError(status, message);
}

interface JsonBody {
  [key: string]: unknown;
}

export function sendOk(
  res: Response,
  body: JsonBody = {},
  status = 200,
): Response<JsonBody> {
  return res.status(status).json({ ok: true, ...body });
}

export function sendCreated(res: Response, body: JsonBody = {}): Response<JsonBody> {
  return sendOk(res, body, 201);
}

export function sendError(
  res: Response,
  status: number,
  message: string,
): Response<{ ok: false; message: string }> {
  return res.status(status).json({ ok: false, message });
}

type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

export function asyncHandler(handler: AsyncRouteHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export function resolveStatusCode(error: HttpErrorLike | null | undefined): number {
  if (!error) {
    return 500;
  }

  if (typeof error.status === "number") {
    return error.status;
  }

  if (typeof error.statusCode === "number") {
    return error.statusCode;
  }

  return 500;
}

