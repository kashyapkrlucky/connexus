import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(message: string, status = 400, headers?: HeadersInit) {
  return NextResponse.json({ error: message }, { status, headers });
}

export class ApiError extends Error {
  status: number;
  /** Seconds until the client may retry; sent as Retry-After (used for 429s). */
  retryAfter?: number;
  constructor(message: string, status = 400, retryAfter?: number) {
    super(message);
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    const headers = error.retryAfter ? { "Retry-After": String(error.retryAfter) } : undefined;
    return jsonError(error.message, error.status, headers);
  }
  if (error instanceof ZodError) {
    return jsonError(error.issues[0]?.message ?? "Invalid request", 422);
  }
  console.error(error);
  return jsonError("Internal server error", 500);
}
