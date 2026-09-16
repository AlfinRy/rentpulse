/* Visual smoke pass for the sample workspace (dev tool, not shipped).
   Requires `npm run build` + `npm run preview` on :4173. */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = "http://localhost:4173";
const OUT = ".shots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push("console: " + m.text());
});

await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(700); // past skeletons

await page.screenshot({ path: `${OUT}/01-desktop-default.png` });

// Select first listing -> detail panel
await page.locator(".listing-row").first().click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/02-desktop-detail.png` });

// Second pulse (error state)
await page.getByRole("button", { name: /Menteng studio/ }).click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/03-desktop-error-pulse.png` });

// Third pulse (paused, empty)
await page.getByRole("button", { name: /Lisbon 2BR/ }).click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/04-desktop-paused-empty.png` });

// New Pulse form
await page.getByRole("button", { name: /New Pulse/ }).click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/05-desktop-form.png` });
await page.keyboard.press("Escape");

// Keyboard: focus a listing row, arrow down
await page.getByRole("button", { name: /Sunset Park 1BR/ }).click();
await page.locator(".listing-row").first().focus();
await page.keyboard.press("ArrowDown");
await page.screenshot({ path: `${OUT}/06-desktop-keyboard.png` });

// Tablet
const tablet = await browser.newPage({ viewport: { width: 900, height: 1080 } });
await tablet.goto(BASE, { waitUntil: "networkidle" });
await tablet.waitForTimeout(700);
await tablet.screenshot({ path: `${OUT}/07-tablet.png` });

// Mobile + overlay detail
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto(BASE, { waitUntil: "networkidle" });
await mobile.waitForTimeout(700);
await mobile.screenshot({ path: `${OUT}/08-mobile.png` });
await mobile.locator(".listing-row").first().click();
await mobile.waitForTimeout(400);
await mobile.screenshot({ path: `${OUT}/09-mobile-overlay.png` });

console.log(errors.length ? "ERRORS:\n" + errors.join("\n") : "NO_CONSOLE_OR_PAGE_ERRORS");
await browser.close();
