import { Hono } from 'hono';
import type { Env } from './types';
import { generate } from './routes/generate';
import { games } from './routes/games';
import { g } from './routes/g';
import { reportError } from './routes/reportError';
import { health } from './routes/health';

export { newGameId } from './ids';
export { putGame, getGame } from './persist/r2';
export { insertGameHistory, getGameById, listRecent } from './persist/d1';
export { orchestrate } from './orchestrator';

const app = new Hono<{ Bindings: Env }>();
app.route('/', generate);
app.route('/', games);
app.route('/', g);
app.route('/', reportError);
app.route('/', health);

app.get('/', (c) => c.text('whimsy-api ok'));

export default app;
