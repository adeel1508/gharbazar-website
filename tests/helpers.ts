import { expect, test, type Page } from '@playwright/test';

// Open the home page, waiting in THIS browser until the real storefront
// appears.
//
// URL TRAP — read this before changing the goto below: the baseURL is
// https://adeel1508.github.io/gharbazar-website/ (a SUBPATH). A leading
// slash escapes that subpath: page.goto('/') resolves to
// https://adeel1508.github.io/ — the account's Pages root, which has no
// site, so GitHub serves its 404 page ("There isn't a GitHub Pages site
// here.") FOREVER. That was the bug in runs #1–#8: every home test
// failed on the 404 page while the auth/admin/checkout tests (relative
// URLs: 'auth.html', ...) passed every time, and the failures were
// misread as a deploy/edge problem. The fix is a RELATIVE URL:
// 'index.html?cb=<timestamp>' stays under the baseURL subpath. The
// cache-busting query is kept so a stale cached copy can never mask a
// fresh load. If the site is briefly mid-deploy, the loop below retries
// every 30s for up to 10 minutes.
export async function openHome(page: Page) {
  test.setTimeout(12 * 60 * 1000);
  const deadline = Date.now() + 10 * 60 * 1000;
  for (;;) {
    await page.goto('index.html?cb=' + Date.now());
    const body = (await page.textContent('body')) || '';
    if (
      body.includes('GharBazar') &&
      !body.includes("There isn't a GitHub Pages site here")
    ) {
      break;
    }
    if (Date.now() > deadline) {
      throw new Error(
        'Live site kept serving the GitHub Pages 404 page for 10 minutes',
      );
    }
    await page.waitForTimeout(30000);
  }
  // Products load live from Firestore — wait for the grid to fill.
  await expect(page.locator('.product-card').first()).toBeVisible({
    timeout: 60_000,
  });
}
