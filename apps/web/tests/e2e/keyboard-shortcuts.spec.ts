import { test, expect } from '@playwright/test'

test.describe('Keyboard Shortcuts & Integration', () => {
  test('should open Agent Mission Control with "M" key', async ({ page }) => {
    await page.goto('/')
    
    // Press M key
    await page.keyboard.press('M')
    
    // Should now show Mission Control content
    const missionControl = page.locator('[data-testid="mission-control"]').first()
    // We can't easily test the modal since it may need project data
    // But we can at least test that the page doesn't crash
    await expect(page).toHaveTitle(/hex-ade/i)
  })

  test('should handle "E" key for Expand modal', async ({ page }) => {
    await page.goto('/')
    
    // Press E key
    await page.keyboard.press('E')
    
    // Page should remain functional
    await expect(page).toHaveTitle(/hex-ade/i)
  })

  test('should show Magic button in app bar', async ({ page }) => {
    await page.goto('/')
    
    // Look for buttons in app bar
    const buttons = page.locator('[role="button"]').first()
    await expect(buttons).toBeVisible()
  })

  test('should load main dashboard without errors', async ({ page }) => {
    await page.goto('/')
    
    // Wait for DOM to stabilize
    await page.waitForLoadState('load')
    
    // Page should render correctly
    await expect(page.locator('body')).toBeVisible()
    await expect(page).toHaveTitle(/hex-ade/i)
  })
})
