import type { FusedItem } from './cardSystem';
import { uuid } from '../utils/uuid';

const TABLE: Record<string, Omit<FusedItem, 'id' | 'fusedFrom'>> = {
  'brine comet|vine whip':      { name: 'Brine Lash',      spriteKey: 'whip_blue',    behavior: 'extends and splashes on impact', stackable: false },
  'cyan blade|violet blade':    { name: 'Prism Sword',     spriteKey: 'sword_cyan',   behavior: 'hums and refracts',              stackable: false },
  'pickled star|ferment orb':   { name: 'Glow Pickle',     spriteKey: 'orb_yellow',   behavior: 'glows brighter when stored',     stackable: false },
  'dill drone|rose potion':     { name: 'Dill Bloom',      spriteKey: 'potion_pink',  behavior: 'follows player and heals',       stackable: false },
  'ember shard|tide coin':      { name: 'Sunset Tally',    spriteKey: 'whip_red',     behavior: 'leaves a glowing trail',         stackable: false },
  'moss pebble|glass fang':     { name: 'Green Splinter',  spriteKey: 'orb_green',    behavior: 'grows a thorn on impact',        stackable: false },
  'rune fragment|lantern wisp': { name: 'Pulse Lantern',   spriteKey: 'shield_gold',  behavior: 'pulses with player heartbeat',   stackable: false },
  'brine pearl|saltspun coin':  { name: 'Brine Cache',     spriteKey: 'potion_pink',  behavior: 'gravity flips in radius',        stackable: false },
  'charcoal twig|amber bead':   { name: 'Ash Memory',      spriteKey: 'whip_red',     behavior: 'leaves a slowly-fading line',    stackable: false },
  'fern chip|prism chip':       { name: 'Prism Fern',      spriteKey: 'sword_cyan',   behavior: 'splits light into 4 directions', stackable: false },
  'echo shard|wax bell':        { name: 'Bell Echo',       spriteKey: 'sword_violet', behavior: 'repeats the last step tone',     stackable: false },
  'sour drop|glass mote':       { name: 'Sour Drift',      spriteKey: 'potion_pink',  behavior: 'reverses on collision',          stackable: false },
  'ash flake|sun coin':         { name: 'Ember Coin',      spriteKey: 'orb_yellow',   behavior: 'dims then brightens a tile',     stackable: false },
  'spore sac|frost splinter':   { name: 'Frost Spore',     spriteKey: 'sword_cyan',   behavior: 'freezes nearby water tiles',     stackable: false },
  'gloam thread|marrow bead':   { name: 'Gloam Marrow',    spriteKey: 'shield_gold',  behavior: 'darkens and absorbs one hit',    stackable: false },
  'vine whip|rose potion':      { name: 'Vine Bloom',      spriteKey: 'potion_pink',  behavior: 'grows and heals over time',      stackable: false },
};

export function fuseItems(a: string, b: string): FusedItem | null {
  const key1 = `${a}|${b}`;
  const key2 = `${b}|${a}`;
  const t = TABLE[key1] ?? TABLE[key2];
  if (!t) return null;
  return {
    id: uuid(),
    ...t,
    fusedFrom: { type: 'item+item', inputs: [a, b] },
  };
}