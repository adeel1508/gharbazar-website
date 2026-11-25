import { expect, test, type Page } from '@playwright/test';

// Open the home page, waiting in THIS browser until the real storefront
// appears.
//
// GitHub Pages serves its 404 page ("There isn't a GitHub Pages site
// here.") to browsers for minutes after a deploy — and which edge a
// browser lands on varies, so a readiness check in another browser (or
// curl) proves nothing: in E2E run #5 the wait script's browser saw the
// real page twice, yet the test browser still got the 404 page for the
// next ~8 minutes. Each test must therefore wait in its own browser,
// reloading until the real page shows up (up to 10 minutes).
export async function openHome(page: Page) {
  test.setTimeout(12 * 60 * 1000);
  const deadline = Date.now() + 10 * 60 * 1000;
  for (;;) {
    await page.goto('/');
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
