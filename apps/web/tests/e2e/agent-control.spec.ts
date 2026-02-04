import { test, expect } from '@playwright/test'

test.describe('AgentControl Component', () => {
  test('should display start button when agent is stopped', async ({ page }) => {
    await page.goto('/')
    
    const startButton = page.locator('[data-testid="agent-start-button"]').first()
    await expect(startButton).toBeVisible()
  })

  test('should display stop button when agent is running', async ({ page }) => {
    await page.goto('/')
    
    const stopButton = page.locator('[data-testid="agent-stop-button"]').first()
    await expect(stopButton).toBeVisible()
  })

  test('should display concurrency slider', async ({ page }) => {
    await page.goto('/')
    
    const slider = page.locator('[role="slider"]').first()
    await expect(slider).toBeVisible()
  })

  test('should display status badge', async ({ page }) => {
    await page.goto('/')
    
    const statusBadge = page.locator('[data-testid="agent-status-badge"]').first()
    await expect(statusBadge).toBeVisible()
  })
})
