import type { D1Database } from '@cloudflare/workers-types';

export interface GameHistoryRow {
  id: string;
  prompt: string;
  genre: string;
  llm_model: string;
  attempts: number;
  final_status: 'ok' | 'failed';
  r2_key: string | null;
  error: string | null;
  byte_size: number;
  created_at: number;
}

export async function insertGameHistory(db: D1Database, row: GameHistoryRow): Promise<void> {
  await db.prepare(
    `INSERT INTO game_history
      (id, prompt, genre, llm_model, attempts, final_status, r2_key, error, byte_size, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
  ).bind(
    row.id, row.prompt, row.genre, row.llm_model, row.attempts,
    row.final_status, row.r2_key, row.error, row.byte_size, row.created_at,
  ).run();
}

export async function listRecent(db: D1Database, limit: number): Promise<GameHistoryRow[]> {
  const { results } = await db.prepare(
    `SELECT * FROM game_history WHERE final_status='ok' ORDER BY created_at DESC LIMIT ?`,
  ).bind(limit).all<GameHistoryRow>();
  return results ?? [];
}

export async function getGameById(db: D1Database, id: string): Promise<GameHistoryRow | null> {
  const row = await db.prepare(
    `SELECT * FROM game_history WHERE id = ?`,
  ).bind(id).first<GameHistoryRow>();
  return row ?? null;
}

export async function updateGameError(db: D1Database, id: string, error: string): Promise<void> {
  await db.prepare(
    `UPDATE game_history SET error = ? WHERE id = ?`,
  ).bind(error, id).run();
}
