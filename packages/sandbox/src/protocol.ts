export const PROTOCOL_VERSION = 1 as const;

export type GameMessageType = 'game-ready' | 'score' | 'game-over' | 'error';

export const ALLOWED_MESSAGE_TYPES: readonly GameMessageType[] = [
  'game-ready',
  'score',
  'game-over',
  'error',
] as const;

export interface GameMessage {
  type: GameMessageType;
  payload?: unknown;
}

export function isAllowedMessage(value: unknown): value is GameMessage {
  if (!value || typeof value !== 'object') return false;
  const t = (value as { type?: unknown }).type;
  return typeof t === 'string' && (ALLOWED_MESSAGE_TYPES as readonly string[]).includes(t);
}
