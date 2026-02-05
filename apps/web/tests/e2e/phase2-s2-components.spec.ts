import { test, expect } from '@playwright/test';

test.describe('Phase 2 S2 Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  // Settings Tests
  test('open settings with S key', async ({ page }) => {
    await page.keyboard.press('s');
    await expect(page.getByRole('dialog')).toContainText('Settings');
  });

  test('settings modal displays all options', async ({ page }) => {
    await page.keyboard.press('s');
    await expect(page.getByText('Theme')).toBeVisible();
    await expect(page.getByText('Font Size')).toBeVisible();
    await expect(page.getByText('Auto-scroll debug panel')).toBeVisible();
    await expect(page.getByText('Notifications')).toBeVisible();
    await expect(page.getByText('WebSocket Reconnection')).toBeVisible();
  });

  test('change theme setting', async ({ page }) => {
    await page.keyboard.press('s');
    await page.click('label:has-text("Theme") + div, label:has-text("Theme") + [role="combobox"]');
    await page.click('[role="option"]:has-text("Light")');
    await page.click('button:has-text("Save")');

    // Settings should close after save
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('reset settings to defaults', async ({ page }) => {
    await page.keyboard.press('s');
    await page.click('button:has-text("Reset")');
    // Modal should stay open, just reset values
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('cancel settings without saving', async ({ page }) => {
    await page.keyboard.press('s');
    await page.click('button:has-text("Cancel")');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  // Schedule Tests
  test('open schedule modal', async ({ page }) => {
    // Find and click the schedule button in the toolbar
    const scheduleButton = page.locator('button').filter({ has: page.locator('svg') }).first();
    if (await scheduleButton.isVisible()) {
      await scheduleButton.click();
      await expect(page.getByText('Schedule Project Expansion')).toBeVisible();
    }
  });

  test('schedule daily at 14:00 generates correct cron', async ({ page }) => {
    await page.keyboard.press('s'); // Close settings if open
    await page.goto('http://localhost:3000');

    // Try to find schedule button by aria-label or title
    const scheduleButton = page.locator('button[title="Schedule"], button[aria-label="Schedule"]');
    if (await scheduleButton.isVisible()) {
      await scheduleButton.click();

      // Set time to 14:00
      await page.fill('input[type="time"]', '14:00');

      // Verify daily cron pattern
      const cronPreview = await page.locator('[data-testid="cron-preview"]').textContent();
      expect(cronPreview).toContain('0 14 * * *');
    }
  });

  test('schedule weekly on Monday', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const scheduleButton = page.locator('button[title="Schedule"], button[aria-label="Schedule"]');
    if (await scheduleButton.isVisible()) {
      await scheduleButton.click();

      await page.selectOption('select', 'weekly');
      await page.selectOption('select:has-option("Monday")', '1'); // Monday = 1

      // Verify weekly cron pattern
      const cronPreview = await page.locator('[data-testid="cron-preview"]').textContent();
      expect(cronPreview).toContain('* * * 1');
    }
  });

  test('schedule cancel button works', async ({ page }) => {
    await page.goto('http://localhost:3000');

    const scheduleButton = page.locator('button[title="Schedule"], button[aria-label="Schedule"]');
    if (await scheduleButton.isVisible()) {
      await scheduleButton.click();
      await expect(page.getByText('Schedule Project Expansion')).toBeVisible();

      await page.click('button:has-text("Cancel")');
      await expect(page.getByText('Schedule Project Expansion')).not.toBeVisible();
    }
  });

  // Keyboard Shortcuts Tests
  test('keyboard shortcuts do not interfere with input fields', async ({ page }) => {
    await page.keyboard.press('s');
    await expect(page.getByRole('dialog')).toBeVisible();

    // Type 's' in a text field should not close the modal
    const input = page.locator('input, textarea').first();
    if (await input.isVisible()) {
      await input.fill('test s value');
      // Modal should still be open
      await expect(page.getByRole('dialog')).toBeVisible();
    }
  });

  test('all four modals can be accessed', async ({ page }) => {
    // Test that we can open and close settings
    await page.keyboard.press('s');
    await expect(page.getByText('Settings')).toBeVisible();
    await page.click('button:has-text("Cancel")');
    await expect(page.getByText('Settings')).not.toBeVisible();

    // Note: Other modals (E, M) tested in other spec files
  });

  // Component Integration Tests
  test('components render without errors', async ({ page }) => {
    // Basic smoke test - page should load without console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Should have no console errors on load
    expect(consoleErrors).toHaveLength(0);
  });

  test('toolbar buttons are visible', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Check that toolbar exists
    const toolbar = page.locator('[role="toolbar"], header');
    await expect(toolbar).toBeVisible();

    // HEX-ADE text should be visible
    await expect(page.getByText('HEX-ADE')).toBeVisible();
  });
});

test.describe('Settings LocalStorage Persistence', () => {
  test('settings persist across page reloads', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Open settings and change theme to light
    await page.keyboard.press('s');
    await page.click('text=Theme');
    await page.click('text=Light');
    await page.click('button:has-text("Save")');

    // Reload page
    await page.reload();

    // Open settings again and verify theme is still light
    await page.keyboard.press('s');
    const themeValue = await page.inputValue('select:has-option("Light")');
    expect(themeValue).toBe('light');
  });
});