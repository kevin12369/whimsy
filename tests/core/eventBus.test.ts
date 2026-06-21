import { describe, it, expect, vi } from 'vitest';
import { createBus } from '../../src/core/eventBus';

describe('eventBus', () => {
  it('emits and receives typed events', () => {
    const bus = createBus<{ ping: { from: string } }>();
    const fn = vi.fn();
    bus.on('ping', fn);
    bus.emit('ping', { from: 'a' });
    expect(fn).toHaveBeenCalledWith({ from: 'a' });
  });

  it('off removes listener', () => {
    const bus = createBus<{ ping: void }>();
    const fn = vi.fn();
    const off = bus.on('ping', fn);
    off();
    bus.emit('ping');
    expect(fn).not.toHaveBeenCalled();
  });
});
