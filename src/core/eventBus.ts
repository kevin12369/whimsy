export type Listener<T> = (payload: T) => void;
export type Unsubscribe = () => void;
export type EventMap = Record<string, unknown>;

export interface Bus<E extends EventMap> {
  on<K extends keyof E>(event: K, fn: Listener<E[K]>): Unsubscribe;
  emit<K extends keyof E>(event: K, ...args: E[K] extends void ? [] : [payload: E[K]]): void;
}

export function createBus<E extends EventMap>(): Bus<E> {
  const listeners = new Map<keyof E, Set<Listener<unknown>>>();
  return {
    on(event, fn) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(fn as Listener<unknown>);
      return () => listeners.get(event)?.delete(fn as Listener<unknown>);
    },
    emit(event, ...args) {
      const payload = args[0] as E[typeof event];
      listeners.get(event)?.forEach(fn => fn(payload));
    },
  };
}

export const gameBus = createBus<{
  'card:picked-up': { cardId: string };
  'card:played-physics': { cardId: string };
  'fusion:complete': { fusedItemId: string };
  'hidden:unlocked': { hiddenLevelId: string };
  'level:exit': { levelIndex: number };
  'npc:dialogue': { npcId: string; line: string };
}>();
