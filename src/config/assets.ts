export interface AssetEntry {
  id: string;
  url: string;
  license: string;
  attribution?: string;
  sha256: string;
  path: string;
  bytes: number;
}

export const ASSET_MANIFEST: AssetEntry[] = [
  { id: 'kenney-ui',         url: 'https://kenney.nl/media/pages/assets/ui-pack/kenney_ui-pack.zip',
    license: 'CC0', sha256: 'PENDING', path: 'sprites/kenney-ui/', bytes: 0 },
  { id: 'cafedraw-cards',    url: 'https://cafedraw.itch.io/fantasy-card-assets',
    license: 'Royalty-Free', attribution: 'cafeDraw', sha256: 'PENDING', path: 'sprites/cafedraw-cards/', bytes: 0 },
  { id: 'mixkit-sfx',        url: 'https://mixkit.co/free-sound-effects/game/',
    license: 'Mixkit License', sha256: 'PENDING', path: 'sfx/mixkit/', bytes: 0 },
  { id: 'phaser-examples',   url: 'https://github.com/phaserjs/examples/tree/master/public/assets',
    license: 'MIT', sha256: 'PENDING', path: 'sprites/phaser-examples/', bytes: 0 },
];