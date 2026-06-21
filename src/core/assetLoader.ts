import Phaser from 'phaser';

export function loadAtlas(scene: Phaser.Scene, key: string, pngPath: string, jsonPath: string) {
  scene.load.atlas(key, pngPath, jsonPath);
}

export function loadImage(scene: Phaser.Scene, key: string, path: string) {
  scene.load.image(key, path);
}

export function loadAudio(scene: Phaser.Scene, key: string, paths: string | string[]) {
  scene.load.audio(key, Array.isArray(paths) ? paths : [paths]);
}