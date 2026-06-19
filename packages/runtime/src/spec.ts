import { z } from 'zod';

export const gameSpecSchema = z.object({
  meta: z.object({
    name: z.string().min(1).max(40),
    flavor: z.string().min(1).max(120),
    // Accept any string for templateHint; we always force 'platformer' since MVP only supports 1 template.
    // LLM often invents its own labels ("sideScroller", "platformer", "2d platformer"), so we relax + override.
    templateHint: z.string(),
  }),
  mechanics: z.object({
    gravity: z.number().min(400).max(1500),
    jumpVelocity: z.number().min(300).max(700),
    moveSpeed: z.number().min(120).max(360),
    enemySpeed: z.number().min(40).max(250),
  }),
  art: z.object({
    palette: z.object({
      primary: z.string().regex(/^#[0-9a-f]{6}$/i),
      secondary: z.string().regex(/^#[0-9a-f]{6}$/i),
      enemy: z.string().regex(/^#[0-9a-f]{6}$/i),
      bg: z.string().regex(/^#[0-9a-f]{6}$/i),
    }),
    style: z.enum(['geometric', 'pixel', 'rounded']),
  }),
  level: z.object({
    concept: z.enum(['flat', 'stairs', 'gap', 'boss']),
    enemyCount: z.number().int().min(0).max(6),
    starCount: z.number().int().min(0).max(5),
  }),
});

export type GameSpec = z.infer<typeof gameSpecSchema>;
