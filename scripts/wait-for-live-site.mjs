// Wait until the live site serves the real home page in a REAL browser.
//
// curl is NOT enough: after a push, GitHub Pages keeps serving its 404
// page ("There isn't a GitHub Pages site here.") to browsers for ~8
// minutes, even while curl already gets 200 with the real page three
// times in a row (seen in E2E runs #1, #3 and #4). So readiness must be
// measured with the same client that will run the tests — Chromium.
//
// Retries every 30s for up to 15 minutes. Exits 0 when the real page is
// served twice in a row, 1 on timeout. Read-only: loads the home page
// and reads its text, nothing else.
import { chromium } from '@playwright/test';

const URL = 'https://adeel1508.github.io/gharbazar-website/';
const DEADLINE = Date.now() + 15 * 60 * 1000;
const NOT_READY = "There isn't a GitHub Pages site here";

const browser = await chromium.launch();
const page = await browser.newPage();
let attempt = 0;
let good = 0;

for (;;) {
  attempt++;
  try {
    // Fresh cache-busting URL every attempt: a 404 served during the
    // deploy window must not poison the next attempt via a cached entry
    // (E2E run #6: same-URL reloads kept returning the 404 page for
    // 20 minutes across two fresh browser contexts).
    await page.goto(URL + '?cb=' + Date.now(), {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    const body = (await page.textContent('body')) || '';
    if (body.includes('GharBazar') && !body.includes(NOT_READY)) {
      good++;
      console.log(`attempt ${attempt}: live site OK (${good}/2)`);
      if (good >= 2) {
        console.log('live site confirmed ready in a real browser');
        break;
      }
    } else {
      good = 0;
      console.log(`attempt ${attempt}: live site not ready yet (404 page)`);
    }
  } catch (e) {
    good = 0;
    console.log(`attempt ${attempt}: ${String(e.message).split('\n')[0]}`);
  }
  if (Date.now() > DEADLINE) {
    console.error('FAIL: live site did not become ready within 15 minutes');
    await browser.close();
    process.exit(1);
  }
  await new Promise((r) => setTimeout(r, 30000));
}

await browser.close();
