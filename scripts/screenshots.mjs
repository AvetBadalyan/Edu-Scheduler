// One-off script to capture README screenshots via Playwright (demo mode).
// Usage: node scripts/screenshots.mjs  (dev server must be running on BASE_URL)
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3002'
const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(__dirname, '../docs/screenshots')
mkdirSync(outDir, { recursive: true })

const shot = async (page, name) => {
	await page.screenshot({
		path: resolve(outDir, `${name}.png`),
		fullPage: false
	})
	console.log('captured', name)
}

const browser = await chromium.launch()
const page = await browser.newPage({
	viewport: { width: 1440, height: 900 },
	deviceScaleFactor: 2
})

// Landing page
await page.goto(BASE_URL, { waitUntil: 'networkidle' })
await page.waitForTimeout(800)
await shot(page, '01-landing')

// Enter demo mode
await page
	.getByRole('button', { name: /Try the demo with Armenian Code Academy/i })
	.click()
await page.waitForURL('**/dashboard', { timeout: 15000 })
await page.waitForTimeout(1000)
await shot(page, '02-dashboard')

const pages = [
	['lecturers', '03-lecturers'],
	['rooms', '04-rooms'],
	['faculties', '05-faculties'],
	['schedule', '06-schedule']
]
for (const [path, name] of pages) {
	await page.goto(`${BASE_URL}/${path}`, { waitUntil: 'networkidle' })
	await page.waitForTimeout(900)
	await shot(page, name)
}

// Generated schedule (core feature) — click "Generate instantly" on the schedule page
await page.goto(`${BASE_URL}/schedule`, { waitUntil: 'networkidle' })
await page.waitForTimeout(600)
const generate = page.getByRole('button', { name: /Generate instantly/i })
if (await generate.count()) {
	await generate.first().click()
	await page.waitForTimeout(2500)
	await shot(page, '07-schedule-generated')
}

await browser.close()
console.log('done ->', outDir)
