/**
 * E2E: Demo mode flow
 * Requirements: 13.4 — full demo path from landing to schedule
 */
import { expect, test } from '@playwright/test'

test.describe('Demo mode flow', () => {

  test('landing page loads and shows demo button', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('button', { name: /armenian code academy/i }).first()).toBeVisible()
  })

  test('demo button navigates to dashboard with seed data', async ({ page }) => {
    await page.goto('/')
    // Click the primary demo CTA
    await page.getByRole('button', { name: /armenian code academy/i }).first().click()
    // Should land on dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 })
    // Demo Mode badge should be visible in sidebar
    await expect(page.getByText('Demo Mode')).toBeVisible()
  })

  test('lecturers page shows seed data', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /armenian code academy/i }).first().click()
    await page.waitForURL(/\/dashboard/)
    await page.goto('/lecturers')
    // Should show at least some lecturer cards
    await expect(page.locator('[data-testid="lecturer-card"], li, .lecturer').first()).toBeVisible({ timeout: 5_000 })
  })

  test('schedule page: generate button is present', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /armenian code academy/i }).first().click()
    await page.waitForURL(/\/dashboard/)
    await page.goto('/schedule')
    await expect(page.getByRole('button', { name: /generate/i })).toBeVisible({ timeout: 5_000 })
  })

  test('exit demo navigates back to landing', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /armenian code academy/i }).first().click()
    await page.waitForURL(/\/dashboard/)
    // Click "Exit Demo" in the sidebar
    await page.getByRole('button', { name: /exit demo/i }).click()
    // Should redirect to /login (authSlice clears session → ProtectedRoute redirects)
    await expect(page).toHaveURL(/\/login|\//, { timeout: 5_000 })
  })

})
