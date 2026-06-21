export interface Physics { gravity: number; restitution: number; friction: number; }

export function defaultPhysics(): Physics {
  return { gravity: 800, restitution: 0.3, friction: 0.5 };
}

export function applyPhysics(_current: Physics, card: Physics): Physics {
  return { ...card };
}