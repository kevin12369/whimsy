import { writeFileSync, mkdirSync, existsSync, statSync, createWriteStream } from 'node:fs';
import { createHash } from 'node:crypto';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', 'public');
const manifestPath = join(__dirname, '..', 'src', 'config', 'assets.ts');

const manifest = [
  { id: 'kenney-ui',       url: 'https://kenney.nl/media/pages/assets/ui-pack/kenney_ui-pack.zip',    path: 'sprites/kenney-ui/',     license: 'CC0' },
  { id: 'phaser-examples', url: 'https://raw.githubusercontent.com/phaserjs/examples/master/public/assets/dude.png', path: 'sprites/phaser-examples/', license: 'MIT' },
  { id: 'phaser-star',     url: 'https://raw.githubusercontent.com/phaserjs/examples/master/public/assets/star.png', path: 'sprites/phaser-examples/', license: 'MIT' },
];

for (const a of manifest) {
  const dest = join(root, a.path);
  if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
  const out = join(dest, a.url.split('/').pop());
  if (existsSync(out)) { console.log('skip', out); continue; }
  console.log('fetch', a.url, '->', out);
  const res = await fetch(a.url);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${a.url}`);
  const hash = createHash('sha256');
  const tee = new Readable({ read() {} });
  res.body.pipeTo(new WritableStream({ write(c) { tee.push(Buffer.from(c)); hash.update(c); } }));
  await pipeline(tee, createWriteStream(out));
  console.log('  sha256', hash.digest('hex'), statSync(out).size, 'bytes');
}
console.log('Done. Manually update src/config/assets.ts with sha256 + bytes after first run.');