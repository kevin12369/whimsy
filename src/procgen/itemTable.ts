import type { Card } from '../core/cardSystem';
import { uuid } from '../utils/uuid';

export const ITEM_TEMPLATES: ReadonlyArray<Omit<Card, 'id' | 'generatedAt' | 'generatedBy'>> = [
  { type:'item', name:'brine comet',     itemPayload:{ spriteKey:'whip_blue',   behavior:'splashes on impact',     stackable:false } },
  { type:'item', name:'vine whip',       itemPayload:{ spriteKey:'whip_red',    behavior:'extends 3 tiles',        stackable:false } },
  { type:'item', name:'pickled star',    itemPayload:{ spriteKey:'orb_yellow',  behavior:'glows when held',       stackable:false } },
  { type:'item', name:'ferment orb',     itemPayload:{ spriteKey:'orb_green',   behavior:'slows nearby liquids',  stackable:false } },
  { type:'item', name:'cyan blade',      itemPayload:{ spriteKey:'sword_cyan',  behavior:'cuts through water',    stackable:false } },
  { type:'item', name:'violet blade',    itemPayload:{ spriteKey:'sword_violet',behavior:'hums near walls',       stackable:false } },
  { type:'item', name:'dill drone',      itemPayload:{ spriteKey:'shield_gold', behavior:'follows player for 5s', stackable:false } },
  { type:'item', name:'rose potion',     itemPayload:{ spriteKey:'potion_pink', behavior:'heals on contact',      stackable:true  } },
  { type:'item', name:'ember shard',     itemPayload:{ spriteKey:'whip_red',    behavior:'leaves a brief trail',  stackable:true  } },
  { type:'item', name:'tide coin',       itemPayload:{ spriteKey:'orb_yellow',  behavior:'rings when dropped',    stackable:true  } },
  { type:'item', name:'moss pebble',     itemPayload:{ spriteKey:'orb_green',   behavior:'grows near walls',       stackable:true  } },
  { type:'item', name:'glass fang',      itemPayload:{ spriteKey:'sword_cyan',  behavior:'shatters on impact',    stackable:false } },
  { type:'item', name:'rune fragment',   itemPayload:{ spriteKey:'sword_violet',behavior:'pulses in time with steps', stackable:false } },
  { type:'item', name:'lantern wisp',    itemPayload:{ spriteKey:'shield_gold', behavior:'casts a 2-tile glow',    stackable:false } },
  { type:'item', name:'brine pearl',     itemPayload:{ spriteKey:'potion_pink', behavior:'distorts gravity in radius', stackable:false } },
  { type:'item', name:'saltspun coin',   itemPayload:{ spriteKey:'whip_blue',   behavior:'skips across water',    stackable:true  } },
  { type:'item', name:'charcoal twig',   itemPayload:{ spriteKey:'whip_red',    behavior:'leaves a black mark',    stackable:true  } },
  { type:'item', name:'amber bead',      itemPayload:{ spriteKey:'orb_yellow',  behavior:'holds last sound briefly', stackable:true  } },
  { type:'item', name:'fern chip',       itemPayload:{ spriteKey:'orb_green',   behavior:'snaps back to player',  stackable:true  } },
  { type:'item', name:'prism chip',      itemPayload:{ spriteKey:'sword_cyan',  behavior:'splits light to 4 tiles', stackable:false } },
  { type:'item', name:'echo shard',      itemPayload:{ spriteKey:'sword_violet',behavior:'repeats last step',     stackable:false } },
  { type:'item', name:'wax bell',        itemPayload:{ spriteKey:'shield_gold', behavior:'rings once per room',    stackable:false } },
  { type:'item', name:'sour drop',       itemPayload:{ spriteKey:'potion_pink', behavior:'reverses direction for 1s', stackable:true  } },
  { type:'item', name:'glass mote',      itemPayload:{ spriteKey:'whip_blue',   behavior:'drifts on collision',    stackable:true  } },
  { type:'item', name:'ash flake',       itemPayload:{ spriteKey:'whip_red',    behavior:'dims light radius',      stackable:true  } },
  { type:'item', name:'sun coin',        itemPayload:{ spriteKey:'orb_yellow',  behavior:'casts warm light for 5s', stackable:false } },
  { type:'item', name:'spore sac',       itemPayload:{ spriteKey:'orb_green',   behavior:'releases spores on break', stackable:false } },
  { type:'item', name:'frost splinter',  itemPayload:{ spriteKey:'sword_cyan',  behavior:'freezes 1 tile of water', stackable:false } },
  { type:'item', name:'gloam thread',    itemPayload:{ spriteKey:'sword_violet',behavior:'darkens 1 tile radius',  stackable:false } },
  { type:'item', name:'marrow bead',     itemPayload:{ spriteKey:'shield_gold', behavior:'absorbs one hit',        stackable:false } },
];

export function pickItemsForDeck(count: number, seed: number): Card[] {
  let s = seed | 0;
  const rng = () => { s = (s * 1664525 + 1013904223) | 0; return ((s >>> 0) / 0xffffffff); };
  const out: Card[] = [];
  for (let i = 0; i < count; i++) {
    const tmpl = ITEM_TEMPLATES[Math.floor(rng() * ITEM_TEMPLATES.length)]!;
    out.push({ ...tmpl, id: uuid(), generatedBy: 'fallback', generatedAt: Date.now() });
  }
  return out;
}
