# Comprehensive E2E Testing Roadmap
**Date**: 2026-02-06 19:00 UTC  
**Status**: Phase 3 - Validation (Active)  
**Owner**: OC-S1 (Primary), GC-S1 (Support)

---

## **CURRENT STATE**

### Existing Tests (1,024 lines)
```
advanced-features.spec.ts      (151 lines) - Feature workflows
agent-control.spec.ts          (31 lines)  - Agent start/stop
agent-lifecycle.spec.ts        (152 lines) - Full agent flow
chat-integration.spec.ts       (180 lines) - Chat UI + messaging
homepage.spec.ts               (17 lines)  - Basic homepage
keyboard-shortcuts.spec.ts     (43 lines)  - Keyboard navigation
phase2-s2-components.spec.ts   (173 lines) - Mission Control components
project-management.spec.ts     (122 lines) - Project CRUD
smoke.spec.ts                  (155 lines) - Just completed ✅
```

### What's Working
- ✅ Smoke tests (4/4 passing)
- ✅ Project creation wizard
- ✅ Homepage rendering
- ✅ Dashboard structure

### What Needs Validation
- ❓ WebSocket connections (SpecCreationChat)
- ❓ Real-time message streaming
- ❓ Error handling and recovery
- ❓ Cross-component communication
- ❓ End-to-end user workflows

---

## **TESTING ROADMAP (Priority Order)**

### **Phase 3A: WebSocket Foundation Tests** (OC-S1, 6 hours)

#### Test 1: WebSocket Connection Lifecycle
**File**: `apps/web/tests/e2e/websocket-connection.spec.ts`
**Goal**: Verify WebSocket connects/disconnects correctly

```typescript
test.describe('WebSocket Connection Tests', () => {
  test('should establish WebSocket connection when SpecCreationChat opens', async ({ page }) => {
    // Navigate to project with SpecCreationChat
    // Trigger modal open
    // Listen for WebSocket connection: page.on('websocket', handler)
    // Verify connection to correct endpoint
    // Verify headers/auth token if applicable
  })
  
  test('should handle WebSocket connection errors gracefully', async ({ page }) => {
    // Simulate backend unavailable (port not listening)
    // Verify UI shows error message
    // Verify UI offers retry/fallback
  })
  
  test('should reconnect automatically on disconnect', async ({ page }) => {
    // Connect successfully
    // Simulate network interruption
    // Verify reconnection attempt
    // Verify message queue on reconnect
  })
})
```

**Success Criteria**:
- ✅ WebSocket connects to `/ws/spec/{projectName}`
- ✅ Error messages display correctly
- ✅ Reconnection logic works
- ✅ No console errors

---

#### Test 2: Message Flow (Streaming)
**File**: `apps/web/tests/e2e/websocket-messaging.spec.ts`
**Goal**: Verify messages send/receive through WebSocket

```typescript
test.describe('WebSocket Message Flow Tests', () => {
  test('should send start message with YOLO mode', async ({ page }) => {
    // Open SpecCreationChat
    // Listen to WebSocket messages sent
    // Verify start message format: { type: 'start', yolo_mode: true/false }
    // Verify timestamp and metadata
  })
  
  test('should stream spec responses as text chunks', async ({ page }) => {
    // Send user message: "Create a login form"
    // Receive streaming responses: { type: 'text', content: '...' }
    // Verify messages appear in UI incrementally
    // Verify UI doesn't freeze during streaming
  })
  
  test('should handle spec_complete signal', async ({ page }) => {
    // After streaming completes
    // Receive { type: 'spec_complete', data: {...} }
    // Verify spec is saved to project
    // Verify UI updates project list
  })
  
  test('should handle error messages', async ({ page }) => {
    // Send invalid request
    // Receive { type: 'error', message: 'Invalid project' }
    // Verify error displays in UI
    // Verify connection doesn't close
  })
})
```

**Success Criteria**:
- ✅ All message types sent correctly
- ✅ Streaming renders in real-time
- ✅ Error handling doesn't break connection
- ✅ spec_complete properly saved

---

#### Test 3: Chat UI Integration
**File**: `apps/web/tests/e2e/chat-ui-integration.spec.ts`
**Goal**: Verify chat renders correctly with WebSocket data

```typescript
test.describe('Chat UI Integration Tests', () => {
  test('should display user and assistant messages alternately', async ({ page }) => {
    // Send message
    // Verify message appears as "user" with correct styling
    // Verify assistant response appears with correct styling
    // Verify scroll position follows new messages
  })
  
  test('should show loading state during message processing', async ({ page }) => {
    // Send message
    // Verify spinner/skeleton appears
    // Verify spinner disappears when response arrives
  })
  
  test('should handle image attachments in messages', async ({ page }) => {
    // Upload image via file input
    // Verify image preview displays
    // Verify image sent with message
    // Verify image received in response
  })
  
  test('should persist message history across reconnect', async ({ page }) => {
    // Send 3 messages
    // Simulate disconnect
    // Verify messages still visible
    // Reconnect and verify history preserved
  })
})
```

**Success Criteria**:
- ✅ Messages render with correct styling
- ✅ Loading states work
- ✅ Images attach and display
- ✅ History persists

---

### **Phase 3B: Component Integration Tests** (OC-S1, 4 hours)

#### Test 4: Cross-Component Communication
**File**: `apps/web/tests/e2e/component-integration.spec.ts`
**Goal**: Verify components work together

```typescript
test.describe('Component Integration Tests', () => {
  test('should update project list after spec creation', async ({ page }) => {
    // Create new project
    // Initiate spec chat
    // Complete spec creation
    // Verify project list updates
    // Verify project shows spec indicator
  })
  
  test('should load existing spec into SpecCreationChat', async ({ page }) => {
    // Open project with existing spec
    // Open SpecCreationChat
    // Verify spec loads in chat
    // Verify can continue editing
  })
  
  test('AgentMissionControl updates when agent runs', async ({ page }) => {
    // Start agent from AgentControl
    // Verify AgentMissionControl receives updates
    // Verify progress bar updates
    // Verify status changes (thinking → working → testing)
  })
})
```

**Success Criteria**:
- ✅ Projects update after spec creation
- ✅ Specs load correctly
- ✅ Agent status syncs across components

---

#### Test 5: Error Scenarios & Recovery
**File**: `apps/web/tests/e2e/error-handling.spec.ts`
**Goal**: Verify graceful error handling

```typescript
test.describe('Error Handling Tests', () => {
  test('should handle backend API timeout', async ({ page }) => {
    // Simulate slow backend (delay response 30s)
    // Verify UI shows "Connection timeout"
    // Verify user can retry
  })
  
  test('should handle invalid project name in WebSocket', async ({ page }) => {
    // Try to connect to non-existent project
    // Verify error message displays
    // Verify can navigate away safely
  })
  
  test('should handle malformed WebSocket messages', async ({ page }) => {
    // Mock server sends invalid JSON
    // Verify UI doesn't crash
    // Verify error logged
    // Verify recovery possible
  })
  
  test('should handle network offline', async ({ page }) => {
    // Go offline (browser dev tools)
    // Verify offline indicator shows
    // Verify retry mechanism
    // Go online and verify recovery
  })
})
```

**Success Criteria**:
- ✅ All error scenarios handled
- ✅ UI doesn't crash
- ✅ User can recover
- ✅ Error messages helpful

---

### **Phase 3C: Performance & Security Tests** (GC-S1, 3 hours)

#### Test 6: Performance Benchmarks
**File**: `apps/web/tests/e2e/performance.spec.ts`
**Goal**: Verify performance meets expectations

```typescript
test.describe('Performance Tests', () => {
  test('should load SpecCreationChat in <2 seconds', async ({ page }) => {
    // Measure page load time
    // Measure component mount time
    // Verify <2s total
  })
  
  test('should handle rapid message sending without lag', async ({ page }) => {
    // Send 10 messages rapidly
    // Measure response time
    // Verify UI remains responsive
    // Verify no message loss
  })
  
  test('should not create memory leaks on reconnect', async ({ page }) => {
    // Connect/disconnect 10 times
    // Measure memory usage
    // Verify memory released
  })
})
```

**Success Criteria**:
- ✅ Load time <2s
- ✅ Handles rapid messages
- ✅ No memory leaks

---

#### Test 7: Security & Authentication
**File**: `apps/web/tests/e2e/security.spec.ts`
**Goal**: Verify security measures work

```typescript
test.describe('Security Tests', () => {
  test('should not expose API keys in network tab', async ({ page }) => {
    // Send message
    // Inspect network requests
    // Verify no API keys in plain text
  })
  
  test('should validate WebSocket origin', async ({ page }) => {
    // WebSocket should only accept localhost/ade.getmytestdrive.com
    // Verify CORS headers present
  })
  
  test('should sanitize user input in messages', async ({ page }) => {
    // Send message with HTML/script tags
    // Verify tags displayed as text, not executed
    // Verify no XSS vulnerability
  })
})
```

**Success Criteria**:
- ✅ No API key leaks
- ✅ CORS validated
- ✅ XSS protected

---

## **EXECUTION PLAN**

### **Week 1: Core WebSocket Tests (OC-S1)**
```
Day 1: Phase 3A.1 - Connection lifecycle
Day 2: Phase 3A.2 - Message flow/streaming
Day 3: Phase 3A.3 - Chat UI integration
Day 4: Phase 3B.1 - Component integration
Day 5: Phase 3B.2 - Error handling
```

**Deliverable**: 5 test files, 200+ test cases, all passing

### **Week 2: Performance & Security (GC-S1)**
```
Day 1: Phase 3C.1 - Performance benchmarks
Day 2: Phase 3C.2 - Security tests
Day 3: Coverage analysis and optimization
Day 4: Documentation and reporting
```

**Deliverable**: 2 test files, security audit, performance report

---

## **TEST INFRASTRUCTURE**

### Setup (Already Done)
- ✅ Playwright installed (v1.58.1)
- ✅ Config at `playwright.config.ts`
- ✅ Base URL: `http://localhost:3000`
- ✅ Screenshots enabled
- ✅ HTML reporter enabled

### WebSocket Mocking Strategy
**Option A** (Recommended): Real Backend Testing
- Tests use actual backend WebSocket at `localhost:8888`
- More realistic but requires backend running
- Better for validating integration

**Option B**: Mock WebSocket Server
- Create mock server in test setup
- Use `page.addInitScript()` to intercept WebSocket
- Faster, more isolated, but less realistic
- Good for unit-level WebSocket testing

**Recommendation**: Use **Option A** for smoke/integration tests. If tests become flaky, move to Option B with mock server.

---

## **SUCCESS METRICS**

| Metric | Target | Current |
|--------|--------|---------|
| Test Coverage | >80% of components | ~40% (smoke tests) |
| Test Pass Rate | 100% | 100% (4/4 smoke) |
| E2E Test Count | >50 | 1,024 existing + new |
| WebSocket Tests | >15 | 0 (starting) |
| Performance Tests | >5 | 0 (starting) |
| Security Tests | >5 | 0 (starting) |

---

## **KNOWN CHALLENGES & SOLUTIONS**

| Challenge | Solution |
|-----------|----------|
| WebSocket timing (async) | Use `page.waitForEvent('websocket')` |
| Playwright can't mock WebSocket natively | Use real backend or mock at browser level |
| Tests might be flaky (network dependent) | Add retry logic, use timeouts carefully |
| Port conflicts (backend, frontend, tests) | Use different ports: 3000 (frontend), 8888 (backend), auto-assign (tests) |

---

## **DELIVERABLE TIMELINE**

```
NOW      Phase 3A.1: WebSocket connection tests
+1d      Phase 3A.2: Message flow tests
+2d      Phase 3A.3: Chat UI tests
+3d      Phase 3B.1: Component integration tests
+4d      Phase 3B.2: Error handling tests
+5d      Phase 3C.1: Performance tests (GC-S1)
+6d      Phase 3C.2: Security tests (GC-S1)
+7d      ✅ Full E2E test suite complete (70+ tests)
+8d      ✅ Production deployment ready
```

---

## **NEXT ACTION**

**For OC-S1**:
1. Read this roadmap
2. Start with Phase 3A.1: `apps/web/tests/e2e/websocket-connection.spec.ts`
3. Use `page.on('websocket', handler)` to listen for connections
4. Verify connection to correct endpoint
5. Report results

**For GC-S1**:
- Stand by for Phase 3C (Performance & Security)
- Can start now if GC wants to parallelize

---

**Questions? Ready to start?**
