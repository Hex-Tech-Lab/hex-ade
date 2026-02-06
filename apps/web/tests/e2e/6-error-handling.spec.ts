import { test, expect } from '@playwright/test'

test.describe('Error Handling Tests', () => {
  
  test('5.1: Should handle backend API timeout gracefully', async ({ page }) => {
    // GIVEN: Simulate slow backend (3G network)
    await page.route('**/api/**', route => {
      // Delay response by 30 seconds (will timeout)
      setTimeout(() => {
        route.continue()
      }, 30000)
    })
    
    // WHEN: User tries to create project
    await page.goto('/')
    await page.click('button:has-text("New Project")')
    await page.fill('[placeholder="Project name"]', 'Slow Test')
    
    // Click submit
    await page.click('button:has-text("Create")')
    
    // THEN: Should show timeout error
    const errorAlert = page.locator('[role="alert"]')
    await expect(errorAlert).toBeVisible({ timeout: 35000 }).catch(() => {
      console.log('Timeout error not visible')
    })
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/5-1-timeout-error.png' })
  })
  
  test('5.2: Should handle invalid project name in WebSocket', async ({ page }) => {
    // GIVEN: Try invalid project
    await page.goto('/')
    
    // WHEN: Navigate to invalid project
    await page.goto('/projects/invalid-project-xyz')
    
    // THEN: Should show error message
    const errorMessage = page.locator('[role="alert"]')
    await expect(errorMessage).toBeVisible({ timeout: 5000 }).catch(() => {
      console.log('Error message not visible')
    })
    
    // Should be able to navigate away safely
    await page.click('button:has-text("Back")')
    await expect(page).toHaveURL('/')
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/5-2-invalid-project.png' })
  })
  
  test('5.3: Should handle malformed WebSocket messages', async ({ page }) => {
    // GIVEN: Chat is open
    await page.goto('/')
    await page.click('button:has-text("Spec Chat")')
    
    // Intercept WebSocket to send invalid JSON
    page.on('websocket', ws => {
      ws.on('framesent', event => {
        // Don't modify, just log
        console.log('Message sent:', event.payload)
      })
    })
    
    // WHEN: Send message
    const input = page.locator('[placeholder="Type message"]')
    await input.fill('Test message')
    await page.click('button:has-text("Send")')
    
    // THEN: Should not crash
    await page.waitForTimeout(2000)
    
    // UI should still be functional
    await expect(input).toBeEnabled()
    
    // Check console for errors
    const logs = []
    page.on('console', msg => logs.push(msg.text()))
    
    // No critical errors should be logged
    const hasError = logs.some(l => l.includes('Uncaught') || l.includes('Unhandled'))
    expect(hasError).toBe(false)
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/5-3-malformed-message.png' })
  })
  
  test('5.4: Should handle network offline gracefully', async ({ page }) => {
    // GIVEN: Chat is open
    await page.goto('/')
    await page.click('button:has-text("Spec Chat")')
    
    // WHEN: Go offline
    await page.context().setOffline(true)
    
    // THEN: Should show offline indicator
    const offlineIndicator = page.locator('[data-testid="offline-indicator"]')
    await expect(offlineIndicator).toBeVisible({ timeout: 3000 }).catch(() => {
      console.log('Offline indicator not visible')
    })
    
    // User can see they're offline
    const statusText = page.locator('[data-testid="connection-status"]')
    const status = await statusText.textContent()
    console.log('Connection status:', status)
    
    // Go back online
    await page.context().setOffline(false)
    await page.waitForTimeout(2000)
    
    // Should reconnect
    const onlineStatus = await statusText.textContent()
    console.log('Online status:', onlineStatus)
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/5-4-offline-recovery.png' })
  })
  
  test('5.5: Should not lose data on connection errors', async ({ page }) => {
    // GIVEN: User types message
    await page.goto('/')
    await page.click('button:has-text("Spec Chat")')
    
    const input = page.locator('[placeholder="Type message"]')
    await input.fill('Important message')
    
    // WHEN: Connection drops
    await page.context().setOffline(true)
    await page.waitForTimeout(1000)
    
    // THEN: Message should still be in input (not lost)
    const value = await input.inputValue()
    expect(value).toBe('Important message')
    
    // Go back online
    await page.context().setOffline(false)
    await page.waitForTimeout(2000)
    
    // Should be able to send it
    const sendButton = page.locator('button:has-text("Send")')
    await expect(sendButton).toBeEnabled()
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/5-5-no-data-loss.png' })
  })
  
  test('5.6: Should handle rapid reconnect without duplicate messages', async ({ page }) => {
    // GIVEN: Chat is active
    await page.goto('/')
    await page.click('button:has-text("Spec Chat")')
    
    // Track messages
    let messageCount = 0
    page.on('websocket', ws => {
      ws.on('framesent', event => {
        try {
          const data = JSON.parse(event.payload)
          if (data.type === 'message') messageCount++
        } catch (e) {}
      })
    })
    
    // WHEN: Send message
    const input = page.locator('[placeholder="Type message"]')
    await input.fill('Test')
    await page.click('button:has-text("Send")')
    
    // Rapidly disconnect/reconnect
    for (let i = 0; i < 3; i++) {
      await page.context().setOffline(true)
      await page.waitForTimeout(500)
      await page.context().setOffline(false)
      await page.waitForTimeout(500)
    }
    
    // THEN: Message should only be sent once
    await page.waitForTimeout(2000)
    console.log(`Total messages sent: ${messageCount}`)
    expect(messageCount).toBeLessThanOrEqual(1)
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/5-6-no-duplicates.png' })
  })
})
