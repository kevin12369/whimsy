/**
 * Item use effects — what happens when the player activates an item from inventory.
 * Effects now depend on which realm the player is in.
 */

export type ItemCategory = 'fire' | 'ice' | 'light' | 'cutting' | 'healing' | 'detection' | 'disruption';

export type ItemEffect = {
  label: string;
  requiresWater: boolean;
};

const ITEM_CATEGORIES: Record<string, ItemCategory> = {
  'ember shard': 'fire', 'ash flake': 'fire',
  'brine comet': 'ice', 'frost splinter': 'ice', 'tide coin': 'ice',
  'lantern wisp': 'light', 'sun coin': 'light', 'pickled star': 'light',
  'cyan blade': 'cutting', 'vine whip': 'cutting', 'glass fang': 'cutting',
  'rose potion': 'healing', 'dill drone': 'healing',
  'amber bead': 'detection', 'rune fragment': 'detection', 'echo shard': 'detection',
  'ferment orb': 'disruption', 'sour drop': 'disruption', 'gloam thread': 'disruption',
};

export function getItemCategory(itemName: string): ItemCategory | undefined {
  return ITEM_CATEGORIES[itemName];
}

export function getItemEffect(itemName: string): ItemEffect | null {
  const cat = ITEM_CATEGORIES[itemName];
  if (!cat) return null;
  const needsWater = cat === 'ice';
  return { label: itemName, requiresWater: needsWater };
}

export type EffectContext = {
  tilemap: number[];
  w: number;
  h: number;
  playerTileX: number;
  playerTileY: number;
  realmId?: string;
};

export function executeItemEffect(itemName: string, ctx: EffectContext): string | null {
  const { tilemap, w, h, playerTileX, playerTileY, realmId } = ctx;
  const cat = ITEM_CATEGORIES[itemName];
  const tileVal = (x: number, y: number) => (x >= 0 && x < w && y >= 0 && y < h) ? tilemap[y * w + x] : -1;
  const setTile = (x: number, y: number, v: number) => { if (x >= 0 && x < w && y >= 0 && y < h) tilemap[y * w + x] = v; };
  const isWall = (x: number, y: number) => tileVal(x, y) === 1;
  const isWater = (x: number, y: number) => tileVal(x, y) === 2;

  switch (cat) {
    // ─── FIRE: Burn things ────────────────────────────────────
    case 'fire': {
      if (realmId === 'forest' || realmId === 'jungle') {
        // Burn nearby plants (tile 3/4 → floor)
        let burned = 0;
        for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
          const x = playerTileX + dx, y = playerTileY + dy;
          if (tileVal(x, y) === 3 || tileVal(x, y) === 4) { setTile(x, y, 0); burned++; }
        }
        if (burned > 0) return `火焰烧掉了 ${burned} 片植被！`;
        return '附近没有可燃烧的植被。';
      }
      if (realmId === 'ocean') {
        // Evaporate water (irreversible)
        let evap = 0;
        for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
          if (isWater(playerTileX + dx, playerTileY + dy)) { setTile(playerTileX + dx, playerTileY + dy, 0); evap++; }
        }
        if (evap > 0) return `蒸汽升腾，${evap} 格水面蒸发了！`;
        return '附近没有水。';
      }
      if (realmId === 'desert') {
        // Heat wave reveals hidden paths
        let found = 0;
        for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
          if (isWall(playerTileX + dx, playerTileY + dy) && Math.random() < 0.3) { setTile(playerTileX + dx, playerTileY + dy, 0); found++; }
        }
        if (found > 0) return `热浪融化了 ${found} 面沙墙！`;
        return '热浪消散，没有变化。';
      }
      if (realmId === 'dungeon') {
        // Torch — light up a radius
        let lit = 0;
        for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
          const x = playerTileX + dx, y = playerTileY + dy;
          if (isWall(x, y) && Math.abs(dx) + Math.abs(dy) <= 3) {
            if (Math.random() < 0.4) { setTile(x, y, 0); lit++; }
          }
        }
        if (lit > 0) return `火光驱散了黑暗，${lit} 面墙消失了！`;
        return '火光闪烁了一下就熄灭了。';
      }
      return '火焰在这里没有什么可烧的。';
    }

    // ─── ICE: Freeze water ✅ (works everywhere with water) ───
    case 'ice': {
      let frozen = 0;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        if (isWater(playerTileX + dx, playerTileY + dy)) { setTile(playerTileX + dx, playerTileY + dy, 0); frozen++; }
      }
      if (frozen > 0) return `冻结了 ${frozen} 格水面！`;
      // If no water, create a temporary ice patch
      if (realmId === 'tundra') {
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          if (tileVal(playerTileX + dx, playerTileY + dy) === 3) { setTile(playerTileX + dx, playerTileY + dy, 0); frozen++; }
        }
        if (frozen > 0) return `冰霜覆盖了地面！`;
      }
      return '附近没有水。';
    }

    // ─── LIGHT: Reveal / illuminate ──────────────────────────
    case 'light': {
      if (realmId === 'dungeon' || realmId === 'haunted') {
        for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
          if (isWall(playerTileX + dx, playerTileY + dy) && Math.abs(dx) + Math.abs(dy) <= 4) {
            if (Math.random() < 0.5) setTile(playerTileX + dx, playerTileY + dy, 0);
          }
        }
        return '光芒照亮了周围，隐藏的通道显现了！';
      }
      if (realmId === 'forest' || realmId === 'jungle') {
        for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
          const v = tileVal(playerTileX + dx, playerTileY + dy);
          if (v === 3 || v === 4) setTile(playerTileX + dx, playerTileY + dy, 0);
        }
        return '光芒穿透了植被的覆盖！';
      }
      return '光芒向四周扩散，但没有特别的效果。';
    }

    // ─── CUTTING: Clear obstacles ────────────────────────────
    case 'cutting': {
      if (realmId === 'forest' || realmId === 'jungle') {
        let cut = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -2; dx <= 2; dx++) {
          if (tileVal(playerTileX + dx, playerTileY + dy) === 3 || tileVal(playerTileX + dx, playerTileY + dy) === 4) {
            setTile(playerTileX + dx, playerTileY + dy, 0); cut++;
          }
        }
        if (cut > 0) return `斩断了 ${cut} 处藤蔓植被！`;
      }
      if (realmId === 'dungeon') {
        let cut = 0;
        for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
          if (isWall(playerTileX + dx, playerTileY + dy) && Math.abs(dx) + Math.abs(dy) <= 2) {
            if (Math.random() < 0.25) { setTile(playerTileX + dx, playerTileY + dy, 0); cut++; }
          }
        }
        if (cut > 0) return `刃光闪过，${cut} 面墙被切开了！`;
      }
      return '附近没有可切割的障碍物。';
    }

    // ─── HEALING ─────────────────────────────────────────────
    case 'healing':
      return '你感到一阵温暖流过全身！';

    // ─── DETECTION ───────────────────────────────────────────
    case 'detection': {
      let count = 0;
      for (let y = playerTileY - 5; y <= playerTileY + 5; y++) for (let x = playerTileX - 5; x <= playerTileX + 5; x++) {
        if (tileVal(x, y) === 1 && Math.random() < 0.15) { setTile(x, y, 0); count++; }
      }
      if (count > 0) return `探测到 ${count} 处隐藏通道！`;
      return '周围没有隐藏结构。';
    }

    // ─── DISRUPTION ──────────────────────────────────────────
    case 'disruption': {
      let changed = 0;
      for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
        const v = tileVal(playerTileX + dx, playerTileY + dy);
        if (v === 1) { setTile(playerTileX + dx, playerTileY + dy, 0); changed++; }
      }
      if (changed > 0) return `空间扰动改变了 ${changed} 格地形！`;
      return '什么都没有发生。';
    }

    default:
      return null;
  }
}
