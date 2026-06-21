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