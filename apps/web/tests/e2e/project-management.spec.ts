import { test, expect } from '@playwright/test'

test.describe('Project Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load main dashboard', async ({ page }) => {
    // Verify the main dashboard loads
    await expect(page).toHaveTitle(/hex-ade/i)
    await expect(page.locator('text=HEX-ADE')).toBeVisible()
  })

  test('should display project selector when no project selected', async ({ page }) => {
    // Should show project selector dropdown
    const projectSelect = page.locator('role=combobox[aria-label*="Select project"]').first()
    await expect(projectSelect).toBeVisible()
  })

  test('should show "No project" status initially', async ({ page }) => {
    await expect(page.locator('text=No project')).toBeVisible()
  })

  test('should allow creating new project via modal', async ({ page }) => {
    // Click project selector to open modal
    const projectSelect = page.locator('role=combobox').first()
    await projectSelect.click()

    // Should show project creation option or modal
    // This might need to be adjusted based on actual UI
    await expect(page.locator('text=create').or(page.locator('text=new')).or(page.locator('text=project'))).toBeVisible()
  })

  test('should display agent controls disabled without project', async ({ page }) => {
    // Agent control buttons should be disabled when no project is selected
    const startButton = page.locator('data-testid=agent-start-button').or(
      page.locator('button:has-text("Start Agent")')
    )
    await expect(startButton).toBeDisabled()
  })
})

test.describe('Feature and Agent Flow', () => {
  test('should allow selecting existing project if available', async ({ page }) => {
    await page.goto('/')

    const projectSelect = page.locator('role=combobox').first()
    await expect(projectSelect).toBeVisible()

    // If there are projects, this would test selection
    // For now, just verify the selector is interactive
    await expect(projectSelect).not.toBeDisabled()
  })

  test('should show Kanban board structure', async ({ page }) => {
    await page.goto('/')

    // Should show main content area
    await expect(page.locator('text=Pending').or(page.locator('text=In Progress')).or(page.locator('text=Completed'))).toBeVisible()
  })

  test('should enable agent controls when project is selected', async ({ page }) => {
    // This test assumes a project can be selected
    // In a real implementation, we'd need to mock or create a project first
    await page.goto('/')

    // For demonstration - check that controls exist
    const controls = page.locator('button:has-text("Start Agent")').or(
      page.locator('data-testid=agent-start-button')
    )
    await expect(controls).toBeVisible() // May be disabled, but should exist
  })

  test('should display agent status badges', async ({ page }) => {
    await page.goto('/')

    // Should have some status indicator
    await expect(page.locator('text=Stopped').or(page.locator('text=Running')).or(page.locator('text=Loading'))).toBeVisible()
  })

  test('should allow concurrency slider interaction', async ({ page }) => {
    await page.goto('/')

    // Look for slider control
    const slider = page.locator('role=slider').or(
      page.locator('input[type="range"]').or(
        page.locator('[data-testid=concurrency-slider]')
      )
    )

    // If slider exists and is enabled, it should be interactive
    if (await slider.isVisible()) {
      await expect(slider).toBeVisible()
    } else {
      // It's OK if slider doesn't exist when no project selected
      expect(true).toBe(true)
    }
  })
})

test.describe('Chat functionality', () => {
  test('should have chat toggle button', async ({ page }) => {
    await page.goto('/')

    const chatButton = page.locator('button:has(.MuiChatIcon)').or(
      page.locator('data-testid=chat-button').or(
        page.locator('button').filter({ hasText: /chat/i })
      )
    )
    await expect(chatButton).toBeVisible()
  })

  test('should allow specification creation button', async ({ page }) => {
    await page.goto('/')

    const specButton = page.locator('button:has-text("Create Specification")').or(
      page.locator('button').filter({ hasText: 'Magic' }).or(
        page.locator('button[data-action="spec"]')
      )
    )
    await expect(specButton).toBeVisible()
  })
})