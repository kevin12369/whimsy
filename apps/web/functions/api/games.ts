import type { PagesFunction } from '../types';

export const onRequestGet: PagesFunction = async ({ request, env }) => {
  const target = (env as { API_BASE?: string }).API_BASE ?? '';
  const res = await fetch(`${target}/api/games${new URL(request.url).search}`, { headers: request.headers });
  return new Response(res.body, { status: res.status, headers: res.headers });
};
