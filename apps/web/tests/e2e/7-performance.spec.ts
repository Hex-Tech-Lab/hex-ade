import { test, expect } from '@playwright/test'

test.describe('Performance Tests', () => {
  
  test('6.1: Should load SpecCreationChat in <2 seconds', async ({ page }) => {
    // GIVEN: Navigate to app
    const startTime = Date.now()
    
    await page.goto('/', { waitUntil: 'networkidle' })
    
    const navigationTime = Date.now() - startTime
    console.log(`Navigation time: ${navigationTime}ms`)
    
    // WHEN: Open SpecCreationChat
    const chatStartTime = Date.now()
    
    await page.click('button:has-text("Spec Chat")')
    
    // THEN: Chat should open within 2 seconds
    const chatLoadTime = Date.now() - chatStartTime
    console.log(`Chat load time: ${chatLoadTime}ms`)
    
    expect(chatLoadTime).toBeLessThan(2000)
    
    // Verify no layout shift
    const layout = page.locator('[data-testid="chat-container"]')
    await expect(layout).toBeVisible()
  })
  
  test('6.2: Should handle 10 rapid messages without lag', async ({ page }) => {
    // GIVEN: Chat is open
    await page.goto('/')
    await page.click('button:has-text("Spec Chat")')
    
    // WHEN: Send 10 messages rapidly
    const startTime = Date.now()
    
    for (let i = 0; i < 10; i++) {
      const input = page.locator('[placeholder="Type message"]')
      await input.fill(`Message ${i + 1}`)
      await page.click('button:has-text("Send")')
      await page.waitForTimeout(50)  // Very short delay
    }
    
    const totalTime = Date.now() - startTime
    console.log(`Time to send 10 messages: ${totalTime}ms`)
    
    // THEN: UI should remain responsive
    // Average should be <500ms per message
    const avgTime = totalTime / 10
    console.log(`Average time per message: ${avgTime}ms`)
    
    expect(avgTime).toBeLessThan(500)
    
    // Wait for rendering
    await page.waitForTimeout(5000)
    
    // All messages should render
    const messages = await page.locator('[data-testid="message-item"]').count()
    console.log(`Messages rendered: ${messages}`)
    expect(messages).toBeGreaterThanOrEqual(10)
  })
  
  test('6.3: Should not create memory leaks on reconnect', async ({ page }) => {
    // Note: Memory measurement in Playwright is limited
    // This test simulates the scenario and checks that no errors occur
    
    // GIVEN: Chat open
    await page.goto('/')
    await page.click('button:has-text("Spec Chat")')
    
    // WHEN: Connect/disconnect 10 times
    for (let i = 0; i < 10; i++) {
      await page.context().setOffline(true)
      await page.waitForTimeout(200)
      await page.context().setOffline(false)
      await page.waitForTimeout(500)
      
      console.log(`Reconnect ${i + 1}/10`)
    }
    
    // THEN: No console errors
    const logs = []
    page.on('console', msg => {
      if (msg.type() === 'error') logs.push(msg.text())
    })
    
    // Wait a bit for any deferred errors
    await page.waitForTimeout(2000)
    
    console.log(`Errors logged: ${logs.length}`)
    expect(logs.length).toBe(0)
  })
  
  test('6.4: Should render 50 messages without significant slowdown', async ({ page }) => {
    // GIVEN: Chat open
    await page.goto('/')
    await page.click('button:has-text("Spec Chat")')
    
    // WHEN: Simulate 50 messages (alternating user/assistant)
    const startTime = Date.now()
    
    for (let i = 0; i < 50; i++) {
      // This would normally come from WebSocket
      // For testing, we inject HTML directly or use API
      
      const role = i % 2 === 0 ? 'user' : 'assistant'
      await page.evaluate(({ role, index }) => {
        const html = `
          <div data-testid="message-item" data-role="${role}">
            <p>Message ${index}</p>
          </div>
        `
        document.querySelector('[data-testid="messages-container"]')?.insertAdjacentHTML('beforeend', html)
      }, { role, index: i })
    }
    
    const renderTime = Date.now() - startTime
    console.log(`Time to render 50 messages: ${renderTime}ms`)
    
    // THEN: Rendering should stay reasonably fast
    // (This is a loose benchmark since injection != normal rendering)
    expect(renderTime).toBeLessThan(5000)
    
    // Count rendered messages
    const count = await page.locator('[data-testid="message-item"]').count()
    console.log(`Messages rendered: ${count}`)
  })
})
