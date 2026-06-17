// Ambient declarations for vitest global setup.
// Mount target injected by tests/setup.ts so Phaser templates can resolve
// `parent: window.__WHIMSY_G__` at module-load time without DOM.
declare global {
  // eslint-disable-next-line no-var
  var __WHIMSY_G__: HTMLElement | undefined;
}
export {};
