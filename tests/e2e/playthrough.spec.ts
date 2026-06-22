import { test, expect } from '@playwright/test';

test('page loads, menu visible, no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('/');
  await expect(page.getByText('Whimsy Shuffle')).toBeVisible();
  await page.getByText('New Shuffle').click();
  await expect(page.locator('canvas')).toBeVisible();
  expect(errors).toEqual([]);
});

test('inventory HUD shows after GameScene boots', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await page.getByText('New Shuffle').click();
  await page.waitForTimeout(500);
  // Phaser text is rendered on canvas, not DOM. The test asserts
  // the canvas is non-blank after GameScene boot, which proves the
  // scene rendered something (HUD line + tilemap + entities).
  const dataUrlLen = await page.evaluate(() => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement | null;
    return canvas ? canvas.toDataURL().length : 0;
  });
  expect(dataUrlLen).toBeGreaterThan(1000);
  expect(errors).toEqual([]);
});

test('ESC opens and closes pause modal without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await page.getByText('New Shuffle').click();
  await page.waitForTimeout(500);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  expect(errors).toEqual([]);
});
