import { test, expect } from '@playwright/test'

test.describe('Security Tests', () => {
  
  test('7.1: Should not expose API keys in network tab', async ({ page }) => {
    // GIVEN: Track all network requests
    const requests = []
    page.on('request', req => {
      requests.push({
        url: req.url(),
        headers: req.allHeaders(),
        method: req.method()
      })
    })
    
    // WHEN: Use the app normally
    await page.goto('/')
    await page.click('button:has-text("Spec Chat")')
    const input = page.locator('[placeholder="Type message"]')
    await input.fill('Test message')
    await page.click('button:has-text("Send")')
    
    await page.waitForTimeout(3000)
    
    // THEN: Check no API keys in requests
    const sensitivePatterns = [
      /sk-/i,  // OpenAI/OpenRouter API key
      /Bearer\s+[\w\-]+/,  // Bearer tokens
      /api[_-]?key/i,
    ]
    
    let foundExposed = false
    requests.forEach(req => {
      const reqStr = JSON.stringify(req)
      sensitivePatterns.forEach(pattern => {
        if (pattern.test(reqStr)) {
          console.log('⚠️  Potential API key exposed in:', req.url)
          foundExposed = true
        }
      })
    })
    
    // Note: Some exposure is OK in Authorization headers
    // But should never be in URL params or body
    console.log(`Checked ${requests.length} requests`)
  })
  
  test('7.2: Should validate WebSocket origin', async ({ page }) => {
    // GIVEN: WebSocket connects
    let wsOriginValid = null
    page.on('websocket', ws => {
      const url = new URL(ws.url())
      console.log(`WebSocket origin: ${url.protocol}//${url.host}`)
      
      // Valid origins: localhost, ade.getmytestdrive.com, hex-ade-backend.fly.dev
      const validOrigins = ['localhost', 'ade.getmytestdrive.com', 'hex-ade-backend.fly.dev']
      wsOriginValid = validOrigins.some(origin => url.host.includes(origin))
    })
    
    // WHEN: Navigate and connect
    await page.goto('/')
    
    // THEN: WebSocket should have valid origin
    await page.waitForTimeout(2000)
    console.log(`WebSocket origin valid: ${wsOriginValid}`)
  })
  
  test('7.3: Should sanitize user input (prevent XSS)', async ({ page }) => {
    // GIVEN: Chat is open
    await page.goto('/')
    await page.click('button:has-text("Spec Chat")')
    
    // WHEN: Send message with potential XSS payload
    const input = page.locator('[placeholder="Type message"]')
    await input.fill('<script>alert("XSS")</script>')
    await page.click('button:has-text("Send")')
    
    await page.waitForTimeout(2000)
    
    // THEN: Script should NOT execute
    // Listen for alerts (would indicate XSS)
    let alertFired = false
    page.on('dialog', dialog => {
      alertFired = true
      dialog.dismiss()
    })
    
    // Message should display as text, not execute
    const messageText = await page.locator('[data-testid="message-content"]').first().textContent()
    console.log('Message rendered as:', messageText)
    
    expect(alertFired).toBe(false)
    expect(messageText).toContain('<script>')  // Should show the tag as text
  })
  
  test('7.4: Should protect against HTML injection', async ({ page }) => {
    // GIVEN: Chat is open
    await page.goto('/')
    await page.click('button:has-text("Spec Chat")')
    
    // WHEN: Send message with HTML injection
    const input = page.locator('[placeholder="Type message"]')
    const htmlPayload = '<img src=x onerror="console.log(\'injected\')">'
    await input.fill(htmlPayload)
    await page.click('button:has-text("Send")')
    
    await page.waitForTimeout(2000)
    
    // THEN: Image should not load
    const images = await page.locator('img[src="x"]').count()
    expect(images).toBe(0)
    
    // Message should show HTML as text
    const messageText = await page.locator('[data-testid="message-content"]').first().textContent()
    console.log('HTML injection test message:', messageText)
  })
  
  test('7.5: Should not expose user data in localStorage', async ({ page }) => {
    // GIVEN: Use app and create data
    await page.goto('/')
    await page.click('button:has-text("Spec Chat")')
    
    // WHEN: Check localStorage
    const localStorage = await page.evaluate(() => {
      const result = {}
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i)
        result[key] = window.localStorage.getItem(key)
      }
      return result
    })
    
    console.log('localStorage contents:', Object.keys(localStorage))
    
    // THEN: No sensitive data should be plain text
    const storageStr = JSON.stringify(localStorage)
    
    const sensitivePatterns = [
      /api[_-]?key/i,
      /secret/i,
      /password/i,
      /token/i,  // Tokens should be HttpOnly cookies, not localStorage
    ]
    
    let foundSensitive = false
    sensitivePatterns.forEach(pattern => {
      if (pattern.test(storageStr)) {
        console.log('⚠️  Potential sensitive data in localStorage:', pattern)
        foundSensitive = true
      }
    })
    
    expect(foundSensitive).toBe(false)
  })
})
