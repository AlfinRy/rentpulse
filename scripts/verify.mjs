/* Objective UI verification for the sample workspace (dev tool, not shipped).
   Checks geometry, overflow, computed contrast, a11y tree, and runs axe-core. */
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const BASE = "http://localhost:4173";

function srgbFromOklch(L, C, H) {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]; // linear sRGB
}

// Returns {r,g,b} in 0..255 sRGB, handling oklch() and rgb() notations.
function parseColor(str) {
  const ok = str.match(
    /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*[\d.]+\s*)?\)/,
  );
  if (ok) {
    const lin = srgbFromOklch(Number(ok[1]), Number(ok[2]), Number(ok[3]));
    return lin.map((v) => {
      v = Math.min(1, Math.max(0, v));
      return Math.round(255 * (v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055));
    });
  }
  const rgb = str.match(/rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/);
  if (rgb) return rgb.slice(1).map(Number);
  return [255, 255, 255];
}

// WCAG relative luminance from any color string (oklch or rgb).
function lum(str) {
  const [r, g, b] = parseColor(str).map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(fg, bg) {
  const [l1, l2] = [lum(fg), lum(bg)].sort((a, b) => b - a);
  return (l1 + 0.05) / (l2 + 0.05);
}
async function bgOf(page, sel) {
  return page.locator(sel).first().evaluate((el) => {
    let node = el;
    while (node) {
      const c = getComputedStyle(node).backgroundColor;
      if (c && c !== "rgba(0, 0, 0, 0)") return c;
      node = node.parentElement;
    }
    return "rgb(255, 255, 255)";
  });
}

const browser = await chromium.launch();
const results = [];
const check = (name, pass, detail = "") =>
  results.push(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);

for (const vp of [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 900, height: 1080 },
  { name: "desktop", width: 1440, height: 900 },
]) {
  const context = await browser.newContext({ viewport: vp });
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  // 1. No horizontal document overflow
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  check(`${vp.name}: no horizontal scroll`, overflow <= 1, `delta=${overflow}px`);

  // 2. Per-element horizontal overflow on key containers
  const clipped = await page.evaluate(() => {
    const sels = [".board-sub", ".row-title", ".pulse-label", ".detail h2", ".sample-note"];
    const bad = [];
    for (const sel of sels) {
      for (const el of document.querySelectorAll(sel)) {
        if (el.scrollWidth > el.clientWidth + 1) bad.push(`${sel} ${el.scrollWidth}>${el.clientWidth}`);
      }
    }
    return bad;
  });
  check(`${vp.name}: no clipped text containers`, clipped.length === 0, clipped.join(", "));

  if (vp.name === "desktop") {
    // Representative state: first listing selected
    await page.locator(".listing-row").first().click();
    await page.waitForTimeout(300);

    // 3. Workspace is a 3-column grid
    const cols = await page.evaluate(() => {
      const el = document.querySelector(".workspace");
      return getComputedStyle(el).gridTemplateColumns.split(" ").length;
    });
    check("desktop: 3-column workspace", cols === 3, `${cols} columns`);

    // 4. Font applied
    const font = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
    check("Manrope applied", font.includes("Manrope"), font);

    // 5. Contrast checks (computed colors)
    const cases = [
      [".board-sub", null, "secondary text on bg"],
      [".row-meta", null, "row meta on bg"],
      [".rail-title", null, "rail title on rail"],
      [".pulse-city", null, "pulse city on rail"],
      [".sample-note", null, "sample note on rail"],
      [".detail-kicker", null, "detail kicker on surface"],
      [".detail-meta dt", null, "detail dt on surface"],
      [".detail-foot", null, "detail foot on surface"],
    ];
    for (const [sel, , label] of cases) {
      const fg = await page.locator(sel).first().evaluate((el) => getComputedStyle(el).color);
      const bg = await bgOf(page, sel);
      const r = ratio(fg, bg);
      check(`contrast ≥4.5: ${label}`, r >= 4.5, `${r.toFixed(2)}:1 (${fg} on ${bg})`);
    }

    // 6. Semantic structure
    const semantics = await page.evaluate(() => ({
      skip: Boolean(document.querySelector(".skip-link")),
      rail: document.querySelector(".rail")?.getAttribute("aria-label"),
      listbox: document.querySelector('[role="listbox"]')?.getAttribute("aria-label"),
      options: document.querySelectorAll('[role="option"]').length,
      ariaCurrent: Boolean(document.querySelector('.pulse-item[aria-current="true"]')),
      ariaSelected: Boolean(document.querySelector('.listing-row[aria-selected="true"]')),
      headings: [...document.querySelectorAll("h1,h2,h3")].map((h) => h.tagName).join(","),
    }));
    check("skip link present", semantics.skip);
    check("rail labeled", semantics.rail === "Pulses", String(semantics.rail));
    check("listing listbox labeled", semantics.listbox?.startsWith("Listings"), String(semantics.listbox));
    check("listing options present", semantics.options >= 5, `${semantics.options} options`);
    check("selected pulse aria-current", semantics.ariaCurrent);
    check("one h1 only", semantics.headings.split(",").filter((h) => h === "H1").length === 1, semantics.headings);

    // 7. Keyboard: arrow moves focus in listing list
    await page.locator(".listing-row").first().focus();
    const activeBefore = await page.evaluate(() => document.activeElement?.textContent?.slice(0, 20));
    await page.keyboard.press("ArrowDown");
    const activeAfter = await page.evaluate(() => document.activeElement?.textContent?.slice(0, 20));
    check("arrow key moves listing focus", activeBefore !== activeAfter, `"${activeBefore}" -> "${activeAfter}"`);

    // 8. Focus-visible ring on listing row
    const outline = await page.evaluate(() => {
      const el = document.activeElement;
      const cs = getComputedStyle(el);
      return `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`;
    });
    check("focus-visible outline set", !outline.startsWith("none"), outline);

    // 9. Axe audit (desktop)
    const axe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const violations = axe.violations.map((v) => `${v.id}(${v.nodes.length})`);
    check("axe-core violations", violations.length === 0, violations.join(", ") || "none");
    for (const v of axe.violations)
      console.log("  axe node:", v.id, "->", v.nodes.map((n) => n.target.join(" ")).join(" | "));
  }

  if (vp.name === "tablet") {
    const inlineDetailVisible = await page.locator(".detail-inline").isVisible().catch(() => false);
    check("tablet: inline detail hidden", !inlineDetailVisible);
  }

  if (vp.name === "mobile") {
    // Rail becomes a horizontal strip
    const dir = await page.evaluate(() => getComputedStyle(document.querySelector(".pulse-list")).flexDirection);
    check("mobile: pulse list horizontal", dir === "row", dir);
    // Selecting a listing opens the overlay
    await page.locator(".listing-row").first().click();
    await page.waitForTimeout(350);
    const overlayVisible = await page.locator(".detail-overlay").isVisible().catch(() => false);
    check("mobile: overlay detail opens", overlayVisible);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(250);
    const overlayGone = !(await page.locator(".detail-overlay").isVisible().catch(() => false));
    check("mobile: Escape closes overlay", overlayGone);
    // Axe audit (mobile)
    const axe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const violations = axe.violations.map((v) => `${v.id}(${v.nodes.length})`);
    check("axe-core violations (mobile)", violations.length === 0, violations.join(", ") || "none");
  }

  await page.close();
  await context.close();
}

await browser.close();
console.log(results.join("\n"));
const fails = results.filter((r) => r.startsWith("FAIL")).length;
console.log(`\n${fails} failure(s)`);
