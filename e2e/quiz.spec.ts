import { test, expect } from '@playwright/test';

test.describe('Quiz System', () => {
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

  test('should navigate to quiz section', async ({ page }) => {
    await page.click('text=/quiz|practice/i');
    await expect(page).toHaveURL(/.*quiz/);
  });

  test('should display quiz options', async ({ page }) => {
    await page.goto('/student/quiz');
    
    // Should show subject selection
    await expect(page.locator('text=/subject|topic/i')).toBeVisible();
    
    // Should show difficulty options
    await expect(page.locator('text=/easy|medium|hard/i')).toBeVisible();
  });

  test('should generate and display quiz questions', async ({ page }) => {
    await page.goto('/student/quiz');
    
    // Select a subject
    await page.click('text=/mathematics|physics|chemistry/i');
    
    // Click generate or start quiz
    await page.click('button:has-text("Generate"), button:has-text("Start")');
    
    // Wait for questions to load
    await expect(page.locator('text=/question/i')).toBeVisible({ timeout: 15000 });
  });

  test('should allow answering multiple choice questions', async ({ page }) => {
    await page.goto('/student/quiz');
    
    // Generate a quiz
    await page.click('text=/mathematics/i');
    await page.click('button:has-text("Generate"), button:has-text("Start")');
    
    // Wait for question
    await page.waitForSelector('text=/question/i', { timeout: 15000 });
    
    // Select an answer
    const answerOptions = page.locator('input[type="radio"], button[role="radio"]');
    if (await answerOptions.count() > 0) {
      await answerOptions.first().click();
      
      // Submit answer
      await page.click('button:has-text("Submit"), button:has-text("Next")');
      
      // Should show feedback
      await expect(page.locator('text=/correct|incorrect|explanation/i')).toBeVisible();
    }
  });

  test('should track quiz progress', async ({ page }) => {
    await page.goto('/student/quiz');
    
    await page.click('text=/mathematics/i');
    await page.click('button:has-text("Generate"), button:has-text("Start")');
    
    await page.waitForSelector('text=/question/i', { timeout: 15000 });
    
    // Should show progress indicator
    await expect(page.locator('text=/\\d+\\/\\d+|question \\d+ of \\d+/i')).toBeVisible();
  });

  test('should display quiz results at the end', async ({ page }) => {
    await page.goto('/student/quiz');
    
    await page.click('text=/mathematics/i');
    await page.click('button:has-text("Generate"), button:has-text("Start")');
    
    // Answer all questions (simplified - assumes 3 questions)
    for (let i = 0; i < 3; i++) {
      await page.waitForSelector('text=/question/i', { timeout: 15000 });
      
      const answerOptions = page.locator('input[type="radio"], button[role="radio"]');
      if (await answerOptions.count() > 0) {
        await answerOptions.first().click();
        await page.click('button:has-text("Submit"), button:has-text("Next")');
        await page.waitForTimeout(1000);
      }
    }
    
    // Should show results
    await expect(page.locator('text=/score|results|completed/i')).toBeVisible({ timeout: 10000 });
  });
});
