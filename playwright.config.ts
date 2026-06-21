import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: 'tests/e2e',
  webServer: { command: 'pnpm preview --port 4173', port: 4173, reuseExistingServer: true },
  use: { baseURL: 'http://localhost:4173' },
});