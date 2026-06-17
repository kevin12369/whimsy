import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const ARTIFACT_DIR = join(process.cwd(), 'artifacts');

test.beforeAll(() => {
  mkdirSync(ARTIFACT_DIR, { recursive: true });
});

test('v3 landing page: hero loads, download CTA present, no iframe demo', async ({ page }) => {
  // 1. Index page boots without console errors.
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('/');
  // Hero headline is the h1; the brand name lives in a <span data-testid="brand-name">.
  await expect(page.locator('h1').first()).toBeVisible();
  await expect(page.getByTestId('brand-name')).toContainText('Whimsy');

  // 2. v3 pivot: there is no iframe demo anymore (Tauri desktop handles gameplay).
  await expect(page.locator('iframe')).toHaveCount(0);

  // 3. The static showcase has a "Download Whimsy" CTA pointing to GitHub Releases.
  const cta = page.getByRole('link', { name: /download whimsy/i });
  await expect(cta).toBeVisible();
  const href = await cta.getAttribute('href');
  expect(href).toMatch(/releases/);

  // 4. Screenshot artifact for the CI upload step.
  await page.screenshot({ path: join(ARTIFACT_DIR, 'landing-page.png'), fullPage: true });
  await expect.poll(() => errors.length, { timeout: 1000 }).toEqual(0);
});
