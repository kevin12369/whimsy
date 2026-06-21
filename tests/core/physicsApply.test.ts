import { describe, it, expect } from 'vitest';
import { applyPhysics, defaultPhysics } from '../../src/core/physicsApply';

describe('physicsApply', () => {
  it('default physics is gravity=800 restitution=0.3 friction=0.5', () => {
    expect(defaultPhysics()).toEqual({ gravity: 800, restitution: 0.3, friction: 0.5 });
  });

  it('applyPhysics returns new state with card values', () => {
    const card = { gravity: 200, restitution: 0.95, friction: 0.1 };
    const next = applyPhysics(defaultPhysics(), card);
    expect(next).toEqual(card);
  });
});