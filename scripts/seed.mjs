// Usage: node scripts/seed.mjs <id> [path/to/game.html]
// Uploads a game.html to local R2 (via wrangler) and inserts a D1 row.
import { readFile } from 'node:fs/promises';

const id = process.argv[2] ?? 'demo';
const path = process.argv[3] ?? './samples/space-mario.html';

const html = await readFile(path, 'utf8');
console.log(`Uploading ${html.length} bytes to local R2 as games/${id}.html`);
console.log('Run: wrangler r2 object put games/games/' + id + '.html --file ' + path);
console.log('And:  wrangler d1 execute whimsy --local --command "INSERT INTO game_history VALUES (...)"');
