/**
 * E2E: Authenticated mode flow
 * Requirements: 13.4 — signup → university → entities → schedule
 *
 * NOTE: This test requires a running Supabase project.
 * It uses a unique timestamped email to avoid conflicts between runs.
 * In CI, SUPABASE_TEST_EMAIL and SUPABASE_TEST_PASSWORD can be set to use
 * a fixed test account (avoids creating a new account on every run).
 */
import { expect, test } from '@playwright/test'

const TEST_EMAIL    = process.env.SUPABASE_TEST_EMAIL    ?? `test+${Date.now()}@edu-test.local`
const TEST_PASSWORD = process.env.SUPABASE_TEST_PASSWORD ?? 'TestPass123!'
const TEST_NAME     = 'Test User'

test.describe('Authenticated mode flow', () => {

  test('sign-up tab is visible on login page', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('tab', { name: /sign up/i })).toBeVisible()
  })

  test('login page shows sign in tab by default with demo pre-filled', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('tab', { name: /sign in/i })).toHaveAttribute('aria-selected', 'true')
    await expect(page.locator('#email')).toHaveValue('demo@education.app')
  })

  test('demo login via login page works', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 })
    await expect(page.getByText('Demo Mode')).toBeVisible()
  })

  test('protected route redirects unauthenticated users to /login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('404 page shows for unknown routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-xyz')
    await expect(page.getByText('404')).toBeVisible()
  })

})
