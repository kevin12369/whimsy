// Public surface of @whimsy/runtime.
// Templates import from here; React components import `mount`.

export type { KAPLAYCtx } from 'kaplay';

export type { GameConfig, GameType } from './config';
export { GAME_TYPES, clampConfig, defaultConfig } from './config';

export type { Theme } from './theme';
export type { Template } from './template';

export { mount } from './canvas-mount';
export type { MountOptions } from './canvas-mount';

export * from './spec';
export * from './level-generator';
