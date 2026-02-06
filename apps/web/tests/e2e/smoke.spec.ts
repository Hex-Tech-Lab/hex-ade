import { test, expect } from '@playwright/test'

test.describe('Smoke Tests', () => {
  test('should load homepage and display loading or content', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/')
    
    // Wait for initial page load
    await page.waitForLoadState('domcontentloaded')
    
    // Verify the page loads with correct title
    await expect(page).toHaveTitle(/hex-ade/i)
    
    // Wait a bit for either content to load or error to appear
    await page.waitForTimeout(5000)
    
    // Check page content - should have HEX-ADE text somewhere
    const pageContent = await page.content()
    const hasHexAde = pageContent.includes('HEX-ADE')
    const isLoading = pageContent.includes('CircularProgress') || await page.locator('[role="progressbar"]').count() > 0
    
    // Either we see the content or we're in loading state
    expect(hasHexAde || isLoading).toBe(true)
    
    // Take a screenshot for verification
    await page.screenshot({ path: 'test-results/homepage-state.png', fullPage: true })
    
    // If not loading, try to interact with the Project dropdown
    if (!isLoading) {
      // Find the project selector
      const projectSelect = page.locator('#project-select-label').locator('..').locator('.MuiSelect-root')
      
      if (await projectSelect.isVisible().catch(() => false)) {
        await projectSelect.click()
        
        // Wait for dropdown to appear
        await page.waitForSelector('.MuiPaper-root[role="presentation"]', { state: 'visible', timeout: 5000 })
        
        // Find and click "New Project" option
        const newProjectOption = page.getByText('New Project')
        if (await newProjectOption.isVisible().catch(() => false)) {
          await newProjectOption.click()
          
          // Wait for navigation
          await page.waitForURL('**/projects/new', { timeout: 10000 })
          
          // Verify we're on the new project page
          await expect(page.getByRole('heading', { name: 'Create New Project' })).toBeVisible()
        }
      }
    }
  })

  test('should load new project wizard page', async ({ page }) => {
    // Navigate to the new project page directly
    await page.goto('/projects/new')
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle')
    
    // Verify we're on the new project page by checking heading
    const heading = page.getByRole('heading', { name: 'Create New Project' })
    await expect(heading).toBeVisible()
    
    // Verify the stepper is visible with specific step labels
    await expect(page.getByText('Project Details').first()).toBeVisible()
    await expect(page.getByText('Configuration').first()).toBeVisible()
    await expect(page.getByText('Review & Create').first()).toBeVisible()
    
    // Verify form fields are present on step 1
    await expect(page.getByLabel('Project Name')).toBeVisible()
    await expect(page.getByLabel('Project Path')).toBeVisible()
    
    // Take a screenshot for verification
    await page.screenshot({ path: 'test-results/new-project-page.png', fullPage: true })
  })

  test('should complete new project wizard flow', async ({ page }) => {
    // Navigate to the new project page directly
    await page.goto('/projects/new')
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle')
    
    // Verify we're on step 1
    await expect(page.getByRole('heading', { name: 'Project Details' })).toBeVisible()
    
    // Fill in project name
    await page.getByLabel('Project Name').fill('Test Project')
    
    // Fill in project path
    await page.getByLabel('Project Path').fill('/tmp/test-project')
    
    // Click Next button (avoid Next.js dev tools button)
    await page.locator('button:has-text("Next"):not([id])').click()
    
    // Wait for step 2 (Configuration)
    await expect(page.getByRole('heading', { name: 'Configuration' })).toBeVisible()
    // Use a more robust selector for the MUI Select dropdown
    await expect(page.locator('.MuiSelect-root').filter({ hasText: /concurrent agent/ })).toBeVisible()
    
    // Take screenshot of step 2
    await page.screenshot({ path: 'test-results/wizard-step2.png' })
    
    // Click Next to go to review (avoid Next.js dev tools button)
    await page.locator('button:has-text("Next"):not([id])').click()
    
    // Wait for step 3 (Review & Create)
    await expect(page.getByRole('heading', { name: 'Review & Create' })).toBeVisible()
    
    // Verify the entered data is displayed
    await expect(page.getByText('Test Project')).toBeVisible()
    await expect(page.getByText('/tmp/test-project')).toBeVisible()
    
    // Take screenshot of review step
    await page.screenshot({ path: 'test-results/wizard-review.png' })
    
    // Verify Create Project button is present
    await expect(page.getByRole('button', { name: 'Create Project' })).toBeVisible()
  })

  test('should verify main dashboard components structure', async ({ page }) => {
    await page.goto('/')
    
    // Wait for initial load
    await page.waitForLoadState('domcontentloaded')
    
    // Wait for either content or timeout
    await page.waitForTimeout(3000)
    
    // Check page content
    const pageContent = await page.content()
    
    // Should contain HEX-ADE branding
    expect(pageContent).toContain('HEX-ADE')
    
    // Take screenshot to see current state
    await page.screenshot({ path: 'test-results/dashboard-structure.png', fullPage: true })
    
    // Check if we're in loading state or have content
    const loadingSpinner = page.locator('[role="progressbar"], .MuiCircularProgress-root')
    const isLoading = await loadingSpinner.isVisible().catch(() => false)
    
    if (!isLoading) {
      // If not loading, verify key elements exist
      await expect(page.locator('body')).toBeVisible()
      
      // Check for AppBar or main container
      const appBar = page.locator('header, .MuiAppBar-root')
      if (await appBar.isVisible().catch(() => false)) {
        console.log('AppBar is visible')
      }
    }
  })
})
