import type { RequestHandler } from "express";
import { log } from "../vite";

const MAX_LOG_LENGTH = 160;

function formatDuration(start: bigint): string {
  const elapsedMs = Number(process.hrtime.bigint() - start) / 1_000_000;
  return `${elapsedMs.toFixed(1)}ms`;
}

function serializeBody(body: unknown): string | null {
  if (body === undefined) {
    return null;
  }

  try {
    const serialised = JSON.stringify(body);
    return serialised.length > 0 ? serialised : null;
  } catch {
    return "[unserializable response]";
  }
}

function truncate(message: string): string {
  if (message.length <= MAX_LOG_LENGTH) {
    return message;
  }

  return `${message.slice(0, MAX_LOG_LENGTH - 3)}...`;
}

export const requestLogger: RequestHandler = (req, res, next) => {
  if (!req.path.startsWith("/api")) {
    return next();
  }

  const startedAt = process.hrtime.bigint();
  let capturedJson: unknown;

  const originalJson = res.json.bind(res);
  res.json = ((body: unknown) => {
    capturedJson = body;
    return originalJson(body);
  }) as typeof res.json;

  res.on("finish", () => {
    const duration = formatDuration(startedAt);
    let line = `${req.method} ${req.path} ${res.statusCode} in ${duration}`;

    const bodyPreview = serializeBody(capturedJson);
    if (bodyPreview) {
      line += ` :: ${bodyPreview}`;
    }

    log(truncate(line));
  });

  next();
};

