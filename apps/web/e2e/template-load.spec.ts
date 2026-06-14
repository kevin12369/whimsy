import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const ARTIFACT_DIR = join(process.cwd(), 'artifacts');

test.beforeAll(() => {
  mkdirSync(ARTIFACT_DIR, { recursive: true });
});

test('index loads, a template thumbnail is clickable, and the Phaser iframe renders', async ({ page }) => {
  // 1. Index page boots without console errors.
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Whimsy');

  // 2. The big preview iframe is present and not blocked.
  const mainIframe = page.frameLocator('iframe[title]').first();
  await expect(mainIframe.locator('body')).toBeVisible({ timeout: 15_000 });

  // 3. Click a non-default template thumbnail and confirm the iframe re-keys.
  const initialIframe = page.locator('iframe[title]').first();
  const initialSrcDocAttr = await initialIframe.getAttribute('srcdoc');

  const thumbnail = page.locator('button:has-text("Vertical Climber")').first();
  await thumbnail.scrollIntoViewIfNeeded();
  await thumbnail.click();

  // After click, the iframe re-renders (key changes on the React <iframe>).
  await page.waitForTimeout(500);
  const afterSrcDocAttr = await page.locator('iframe[title]').first().getAttribute('srcdoc');
  expect(afterSrcDocAttr).not.toBe(initialSrcDocAttr);

  // 4. The new iframe actually contains a <canvas> from Phaser.
  const newFrame = page.frameLocator('iframe[title*="Climber"]').first();
  const canvas = newFrame.locator('canvas').first();
  await expect(canvas).toBeVisible({ timeout: 15_000 });
  // Phaser canvases are typically at least 100x100 in our templates.
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThan(50);
  expect(box!.height).toBeGreaterThan(50);

  // 5. Screenshot artifact for the CI upload step.
  await page.screenshot({ path: join(ARTIFACT_DIR, 'template-load.png'), fullPage: true });
  await expect.poll(() => errors.length, { timeout: 1000 }).toEqual(0);
});
