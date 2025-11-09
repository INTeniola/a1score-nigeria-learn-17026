import { test, expect } from '@playwright/test';

test.describe('AI Tutor Chat', () => {
  test.beforeEach(async ({ page, context }) => {
    // Mock authentication
    await context.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
      }));
    });
    
    await page.goto('/student');
  });

  test('should display AI tutor interface', async ({ page }) => {
    await page.click('text=/AI Tutor/i');
    
    await expect(page.locator('textarea, input[placeholder*="ask"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should send message and receive response', async ({ page }) => {
    await page.goto('/student/tutor');
    
    // Type a message
    await page.fill('textarea, input[placeholder*="ask"]', 'What is the Pythagorean theorem?');
    
    // Submit the message
    await page.click('button[type="submit"]');
    
    // Wait for response (with timeout)
    await expect(page.locator('text=/theorem|triangle|a² + b²/i')).toBeVisible({ timeout: 10000 });
  });

  test('should show typing indicator while waiting', async ({ page }) => {
    await page.goto('/student/tutor');
    
    await page.fill('textarea, input[placeholder*="ask"]', 'Explain photosynthesis');
    await page.click('button[type="submit"]');
    
    // Check for typing indicator
    await expect(page.locator('[data-testid="typing-indicator"]')).toBeVisible();
  });

  test('should disable send button when input is empty', async ({ page }) => {
    await page.goto('/student/tutor');
    
    const sendButton = page.locator('button[type="submit"]');
    await expect(sendButton).toBeDisabled();
    
    // Type something
    await page.fill('textarea, input[placeholder*="ask"]', 'Test');
    await expect(sendButton).toBeEnabled();
    
    // Clear input
    await page.fill('textarea, input[placeholder*="ask"]', '');
    await expect(sendButton).toBeDisabled();
  });

  test('should handle tutor personality selection', async ({ page }) => {
    await page.goto('/student/tutor');
    
    // Look for personality selector
    const personalityButton = page.locator('button:has-text("Personality"), button:has-text("Tutor Style")').first();
    if (await personalityButton.isVisible()) {
      await personalityButton.click();
      
      // Select a personality
      await page.click('text=/friendly|professional|encouraging/i');
      
      // Verify selection was made
      await expect(page.locator('[aria-selected="true"], .selected')).toBeVisible();
    }
  });
});

test.describe('AI Tutor Error Handling', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
      }));
    });
  });

  test('should handle rate limit errors gracefully', async ({ page }) => {
    await page.goto('/student/tutor');
    
    // Mock 429 response
    await page.route('**/functions/v1/ai-tutor-chat', route => {
      route.fulfill({
        status: 429,
        body: JSON.stringify({ error: 'Rate limit exceeded' }),
      });
    });
    
    await page.fill('textarea, input[placeholder*="ask"]', 'Test question');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=/rate limit|too many requests/i')).toBeVisible();
  });

  test('should handle network errors', async ({ page }) => {
    await page.goto('/student/tutor');
    
    // Mock network failure
    await page.route('**/functions/v1/ai-tutor-chat', route => {
      route.abort('failed');
    });
    
    await page.fill('textarea, input[placeholder*="ask"]', 'Test question');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=/error|failed|try again/i')).toBeVisible();
  });
});
