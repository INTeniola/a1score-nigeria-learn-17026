import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display homepage', async ({ page }) => {
    await expect(page).toHaveTitle(/A1Score/i);
    await expect(page.locator('h1')).toContainText(/AI-Powered/i);
  });

  test('should navigate to auth page', async ({ page }) => {
    await page.click('text=Get Started');
    await expect(page).toHaveURL(/.*auth/);
  });

  test('should show validation errors for invalid email', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=/invalid email/i')).toBeVisible();
  });

  test('should switch between login and signup modes', async ({ page }) => {
    await page.goto('/auth');
    
    // Should be on login by default
    await expect(page.locator('button[type="submit"]')).toContainText(/sign in/i);
    
    // Switch to signup
    await page.click('text=/create account/i');
    await expect(page.locator('button[type="submit"]')).toContainText(/create account/i);
    await expect(page.locator('input[name="fullName"]')).toBeVisible();
    
    // Switch back to login
    await page.click('text=/already have an account/i');
    await expect(page.locator('button[type="submit"]')).toContainText(/sign in/i);
  });

  test('should handle demo mode', async ({ page }) => {
    await page.goto('/auth');
    await page.click('text=/try demo/i');
    
    // Should redirect to dashboard or show demo interface
    await expect(page).toHaveURL(/.*dashboard|.*student/);
  });
});

test.describe('Protected Routes', () => {
  test('should redirect to auth when accessing protected route without login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*auth/);
  });

  test('should stay on protected route when already authenticated', async ({ page, context }) => {
    // Mock authentication by setting localStorage
    await context.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
      }));
    });

    await page.goto('/dashboard');
    // Should not redirect to auth
    await expect(page).not.toHaveURL(/.*auth/);
  });
});
