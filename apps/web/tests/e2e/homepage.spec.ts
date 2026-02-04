import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load and have correct title', async ({ page }) => {
    await page.goto('/')
    
    await page.waitForLoadState('load')
    await expect(page).toHaveTitle(/hex-ade/i)
  })

  test('should render successfully', async ({ page }) => {
    await page.goto('/')
    
    await page.waitForLoadState('load')
    await expect(page.locator('body')).toBeVisible()
  })
})
