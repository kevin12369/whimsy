// Whimsy Shuffle Phase 1.6 — download Kenney CC0 sprite packs and
// cache them under public/sprites/. Failure to download is
// non-fatal: assetLoader.safeAddSprite checks textures.exists(key)
// and falls back to a colored rectangle matching the Phase 1.5
// placeholder, so the game remains playable offline.
//
// Run: node scripts/download-assets.mjs
import { mkdirSync, existsSync, statSync, createWriteStream } from 'node:fs';
import { createHash } from 'node:crypto';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', 'public', 'sprites');
mkdirSync(root, { recursive: true });

// Kenney pack ZIP URLs (CC0). After the ZIP downloads, manual
// extraction + sprite role mapping is needed (see
// docs/design/2026-06-22-phase16-acceptance.md T1 step 4).
const PACK_URLS = {
  'toon-characters-1': 'https://kenney.nl/media/pages/assets/toon-characters-1/Toon_Characters_1.zip',
  'tiny-town':         'https://kenney.nl/media/pages/assets/tiny-town/Tiny_Town.zip',
  'ui-pack':           'https://kenney.nl/media/pages/assets/ui-pack/UI_Pack.zip',
};

for (const [packName, url] of Object.entries(PACK_URLS)) {
  const dest = join(root, `${packName}.zip`);
  if (existsSync(dest) && statSync(dest).size > 1000) {
    console.log(`skip ${packName} (cached, ${statSync(dest).size} bytes)`);
    continue;
  }
  console.log(`fetching ${packName} -> ${dest}`);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const hash = createHash('sha256');
    const tee = new Readable({ read() {} });
    res.body.pipeTo(new WritableStream({
      write(c) { tee.push(Buffer.from(c)); hash.update(c); },
    }));
    await pipeline(tee, createWriteStream(dest));
    console.log(`  ${packName} sha256 ${hash.digest('hex').slice(0, 16)}... ${statSync(dest).size} bytes`);
  } catch (err) {
    console.warn(`  ${packName} FAILED: ${err.message}`);
    console.warn('  Game will fall back to colored rectangles via safeAddSprite.');
  }
}

console.log('\nDone. Next step is manual extraction:');
console.log('  1. unzip public/sprites/toon-characters-1.zip');
console.log('  2. unzip public/sprites/tiny-town.zip');
console.log('  3. unzip public/sprites/ui-pack.zip');
console.log('  4. Copy chosen frames into public/sprites/{player,npc,item,...}.png');
console.log('See docs/design/2026-06-22-phase16-acceptance.md for the role list.');
