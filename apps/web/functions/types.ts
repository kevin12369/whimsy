// Minimal PagesFunction type shim for type checking & test mocking.
// In production, Cloudflare Pages provides this via @cloudflare/workers-types.
export interface EventContext<Env = unknown, Params extends string = string> {
  request: Request;
  env: Env;
  params: Record<Params, string>;
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
  next(input?: Request | string, init?: RequestInit): Promise<Response>;
  data: unknown;
}

export type PagesFunction<Env = unknown, Params extends string = string> = (context: EventContext<Env, Params>) => Response | Promise<Response>;
