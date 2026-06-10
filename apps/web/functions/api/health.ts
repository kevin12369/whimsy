import type { PagesFunction } from '../types';

export const onRequestGet: PagesFunction = async ({ env }) => {
  const target = (env as { API_BASE?: string }).API_BASE ?? '';
  const res = await fetch(`${target}/api/health`);
  return new Response(res.body, { status: res.status, headers: res.headers });
};
