import { test, expect } from '@playwright/test';

test('home form shows an error toast when API fails', async ({ page }) => {
  await page.route('**/api/generate', route => route.fulfill({
    status: 500, contentType: 'text/plain', body: 'server error',
  }));
  await page.goto('/');
  await page.getByPlaceholder(/describe/i).fill('mario in space');
  await page.getByRole('button', { name: /generate/i }).click();
  await expect(page.getByText(/network error|try again|service busy/i)).toBeVisible({ timeout: 10_000 });
});

test('home form shows failed toast on 4xx with error message', async ({ page }) => {
  await page.route('**/api/generate', route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ id: 'x', status: 'failed', attempts: 3, url: null, error: 'no canvas element' }),
  }));
  await page.goto('/');
  await page.getByPlaceholder(/describe/i).fill('mario in space');
  await page.getByRole('button', { name: /generate/i }).click();
  await expect(page.getByText(/no canvas/i)).toBeVisible({ timeout: 10_000 });
});
