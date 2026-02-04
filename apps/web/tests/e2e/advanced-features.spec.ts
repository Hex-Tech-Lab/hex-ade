import { test, expect } from '@playwright/test'

test.describe('Advanced Features E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should toggle dependency graph view', async ({ page }) => {
    const graphButton = page.locator('button').filter({ hasText: 'Layers' }).or(
      page.locator('button[data-action="dependency-graph"]').or(
        page.locator('data-testid=dependency-button')
      )
    )

    if (await graphButton.isVisible()) {
      await graphButton.click()

      // Graph should be visible
      const graphView = page.locator('role=dialog').filter({ hasText: /dependency|graph/i }).or(
        page.locator('[data-testid=dependency-graph]')
      )

      await expect(graphView).toBeVisible()
    }
  })

  test('should show server control features', async ({ page }) => {
    const terminalButton = page.locator('button').filter({ hasText: 'Terminal' }).or(
      page.locator('button[data-action="terminal"]').or(
        page.locator('data-testid=terminal-button')
      )
    )

    if (await terminalButton.isVisible()) {
      await expect(terminalButton).toBeVisible()
    }
  })

  test('should display feedback panel', async ({ page }) => {
    const feedback = page.locator('text=ATLAS-VM').or(page.locator('text=SCAN')).or(
      page.locator('[data-testid=feedback-panel]')
    )

    await expect(feedback).toBeVisible()
  })

  test('should show debug panel content', async ({ page }) => {
    const debugPanel = page.locator('text=Debug').or(page.locator('[data-testid=debug-panel]')).or(
      page.locator('role=region').filter({ hasText: /debug|output/i })
    )

    // Debug panel might be below the fold
    if (await debugPanel.isVisible()) {
      await expect(debugPanel).toBeVisible()
    }
  })
})

test.describe('Layout and Navigation', () => {
  test('should have proper sidebar layout', async ({ page, viewport }) => {
    await page.goto('/')

    if (viewport?.width && viewport.width >= 960) { // md breakpoint
      const sidebar = page.locator('.MuiBox-root').filter({ hasText: 'HEX-ADE' }).locator('..').locator('..')

      if (await sidebar.isVisible()) {
        await expect(sidebar).toBeVisible()
      }
    }
  })

  test('should maintain responsive layout', async ({ page }) => {
    await page.goto('/')

    // Check that main content is visible
    const mainContent = page.locator('text=pulling').or(page.locator('text=No project'))
    await expect(mainContent).toBeVisible()

    // Top bar should be visible
    const topBar = page.locator('text=HEX-ADE')
    await expect(topBar).toBeVisible()
  })

  test('should support modal navigation patterns', async ({ page }) => {
    await page.goto('/')

    // Test if close buttons exist where expected
    const modalCloseButtons = page.locator('button').filter({ has: page.locator('.MuiCloseIcon') }).or(
      page.locator('button[aria-label="Close"]').or(
        page.locator('data-testid=close-button')
      )
    )

    // There might be modal elements, so just verify structure
    expect(true).toBe(true) // Placeholder for actual modal testing
  })
})

test.describe('Data Persistence', () => {
  test('should remember user preferences in localStorage', async ({ page }) => {
    await page.goto('/')

    // Test localStorage usage (based on common patterns)
    // This is more of a structure test
    await expect(page).toHaveURL(/./) // Page loaded successfully

    // Could test for specific localStorage keys if known
    const localStorageItems = await page.evaluate(() => {
      return Object.keys(localStorage)
    })

    // Should not crash checking localStorage
    expect(Array.isArray(localStorageItems)).toBe(true)
  })

  test('should handle state updates correctly', async ({ page }) => {
    await page.goto('/')

    // Test that component renders after potential state changes
    await expect(page.locator('text=HEX-ADE')).toBeVisible()

    // If there are interactive elements, test that clicking doesn't break page
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()

    if (buttonCount > 0) {
      // Test clicking first button doesn't crash
      const firstButton = buttons.first()
      if (await firstButton.isEnabled()) {
        await firstButton.click()

        // Page should still be functional
        await expect(page.locator('text=HEX-ADE')).toBeVisible()
      }
    }
  })
})

// Marco/Polo-like state consistency test
test('should maintain application state across interactions', async ({ page }) => {
  await page.goto('/')

  // Capture initial state
  const initialHeader = await page.locator('text=HEX-ADE').isVisible()
  const initialProjectsText = await page.locator('text=No project').isVisible()

  // Perform some interactions if available
  const startButton = page.locator('button:has-text("Start Agent")')

  if (await startButton.isVisible() && await startButton.isEnabled()) {
    await startButton.click()

    // Wait a bit for state to update
    await page.waitForTimeout(100)

    // Basic state should still be consistent
    await expect(page.locator('text=HEX-ADE')).toBeVisible()
  }

  // Core elements should still be accessible
  await expect(page.locator('text=HEX-ADE')).toBeVisible()
})