/**
 * Kenney Input Prompts key icon helper.
 * Renders a keyboard key icon from the loaded atlas, with fallback to text.
 * Frame names: keyboard_{a-z}, keyboard_space, keyboard_esc, keyboard_shift, etc.
 * Outline variants: keyboard_{key}_outline
 */
import type Phaser from 'phaser';

const KEY_FRAME_MAP: Record<string, string> = {
  w: 'keyboard_w',
  a: 'keyboard_a',
  s: 'keyboard_s',
  d: 'keyboard_d',
  e: 'keyboard_e',
  q: 'keyboard_q',
  i: 'keyboard_i',
  space: 'keyboard_space',
  esc: 'keyboard_escape',
  tab: 'keyboard_tab',
  shift: 'keyboard_shift',
  enter: 'keyboard_return',
  up: 'keyboard_up',
  down: 'keyboard_down',
  left: 'keyboard_left',
  right: 'keyboard_right',
  '1': 'keyboard_1',
  '2': 'keyboard_2',
  '3': 'keyboard_3',
};

/**
 * Create a key icon image at (x, y). Returns an Image if the atlas
 * frame is available, otherwise creates a styled Text fallback.
 */
export function createKeyIcon(
  scene: Phaser.Scene,
  key: string,
  x: number, y: number,
  size: number = 18,
  depth: number = 0,
  useOutline: boolean = true,
): Phaser.GameObjects.GameObject {
  const frame = KEY_FRAME_MAP[key.toLowerCase()];
  if (frame && scene.textures.exists('ui_keyboard_atlas')) {
    const frameName = useOutline ? `${frame}_outline` : frame;
    const tex = scene.textures.get('ui_keyboard_atlas');
    if (tex.has(frameName)) {
      const img = scene.add.image(x, y, 'ui_keyboard_atlas', frameName);
      img.setDisplaySize(size, size);
      img.setDepth(depth);
      img.setOrigin(0.5);
      return img;
    }
  }
  // Fallback: styled text
  const label = key.length === 1 ? key.toUpperCase() : key.slice(0, 3).toUpperCase();
  return scene.add.text(x, y, `[${label}]`, {
    fontSize: `${Math.max(10, size - 4)}px`,
    color: '#fff',
    fontStyle: 'bold',
    backgroundColor: '#333366',
    padding: { x: 3, y: 1 },
  }).setOrigin(0.5).setDepth(depth);
}
