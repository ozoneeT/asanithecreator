// Minimal request/response shims so the handlers don't need @vercel/node types.
// Files prefixed with "_" are not routed by Vercel.

export interface ApiRequest {
  method?: string;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
}
export interface ApiResponse {
  status(code: number): ApiResponse;
  json(payload: unknown): void;
  setHeader(name: string, value: string): void;
}

export const headerValue = (req: ApiRequest, name: string): string | undefined => {
  const raw = req.headers[name] ?? req.headers[name.toLowerCase()];
  return Array.isArray(raw) ? raw[0] : raw;
};

/** Vercel pre-parses JSON bodies; guard against a string body just in case. */
export const jsonBody = (req: ApiRequest): Record<string, unknown> => {
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body) as Record<string, unknown>; } catch { return {}; }
  }
  return (req.body as Record<string, unknown>) ?? {};
};
