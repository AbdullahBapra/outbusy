import { ZodError, type ZodType } from "zod";
import { BlogError, type BlogErrorCode } from "@/lib/blog/service";

/**
 * Shared helpers for Route Handlers under app/api.
 *
 * Success: `{ "data": …, "meta"?: … }`
 * Error:   `{ "error": { "code": "…", "message": "…", "details"?: …, "requestId": "…" } }`
 */

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
    readonly headers?: HeadersInit,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

const MAX_BODY_BYTES = 1_000_000; // 1 MB of JSON is plenty for a long article.

/** Public read endpoints may be called from any origin; writes are server-to-server. */
export const CORS_READ_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

export const CACHE_PUBLIC = "public, s-maxage=60, stale-while-revalidate=600";
export const CACHE_NONE = "no-store";

type JsonInit = { status?: number; headers?: HeadersInit; cache?: string };

export function json(body: unknown, { status = 200, headers, cache = CACHE_NONE }: JsonInit = {}) {
  const h = new Headers(headers);
  if (!h.has("Cache-Control")) h.set("Cache-Control", cache);
  return Response.json(body, { status, headers: h });
}

export const ok = <T>(data: T, init?: JsonInit & { meta?: Record<string, unknown> }) =>
  json(init?.meta ? { data, meta: init.meta } : { data }, init);

export const noContent = () => new Response(null, { status: 204, headers: { "Cache-Control": CACHE_NONE } });

export const preflight = () => new Response(null, { status: 204, headers: CORS_READ_HEADERS });

/** Reads and validates a JSON body (rejects wrong content type, oversize and malformed JSON). */
export async function readJson<T>(req: Request, schema: ZodType<T>): Promise<T> {
  if (!req.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    throw new HttpError(415, "unsupported_media_type", "Send the body as JSON with Content-Type: application/json.");
  }
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) throw new HttpError(413, "payload_too_large", "Request body is larger than 1 MB.");

  const raw = await req.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) throw new HttpError(413, "payload_too_large", "Request body is larger than 1 MB.");

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    throw new HttpError(400, "invalid_json", "Request body is not valid JSON.");
  }
  return schema.parse(body);
}

export function parseQuery<T>(url: URL, schema: ZodType<T>): T {
  return schema.parse(Object.fromEntries(url.searchParams));
}

const BLOG_STATUS: Record<BlogErrorCode, number> = {
  not_found: 404,
  conflict: 409,
  invalid: 422,
  not_configured: 503,
  database: 500,
};

function toErrorResponse(err: unknown, requestId: string, extraHeaders?: HeadersInit) {
  const headers = new Headers(extraHeaders);
  headers.set("X-Request-Id", requestId);
  const body = (status: number, code: string, message: string, details?: unknown) =>
    json({ error: { code, message, ...(details === undefined ? {} : { details }), requestId } }, { status, headers });

  if (err instanceof HttpError) {
    new Headers(err.headers).forEach((v, k) => headers.set(k, v));
    return body(err.status, err.code, err.message, err.details);
  }
  if (err instanceof ZodError) {
    const details = err.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
    return body(422, "validation_failed", "The request contains invalid fields.", details);
  }
  if (err instanceof BlogError) {
    return body(BLOG_STATUS[err.code], err.code, err.message, err.field ? [{ path: err.field, message: err.message }] : undefined);
  }
  console.error(`[api] ${requestId} unhandled error:`, err);
  return body(500, "internal_error", "Something went wrong. Please try again.");
}

type Handler<C> = (req: Request, ctx: C, requestId: string) => Promise<Response>;

/** Wraps a Route Handler: request id, error mapping and optional extra headers (e.g. CORS). */
export function route<C>(handler: Handler<C>, extraHeaders?: HeadersInit) {
  return async (req: Request, ctx: C): Promise<Response> => {
    const requestId = req.headers.get("x-request-id")?.slice(0, 100) || crypto.randomUUID();
    try {
      const res = await handler(req, ctx, requestId);
      res.headers.set("X-Request-Id", requestId);
      new Headers(extraHeaders).forEach((v, k) => res.headers.set(k, v));
      return res;
    } catch (err) {
      return toErrorResponse(err, requestId, extraHeaders);
    }
  };
}

