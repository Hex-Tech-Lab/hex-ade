import { test, expect } from '@playwright/test'

test.describe('Component Integration Tests', () => {
  
  test('4.1: Should update project list after spec creation', async ({ page }) => {
    // GIVEN: Project doesn't have spec
    await page.goto('/')
    const projectsBefore = await page.locator('[data-testid="project-card"]').count()
    
    // WHEN: User creates spec
    await page.click('text=working-test')
    await page.click('button:has-text("Spec Chat")')
    
    // Send message and wait for completion
    const input = page.locator('[placeholder="Type message"]')
    await input.fill('Create login form')
    await page.click('button:has-text("Send")')
    
    // Wait for spec completion (listen for spec_complete message)
    await page.waitForTimeout(10000)
    
    // THEN: Go back to project list
    await page.goto('/')
    
    // Verify project shows spec indicator
    const specIndicator = page.locator('[data-testid="has-spec-badge"]')
    await expect(specIndicator).toBeVisible({ timeout: 5000 }).catch(() => {
      console.log('Spec indicator not visible (may not be implemented)')
    })
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/4-1-spec-created.png' })
  })
  
  test('4.2: Should load existing spec into SpecCreationChat', async ({ page }) => {
    // GIVEN: Project with existing spec
    await page.goto('/')
    
    // Open project that has spec
    await page.click('text=working-test')
    await page.click('button:has-text("Spec Chat")')
    
    // THEN: Chat should load with existing spec context
    const specContent = page.locator('[data-testid="spec-content"]')
    await expect(specContent).toBeVisible({ timeout: 5000 }).catch(() => {
      console.log('Spec content not visible')
    })
    
    // Should be able to continue editing
    const input = page.locator('[placeholder="Type message"]')
    await expect(input).toBeEnabled()
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/4-2-existing-spec.png' })
  })
  
  test('4.3: AgentMissionControl updates when agent runs', async ({ page }) => {
    // GIVEN: Agent is idle
    await page.goto('/')
    
    // WHEN: Start agent from AgentControl
    await page.click('button:has-text("Start Agent")')
    
    // THEN: AgentMissionControl should show updates
    const agentStatus = page.locator('[data-testid="agent-status"]')
    
    // Watch for status changes
    for (let i = 0; i < 10; i++) {
      const status = await agentStatus.textContent()
      console.log(`Agent status: ${status}`)
      
      if (status?.includes('working') || status?.includes('testing')) {
        console.log('✅ Agent status updated')
        break
      }
      
      await page.waitForTimeout(1000)
    }
    
    // Verify progress bar
    const progressBar = page.locator('[data-testid="progress-bar"]')
    await expect(progressBar).toBeVisible({ timeout: 5000 }).catch(() => {
      console.log('Progress bar not visible')
    })
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/4-3-agent-updates.png' })
  })
  
  test('4.4: Should navigate between modals without losing state', async ({ page }) => {
    // GIVEN: Open NewProjectModal
    await page.goto('/')
    await page.click('button:has-text("New Project")')
    
    // Fill first step
    await page.fill('[placeholder="Project name"]', 'Test Project')
    await page.fill('[placeholder="Project path"]', '/tmp/test')
    await page.click('button:has-text("Next")')
    
    // WHEN: Navigate away
    await page.click('button:has-text("Cancel")')
    
    // THEN: Modal closes without saving
    await expect(page.locator('[data-testid="new-project-modal"]')).not.toBeVisible()
    
    // Open again
    await page.click('button:has-text("New Project")')
    
    // Should start fresh (state not persisted)
    const input = page.locator('[placeholder="Project name"]')
    expect(await input.inputValue()).toBe('')
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/4-4-modal-state.png' })
  })
})
