import { test, expect } from '@playwright/test';

test('home page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByPlaceholder(/describe/i)).toBeVisible();
});

test('iframe on play page has sandbox="allow-scripts" only', async ({ page }) => {
  // Stub the API so we don't hit real LLM
  await page.route('**/api/games/*', route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ id: 'fake', prompt: 'p', genre: 'platformer', attempts: 1, created_at: 1, url: '/g/fake' }),
  }));
  await page.route('**/g/fake', route => route.fulfill({
    status: 200, contentType: 'text/html',
    body: '<!DOCTYPE html><html><body><canvas></canvas></body></html>',
  }));
  await page.goto('/play/fake/');
  const sandbox = await page.getAttribute('iframe[title="game"]', 'sandbox');
  expect(sandbox).toBe('allow-scripts');
});
