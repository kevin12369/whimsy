import Phaser from 'phaser';
import { BootScene } from './phaser/scenes/BootScene';
import { PlayerTestScene } from './phaser/scenes/PlayerTestScene';
import { MenuScene } from './phaser/scenes/MenuScene';
import { EchoArchiveScene } from './phaser/scenes/EchoArchiveScene';
import { DomainSelectScene } from './phaser/scenes/DomainSelectScene';
import { InventoryScene } from './phaser/scenes/InventoryScene';
import { GameScene } from './phaser/scenes/GameScene';
import { EndingScene } from './phaser/scenes/EndingScene';
import { HandScene } from './phaser/scenes/HandScene';
import { FusionAltarScene } from './phaser/scenes/FusionAltarScene';
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
  scene: [
    BootScene,
    MenuScene,
    EchoArchiveScene,
    DomainSelectScene,
    InventoryScene,
    GameScene,
    HandScene,
    FusionAltarScene,
    SettingsScene,
    LevelSelectScene,
    PauseScene,
    PlayerTestScene,
    EndingScene,
  ],
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
};

new Phaser.Game(config);