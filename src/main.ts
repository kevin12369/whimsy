import Phaser from 'phaser';
import { BootScene } from './phaser/scenes/BootScene';
import { PlayerTestScene } from './phaser/scenes/PlayerTestScene';
import { PHASER_VERSION } from './phaser/version';

export { PHASER_VERSION };

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  width: 1280,
  height: 720,
  backgroundColor: '#000000',
  scene: [BootScene, PlayerTestScene],
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
};

new Phaser.Game(config);
