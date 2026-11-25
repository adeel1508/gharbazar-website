import { expect, test, type Page } from '@playwright/test';

// Open the home page, waiting in THIS browser until the real storefront
// appears.
//
// GitHub Pages serves its 404 page ("There isn't a GitHub Pages site
// here.") to browsers for minutes after a deploy — and which edge a
// browser lands on varies, so a readiness check in another browser (or
// curl) proves nothing: in E2E run #5 the wait script's browser saw the
// real page twice, yet the test browser still got the 404 page for the
// next ~8 minutes.
//
// Run #6 showed the deeper problem: the test browser got the 404 page
// for 20 minutes straight, across TWO fresh browser contexts (the first
// attempt and its retry each burned the full 10-minute loop), while the
// wait browser had seen the real page seconds earlier. Same-URL reloads
// keep hitting the same poisoned cache entry. So EVERY attempt navigates
// to a fresh cache-busting URL (?cb=<timestamp>): a 404 on one attempt
// can never poison the next one, and the loop breaks through as soon as
// the deployment is actually live on that edge.
export async function openHome(page: Page) {
  test.setTimeout(12 * 60 * 1000);
  const deadline = Date.now() + 10 * 60 * 1000;
  for (;;) {
    await page.goto('/?cb=' + Date.now());
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
