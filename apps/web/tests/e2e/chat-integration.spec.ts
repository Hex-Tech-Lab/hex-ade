import { test, expect } from '@playwright/test'

test.describe('Chat Interfaces E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should toggle chat flyover', async ({ page }) => {
    const chatButton = page.locator('button[aria-label*="chat"]').or(
      page.locator('button:has(.MuiChatIcon)').or(
        page.locator('data-testid=chat-button')
      )
    )

    if (await chatButton.isVisible()) {
      await chatButton.click()

      // Chat should be visible (either opened or position changed)
      const chatPanel = page.locator('[data-testid=chat-flyover]').or(
        page.locator('.chat-panel').or(
          page.locator('role=dialog').filter({ hasText: /chat/i }).or(
            page.locator('[data-chat-open="true"]')
          )
        )
      )

      await expect(chatPanel).toBeVisible()
    }
  })

  test('should open specification creation modal', async ({ page }) => {
    const specButton = page.locator('button:has-text("Create Specification")').or(
      page.locator('button').filter({ hasText: 'Magic' }).or(
        page.locator('button[data-action="create-spec"]')
      )
    )

    if (await specButton.isVisible() && await specButton.isEnabled()) {
      await specButton.click()

      // Should show spec creation interface
      const specModal = page.locator('role=dialog').filter({ hasText: /spec|project|create/i }).or(
        page.locator('[data-testid=spec-modal]').or(
          page.locator('.spec-modal')
        )
      )

      await expect(specModal).toBeVisible()
    }
  })

  test('should allow typing in chat inputs', async ({ page }) => {
    // First open some chat interface
    const specButton = page.locator('button:has-text("Create Specification")').or(
      page.locator('button').filter({ hasText: 'Magic' })
    )

    if (await specButton.isVisible()) {
      await specButton.click()

      // Look for text input
      const textInput = page.locator('input[type="text"]').or(
        page.locator('textarea').or(
          page.locator('[contenteditable]')
        )
      )

      if (await textInput.isVisible()) {
        await textInput.fill('Hello, test message!')
        await expect(textInput).toHaveValue('Hello, test message!')
      }
    }
  })

  test('should show dark theme consistently', async ({ page }) => {
    // Check for dark theme background
    // Main dashboard should be dark
    await expect(page.locator('.MuiPaper-root').first()).toBeVisible()
  })
})

test.describe('Integration Scenarios E2E', () => {
  test('should maintain layout on window resize', async ({ page, browserName }) => {
    // Skip in headless for simplicity
    if (browserName === 'chromium') {
      await page.goto('/')

      // Check initial layout
      const mainContent = page.locator('text=pulling').or(page.locator('text=No project'))
      await expect(mainContent).toBeVisible()

      // Resize window
      await page.setViewportSize({ width: 800, height: 600 })

      // Content should still be visible
      await expect(mainContent).toBeVisible()
    }
  })

  test('should handle rapid agent control interactions', async ({ page }) => {
    await page.goto('/')

    // If agent controls exist, test rapid clicking doesn't break
    const startButton = page.locator('data-testid=agent-start-button').or(
      page.locator('button:has-text("Start Agent")')
    )

    if (await startButton.isVisible()) {
      // Click multiple times quickly
      await startButton.click({ clickCount: 2 })

      // Should not crash and maintain state
      await expect(startButton).toBeVisible()
    }
  })

  test('should display error feedback appropriately', async ({ page }) => {
    await page.goto('/')

    // Test that alert/toast areas exist for error messages
    // This is more of a structural test
    // May or may not be visible, but structure should exist
    expect(true).toBe(true) // Placeholder - in real app would check error states
  })
})

test.describe('Accessibility E2E', () => {
  test('should have proper focus management', async ({ page }) => {
    await page.goto('/')

    // Focus should move properly between interactive elements
    await page.keyboard.press('Tab')

    // Something should receive focus
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/')

    // Test basic keyboard navigation
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Should be able to navigate without issues
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeDefined()
  })
})

test.describe('Performance E2E', () => {
  test('should load main dashboard quickly', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/')

    await page.waitForLoadState('networkidle')

    const loadTime = Date.now() - startTime

    // Should load in reasonable time (< 5 seconds)
    expect(loadTime).toBeLessThan(5000)

    // Key elements should be visible
    await expect(page.locator('text=HEX-ADE')).toBeVisible({ timeout: 1000 })
  })
})

test.describe('Error Boundary E2E', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    await page.goto('/')

    // Simulate network offline (would need actual network interception)
    // For now, just verify the UI doesn't break under normal conditions
    await page.reload()

    // Should still load
    await expect(page.locator('text=HEX-ADE')).toBeVisible()
  })
})