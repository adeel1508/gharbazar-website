import { test, expect } from '@playwright/test';
import { openHome } from './helpers';

// All of these are read-only page-load checks. No login is attempted,
// no form is submitted, no order is placed.

test('product detail page loads with name and price', async ({ page }) => {
  await openHome(page);

  // Open the first product's Details page.
  await page.locator('.product-card').first().locator('a', { hasText: 'Details' }).click();
  await expect(page).toHaveURL(/product\.html\?id=/);
  await expect(page.locator('.detail-title')).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('.detail-price')).toHaveText(/^Rs [\d,]+$/);
});

test('auth page loads with the login form', async ({ page }) => {
  await page.goto('auth.html');
  await expect(page.locator('#login-form')).toBeVisible();
  await expect(page.locator('#login-email')).toBeVisible();
  await expect(page.locator('#btn-login-submit')).toBeVisible();
  // Deliberately no login attempt here.
});

test('admin page shows the login gate when signed out', async ({ page }) => {
  await page.goto('admin.html');
  // Signed-out visitors get the admin login form, not the dashboard.
  await expect(page.locator('#admin-login-form')).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.locator('#admin-email')).toBeVisible();
  // Deliberately no login attempt here.
});

test('checkout page loads (login gate, no order placed)', async ({ page }) => {
  await page.goto('checkout.html');
  // Signed-out visitors are redirected to the login page.
  await expect(page).toHaveURL(/auth\.html\?redirect=checkout\.html/, {
    timeout: 30_000,
  });
  await expect(page.locator('#login-form')).toBeVisible();
});
