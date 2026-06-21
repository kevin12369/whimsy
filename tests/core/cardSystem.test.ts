import { describe, it, expect } from 'vitest';
import type { Card, Deck, Level, FusedItem, HiddenLevel, PlacedItem, PlacedNpc } from '../../src/core/cardSystem';

describe('Card', () => {
  it('creates a theme card with required fields', () => {
    const c: Card = {
      id: 't-1', type: 'theme', name: 'Cucumber Cosmos',
      themePayload: { palette: ['#a','#b','#c','#d','#e'], ruleQuirk: 'liquids flow up' },
      generatedBy: 'fallback', generatedAt: 1,
    };
    expect(c.type).toBe('theme');
    expect(c.themePayload?.palette).toHaveLength(5);
  });

  it('physics card has gravity, restitution, friction', () => {
    const c: Card = {
      id: 'p-1', type: 'physics', name: 'Moon Bounce',
      physicsPayload: { gravity: 200, restitution: 0.95, friction: 0.1, note: 'low gravity' },
      generatedBy: 'fallback', generatedAt: 1,
    };
    expect(c.physicsPayload?.gravity).toBe(200);
  });
});

describe('Deck', () => {
  it('round-trips 1 theme + 8 physics + 20-30 item + 3 npc + 2 hidden', () => {
    const d: Deck = {
      id: 'd-1', generatedBy: 'fallback', generatedAt: 1,
      themeCard: { id:'t', type:'theme', name:'X', themePayload:{palette:['#0','#1','#2','#3','#4'], ruleQuirk:'q'}, generatedBy:'fallback', generatedAt:1 },
      physicsCards: Array(8).fill(null).map((_,i)=>({ id:`p${i}`, type:'physics', name:'P'+i, physicsPayload:{gravity:800,restitution:0.3,friction:0.5,note:'n'}, generatedBy:'fallback' as const, generatedAt:1 })),
      itemCards: Array(25).fill(null).map((_,i)=>({ id:`i${i}`, type:'item', name:'I'+i, itemPayload:{spriteKey:'whip_red',behavior:'b',stackable:false}, generatedBy:'fallback' as const, generatedAt:1 })),
      npcCards: Array(3).fill(null).map((_,i)=>({ id:`n${i}`, type:'npc', name:'N'+i, npcPayload:{role:'r',personality:'p'}, generatedBy:'fallback' as const, generatedAt:1 })),
      hiddenCards: Array(2).fill(null).map((_,i)=>({ id:`h${i}`, type:'hidden', name:'H'+i, hiddenPayload:{unlockRecipe:['a','b']}, generatedBy:'fallback' as const, generatedAt:1 })),
    };
    expect(d.physicsCards).toHaveLength(8);
    expect(d.itemCards.length).toBeGreaterThanOrEqual(20);
    expect(d.itemCards.length).toBeLessThanOrEqual(30);
  });
});