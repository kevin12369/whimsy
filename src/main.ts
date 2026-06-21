import Phaser from 'phaser';
import { BootScene } from './phaser/scenes/BootScene';
import { PlayerTestScene } from './phaser/scenes/PlayerTestScene';
import { MenuScene } from './phaser/scenes/MenuScene';
import { GameScene } from './phaser/scenes/GameScene';
import { HandScene } from './phaser/scenes/HandScene';
import { LevelSelectScene } from './phaser/scenes/LevelSelectScene';
import { SettingsScene } from './ui/SettingsPanel';
import { PauseScene } from './phaser/scenes/PauseScene';
import { PHASER_VERSION } from './phaser/version';

export { PHASER_VERSION };

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  width: 1280,
  height: 720,
  backgroundColor: '#000000',
  scene: [BootScene, MenuScene, GameScene, HandScene, SettingsScene, LevelSelectScene, PauseScene, PlayerTestScene],
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
};

new Phaser.Game(config);