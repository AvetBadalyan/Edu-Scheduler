// Quick demo-mode smoke test: landing -> demo login -> dashboard -> generate schedule.
import { chromium } from 'playwright'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3002'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', e => errors.push(String(e)))

await page.goto(BASE_URL, { waitUntil: 'networkidle' })
await page.getByRole('button', { name: /Try the demo with Armenian Code Academy/i }).click()
await page.waitForURL('**/dashboard', { timeout: 15000 })
console.log('dashboard reached')

await page.goto(`${BASE_URL}/schedule`, { waitUntil: 'networkidle' })
await page.getByRole('button', { name: /Generate instantly/i }).first().click()
await page.waitForTimeout(2000)
const toast = await page.getByText(/Scheduled \d+ classes with no conflicts/i).count()
console.log('success toast present:', toast > 0)

// Edit a lecturer to exercise the update thunk in demo mode
await page.goto(`${BASE_URL}/lecturers`, { waitUntil: 'networkidle' })
await page.getByRole('button', { name: /Edit .*Gago|Edit/i }).first().click().catch(() => {})
await page.waitForTimeout(500)

console.log('console/page errors:', errors.length ? errors : 'none')
await browser.close()
