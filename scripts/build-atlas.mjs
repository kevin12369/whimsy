// Run: `pnpm add -D free-tex-packer` then `node scripts/build-atlas.mjs`
// Reads /public/sprites/raw/{tiles,items,npcs,ui}/*.png and emits
// /public/sprites/atlas/{cards,items,npcs,tiles}.{png,json}
import { glob } from 'node:fs/promises';
import { pack } from 'free-tex-packer';

const jobs = [
  { name: 'cards', dir: 'public/sprites/raw/cards',  out: 'public/sprites/atlas' },
  { name: 'items', dir: 'public/sprites/raw/items',  out: 'public/sprites/atlas' },
  { name: 'npcs',  dir: 'public/sprites/raw/npcs',   out: 'public/sprites/atlas' },
  { name: 'tiles', dir: 'public/sprites/raw/tiles',  out: 'public/sprites/atlas' },
];

for (const j of jobs) {
  const files = [];
  for await (const f of glob(`${j.dir}/**/*.png`)) files.push(f);
  await pack(files, { textureName: j.name, fixedSize: false, padding: 2, detectIdentical: true }, j.out);
  console.log(`atlas ${j.name}: ${files.length} frames`);
}