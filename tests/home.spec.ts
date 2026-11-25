import { test, expect } from '@playwright/test';

// The 7 products the store must always show, with their exact prices.
// (Counts use "at least" so a temporary extra test product, or a future
// real product, does not break these checks.)
// NOTE: the catalogue used to have 8 products. The owner deleted
// "Men's Unstitched Cotton Plain Suit" (Rs 3,099) himself on 2026-11-25
// and said NOT to re-add it — so 7 is the correct count now.
const EXPECTED_PRODUCTS = [
  { name: 'Cozy Fleece Printed Double Bed Blanket', price: 'Rs 1,949' },
  { name: 'Fleece Printed Double Bed Blanket Navy White', price: 'Rs 1,949' },
  { name: 'Stylish Fleece Plain Double Bed Blanket', price: 'Rs 2,599' },
  { name: '3D Panel Fleece Embossed Double Bed Blanket', price: 'Rs 3,599' },
  { name: "Men's Unstitched Boski Plain Suit", price: 'Rs 1,999' },
  { name: "Men's Unstitched Wool Plain Suit", price: 'Rs 2,299' },
  { name: "Men's Unstitched Wash And Wear Plain Suit", price: 'Rs 2,999' },
] as const;

async function openHome(page) {
  await page.goto('/');
  // Products load live from Firestore — wait for the grid to fill.
  await expect(page.locator('.product-card').first()).toBeVisible({
    timeout: 60_000,
  });
}

test('home page shows all 7 products with exact prices', async ({ page }) => {
  await openHome(page);

  // At least the 7 real products (a temporary extra test product, or a
  // future real product, must not break this check).
  expect(await page.locator('.product-card').count()).toBeGreaterThanOrEqual(7);

  for (const product of EXPECTED_PRODUCTS) {
    const card = page.locator('.product-card', { hasText: product.name });
    await expect(card).toHaveCount(1);
    await expect(card.locator('.product-price')).toHaveText(product.price);
  }
});

test('search box filters products', async ({ page }) => {
  await openHome(page);

  await page.locator('#search-input').fill('blanket');
  // Only the 4 blankets match; no suit card may be visible.
  await expect(
    page.locator('.product-card', { hasText: 'Suit' }),
  ).toHaveCount(0);
  expect(
    await page.locator('.product-card', { hasText: 'Blanket' }).count(),
  ).toBeGreaterThanOrEqual(4);

  // Clearing the search brings the full catalogue back.
  await page.locator('#search-input').fill('');
  expect(await page.locator('.product-card').count()).toBeGreaterThanOrEqual(7);
});

test('category filter chips work', async ({ page }) => {
  await openHome(page);

  await page.locator('.filter-btn[data-category="BLANKETS"]').click();
  await expect(
    page.locator('.product-card', { hasText: 'Suit' }),
  ).toHaveCount(0);
  expect(
    await page.locator('.product-card', { hasText: 'Blanket' }).count(),
  ).toBeGreaterThanOrEqual(4);

  await page.locator('.filter-btn[data-category="MENS_SUITS"]').click();
  await expect(
    page.locator('.product-card', { hasText: 'Blanket' }),
  ).toHaveCount(0);
  expect(
    await page.locator('.product-card', { hasText: 'Suit' }).count(),
  ).toBeGreaterThanOrEqual(3);

  await page.locator('.filter-btn[data-category="ALL"]').click();
  expect(await page.locator('.product-card').count()).toBeGreaterThanOrEqual(7);
});
