import type { ZodError } from "zod";

export interface CoercePositiveIntOptions {
  defaultValue: number;
  min?: number;
  max?: number;
}

function normalizeCandidate(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return null;
    }

    const parsed = Number.parseInt(trimmed, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? normalizeCandidate(value[0]) : null;
  }

  return null;
}

export function coercePositiveInt(
  value: unknown,
  { defaultValue, min = 1, max = Number.MAX_SAFE_INTEGER }: CoercePositiveIntOptions,
): number {
  const candidate = normalizeCandidate(value);

  if (candidate === null) {
    return defaultValue;
  }

  if (candidate < min) {
    return min;
  }

  if (candidate > max) {
    return max;
  }

  return Math.floor(candidate);
}

export function formatZodError(error: ZodError): string {
  const [firstIssue] = error.issues;
  if (!firstIssue) {
    return "invalid payload";
  }

  const path = firstIssue.path.join(".");
  const prefix = path ? `${path}: ` : "";
  return `${prefix}${firstIssue.message}`;
}
