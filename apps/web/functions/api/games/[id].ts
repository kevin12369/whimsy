import type { PagesFunction } from '../../types';

export const onRequestGet: PagesFunction = async ({ request, env, params }) => {
  const target = (env as { API_BASE?: string }).API_BASE ?? '';
  const id = (params as { id: string }).id;
  const res = await fetch(`${target}/api/games/${id}`, { headers: request.headers });
  return new Response(res.body, { status: res.status, headers: res.headers });
};
