# OC S2: Phase 1 Test Suite Implementation (10x Task)

## OBJECTIVE
Write comprehensive test suite for Phase 1 WebSocket components. Focus: Critical user flows + API reliability. Target: 80%+ coverage.

## CURRENT STATE
- Testing framework: ✅ Ready (Vitest, Playwright, pytest)
- Components: ✅ Built (5 WebSocket components + 3 hooks)
- Unit tests: 2/2 passing (homage, agent-control)
- E2E tests: Framework ready, tests created but not comprehensive
- Backend tests: 0 tests (pytest ready)

---

## TASK 1: Unit Test Suite - AgentControl Component (90 min)

### 1a. Create Test File
**File**: `apps/web/src/components/__tests__/AgentControl.test.ts`

### 1b. Test Scenarios
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AgentControl } from '../AgentControl';
import * as api from '@/lib/api';

// Mock API
jest.mock('@/lib/api');

describe('AgentControl Component', () => {

  // TEST 1: Component Renders with Initial State
  test('renders with stopped status and start button visible', () => {
    render(<AgentControl projectName="test-project" />);
    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.getByTestId('agent-status')).toHaveTextContent('stopped');
  });

  // TEST 2: Start Agent Flow
  test('calls startAgent API when start button clicked', async () => {
    const mockStart = jest.fn().mockResolvedValue({ status: 'running' });
    (api.startAgent as jest.Mock).mockImplementation(mockStart);

    render(<AgentControl projectName="test-project" />);
    const startButton = screen.getByText('Start');

    await userEvent.click(startButton);

    await waitFor(() => {
      expect(mockStart).toHaveBeenCalledWith('test-project', expect.any(Object));
    });
  });

  // TEST 3: Stop Agent Flow
  test('calls stopAgent API when stop button clicked', async () => {
    const mockStop = jest.fn().mockResolvedValue({ status: 'stopped' });
    (api.stopAgent as jest.Mock).mockImplementation(mockStop);

    render(<AgentControl projectName="test-project" onStatusChange={jest.fn()} />);
    // First start the agent
    // Then click stop
    // Verify stop was called
  });

  // TEST 4: Concurrency Slider
  test('updates concurrency when slider changes', async () => {
    const mockUpdate = jest.fn().mockResolvedValue({ concurrency: 3 });
    render(<AgentControl projectName="test-project" />);

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '3' } });

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith('test-project', { concurrency: 3 });
    });
  });

  // TEST 5: Pause/Resume Flow
  test('toggles pause state and updates button text', async () => {
    render(<AgentControl projectName="test-project" />);

    const pauseButton = screen.getByText('Pause');
    await userEvent.click(pauseButton);

    expect(screen.getByText('Resume')).toBeInTheDocument();
  });

  // TEST 6: YOLO Mode Toggle
  test('toggles YOLO mode switch', async () => {
    const onYoloChange = jest.fn();
    render(<AgentControl projectName="test-project" onYoloChange={onYoloChange} />);

    const yoloSwitch = screen.getByRole('checkbox', { name: /yolo/i });
    await userEvent.click(yoloSwitch);

    expect(onYoloChange).toHaveBeenCalledWith(true);
  });

  // TEST 7: Error Handling
  test('handles API errors gracefully', async () => {
    const mockError = jest.fn().mockRejectedValue(new Error('API Error'));
    (api.startAgent as jest.Mock).mockImplementation(mockError);

    render(<AgentControl projectName="test-project" />);
    await userEvent.click(screen.getByText('Start'));

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  // TEST 8: Loading State
  test('shows loading spinner during API call', async () => {
    const mockStart = jest.fn(() => new Promise(resolve => setTimeout(resolve, 1000)));
    (api.startAgent as jest.Mock).mockImplementation(mockStart);

    render(<AgentControl projectName="test-project" />);
    await userEvent.click(screen.getByText('Start'));

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
```

### 1c. Run Tests
```bash
cd apps/web
pnpm test:unit -- AgentControl.test.ts --watch
```

**Success Criteria**:
- ✅ 8/8 tests passing
- ✅ Component behavior verified
- ✅ API mocking working
- ✅ User interactions tested

---

## TASK 2: Unit Test Suite - WebSocket Hooks (90 min)

### 2a. Create Test File
**File**: `apps/web/src/hooks/__tests__/useExpandChat.test.ts`

### 2b. Test Scenarios
```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { useExpandChat } from '../useExpandChat';

// Mock WebSocket
class MockWebSocket {
  url: string;
  readyState: number = WebSocket.OPEN;

  constructor(url: string) {
    this.url = url;
  }

  send = jest.fn();
  close = jest.fn();
  addEventListener = jest.fn();
  removeEventListener = jest.fn();
}

global.WebSocket = MockWebSocket as any;

describe('useExpandChat Hook', () => {

  // TEST 1: Hook Initializes
  test('initializes with empty messages and disconnected state', () => {
    const { result } = renderHook(() => useExpandChat('test-project'));

    expect(result.current.messages).toEqual([]);
    expect(result.current.isConnected).toBe(false);
  });

  // TEST 2: WebSocket Connection
  test('connects to WebSocket endpoint on mount', async () => {
    const { result } = renderHook(() => useExpandChat('test-project'));

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });
  });

  // TEST 3: Send Message
  test('sends message via WebSocket', async () => {
    const { result } = renderHook(() => useExpandChat('test-project'));

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    act(() => {
      result.current.send({
        type: 'message',
        content: 'Generate 5 features'
      });
    });

    expect(MockWebSocket.prototype.send).toHaveBeenCalled();
  });

  // TEST 4: Receive Messages
  test('handles incoming WebSocket messages', async () => {
    const { result } = renderHook(() => useExpandChat('test-project'));

    // Simulate incoming message
    const message = {
      type: 'text',
      content: 'Creating features...'
    };

    // (Depends on WebSocket mock implementation)
  });

  // TEST 5: Reconnection Logic
  test('reconnects with exponential backoff on disconnect', async () => {
    const { result } = renderHook(() => useExpandChat('test-project'));

    // Simulate disconnect
    // Verify reconnection attempts
  });

  // TEST 6: Features Created Event
  test('handles features_created message type', async () => {
    const { result } = renderHook(() => useExpandChat('test-project'));

    const featuresCreatedMsg = {
      type: 'features_created',
      count: 5
    };

    expect(result.current.featuresCreated).toBe(5);
  });

  // TEST 7: Cleanup on Unmount
  test('closes WebSocket connection on unmount', () => {
    const { unmount } = renderHook(() => useExpandChat('test-project'));

    unmount();

    expect(MockWebSocket.prototype.close).toHaveBeenCalled();
  });

  // TEST 8: Error Handling
  test('handles WebSocket errors gracefully', async () => {
    const { result } = renderHook(() => useExpandChat('test-project'));

    // Simulate error event
    // Verify error state updated
  });
});
```

### 2c. Run Tests
```bash
cd apps/web
pnpm test:unit -- useExpandChat.test.ts --watch
```

**Success Criteria**:
- ✅ 8/8 tests passing
- ✅ WebSocket mocking working
- ✅ Hook behavior verified
- ✅ Error scenarios covered

---

## TASK 3: E2E Test Suite - User Flows (120 min)

### 3a. Create Test File
**File**: `apps/web/tests/e2e/phase1-critical-flows.spec.ts`

### 3b. Test Scenarios
```typescript
import { test, expect, Page } from '@playwright/test';

test.describe('Phase 1 Critical User Flows', () => {

  let page: Page;

  test.beforeEach(async ({ page: p }) => {
    page = p;
    await page.goto('http://localhost:3000');
  });

  // TEST 1: Project Creation Flow
  test('create new project via modal', async () => {
    // Click "New Project" button
    await page.click('button:has-text("New Project")');

    // Fill form
    await page.fill('input[name="projectName"]', 'test-project-e2e');
    await page.fill('input[name="description"]', 'E2E test project');

    // Submit
    await page.click('button:has-text("Create")');

    // Verify project appears in selector
    await expect(page.locator('text=test-project-e2e')).toBeVisible();
  });

  // TEST 2: Start/Stop Agent Flow
  test('start and stop agent via AgentControl', async () => {
    // Select project
    await page.selectOption('select[name="project"]', 'existing-project');

    // Click Start
    await page.click('button:has-text("Start")');

    // Verify status changes to "running"
    await expect(page.locator('[data-testid="agent-status"]')).toContainText('running');

    // Click Stop
    await page.click('button:has-text("Stop")');

    // Verify status back to "stopped"
    await expect(page.locator('[data-testid="agent-status"]')).toContainText('stopped');
  });

  // TEST 3: Expand Project via Keyboard Shortcut
  test('open expand modal with E key', async () => {
    // Press E key
    await page.keyboard.press('e');

    // Verify modal opens
    await expect(page.locator('[data-testid="expand-modal"]')).toBeVisible();
  });

  // TEST 4: SpecCreationChat Flow
  test('open spec creation and send message', async () => {
    // Click Magic icon
    await page.click('[data-testid="spec-creation-button"]');

    // Verify chat modal opens
    await expect(page.locator('[data-testid="spec-chat-modal"]')).toBeVisible();

    // Type message
    await page.fill('[data-testid="chat-input"]', 'Create a user authentication system');

    // Send message
    await page.click('button:has-text("Send")');

    // Verify message appears
    await expect(page.locator('text=Create a user authentication system')).toBeVisible();
  });

  // TEST 5: Dependency Graph Visualization
  test('view dependency graph', async () => {
    // Click graph icon or view toggle
    await page.click('[data-testid="dependency-graph-button"]');

    // Verify SVG graph renders
    await expect(page.locator('svg')).toBeVisible();

    // Verify nodes exist
    const nodeCount = await page.locator('circle[data-testid^="node-"]').count();
    expect(nodeCount).toBeGreaterThan(0);
  });

  // TEST 6: Concurrency Control
  test('adjust concurrency slider', async () => {
    // Find concurrency slider
    const slider = await page.locator('[data-testid="concurrency-slider"]');

    // Drag to value 3
    await slider.dragTo(await page.locator('[data-testid="concurrency-3"]'));

    // Verify value changed
    await expect(page.locator('[data-testid="concurrency-value"]')).toContainText('3');
  });

  // TEST 7: YOLO Mode Toggle
  test('toggle YOLO mode', async () => {
    const yoloToggle = page.locator('[data-testid="yolo-toggle"]');

    // Initially off
    await expect(yoloToggle).not.toBeChecked();

    // Click to enable
    await yoloToggle.click();

    // Now on
    await expect(yoloToggle).toBeChecked();
  });

  // TEST 8: Keyboard Shortcuts Help
  test('view keyboard shortcuts', async () => {
    // Press ?
    await page.keyboard.press('?');

    // Verify help modal shows
    await expect(page.locator('[data-testid="shortcuts-help"]')).toBeVisible();

    // Verify all shortcuts listed
    await expect(page.locator('text=E - Expand Project')).toBeVisible();
    await expect(page.locator('text=M - Mission Control')).toBeVisible();
  });

  // TEST 9: Mission Control Dashboard
  test('view mission control with agent status', async () => {
    // Press M
    await page.keyboard.press('m');

    // Verify mission control opens
    await expect(page.locator('[data-testid="mission-control"]')).toBeVisible();

    // Verify agent list appears
    const agentCount = await page.locator('[data-testid^="agent-item-"]').count();
    expect(agentCount).toBeGreaterThanOrEqual(0);
  });

  // TEST 10: Error Handling - Invalid Project
  test('handle error when project not found', async () => {
    // Try to access non-existent project
    await page.goto('http://localhost:3000?project=non-existent');

    // Verify error message
    await expect(page.locator('text=Project not found')).toBeVisible();
  });
});
```

### 3c. Run Tests
```bash
cd apps/web
# Start dev server first (if not running)
pnpm dev &

# Run E2E tests
pnpm test:e2e -- phase1-critical-flows.spec.ts
```

**Success Criteria**:
- ✅ 10/10 tests passing
- ✅ Critical flows verified
- ✅ User interactions tested
- ✅ Error scenarios covered

---

## TASK 4: Backend API Tests - Agent Endpoints (75 min)

### 4a. Create Test File
**File**: `server/tests/test_agent_endpoints.py`

### 4b. Test Scenarios
```python
import pytest
from fastapi.testclient import TestClient
from server.main import app

client = TestClient(app)

class TestAgentEndpoints:
    """Test agent control endpoints"""

    # TEST 1: Get Agent Status
    def test_get_agent_status(self):
        """Verify GET /api/projects/{name}/agent/status returns correct format"""
        response = client.get("/api/projects/test-project/agent/status")

        assert response.status_code == 200
        assert "status" in response.json()
        assert response.json()["status"] in ["stopped", "running", "paused", "crashed"]

    # TEST 2: Start Agent
    def test_start_agent(self):
        """Verify POST /api/projects/{name}/agent/start starts agent"""
        payload = {
            "concurrency": 2,
            "yolo_mode": False
        }
        response = client.post("/api/projects/test-project/agent/start", json=payload)

        assert response.status_code == 200
        assert response.json()["status"] == "running"

    # TEST 3: Stop Agent
    def test_stop_agent(self):
        """Verify POST /api/projects/{name}/agent/stop stops agent"""
        # First start
        client.post("/api/projects/test-project/agent/start")

        # Then stop
        response = client.post("/api/projects/test-project/agent/stop")

        assert response.status_code == 200
        assert response.json()["status"] == "stopped"

    # TEST 4: Pause Agent
    def test_pause_agent(self):
        """Verify POST /api/projects/{name}/agent/pause pauses agent"""
        # Start first
        client.post("/api/projects/test-project/agent/start")

        # Then pause
        response = client.post("/api/projects/test-project/agent/pause")

        assert response.status_code == 200
        assert response.json()["status"] == "paused"

    # TEST 5: Resume Agent
    def test_resume_agent(self):
        """Verify POST /api/projects/{name}/agent/resume resumes agent"""
        # Pause first
        client.post("/api/projects/test-project/agent/start")
        client.post("/api/projects/test-project/agent/pause")

        # Then resume
        response = client.post("/api/projects/test-project/agent/resume")

        assert response.status_code == 200
        assert response.json()["status"] == "running"

    # TEST 6: Invalid Project
    def test_invalid_project_returns_404(self):
        """Verify endpoint returns 404 for non-existent project"""
        response = client.get("/api/projects/non-existent/agent/status")

        assert response.status_code == 404

    # TEST 7: Concurrency Validation
    def test_concurrency_validation(self):
        """Verify concurrency values are validated (1-5)"""
        # Invalid: 0
        response = client.post(
            "/api/projects/test-project/agent/start",
            json={"concurrency": 0}
        )
        assert response.status_code == 422

        # Invalid: 6
        response = client.post(
            "/api/projects/test-project/agent/start",
            json={"concurrency": 6}
        )
        assert response.status_code == 422

        # Valid: 3
        response = client.post(
            "/api/projects/test-project/agent/start",
            json={"concurrency": 3}
        )
        assert response.status_code == 200

    # TEST 8: Concurrent Start Prevention
    def test_cannot_start_already_running_agent(self):
        """Verify cannot start agent that's already running"""
        # Start
        client.post("/api/projects/test-project/agent/start")

        # Try to start again
        response = client.post("/api/projects/test-project/agent/start")

        assert response.status_code == 409  # Conflict
```

### 4c. Run Tests
```bash
cd /home/kellyb_dev/projects/hex-ade/server
source .venv/bin/activate
python -m pytest tests/test_agent_endpoints.py -v
```

**Success Criteria**:
- ✅ 8/8 tests passing
- ✅ All endpoints covered
- ✅ Error cases tested
- ✅ Validation verified

---

## TASK 5: Backend WebSocket Tests (75 min)

### 5a. Create Test File
**File**: `server/tests/test_websocket_spec.py`

### 5b. Test Scenarios
```python
import pytest
import asyncio
import json
from fastapi.testclient import TestClient
from server.main import app

@pytest.mark.asyncio
class TestWebSocketSpec:
    """Test WebSocket spec creation endpoints"""

    # TEST 1: WebSocket Connection
    @pytest.mark.asyncio
    async def test_websocket_connection_spec(self):
        """Verify WebSocket endpoint accepts connections"""
        with TestClient(app) as client:
            with client.websocket_connect("/ws/spec/test-project") as websocket:
                # Send start message
                websocket.send_json({"type": "start"})

                # Receive confirmation
                data = websocket.receive_json()
                assert data["type"] == "start"

    # TEST 2: Spec Creation Message Flow
    @pytest.mark.asyncio
    async def test_spec_creation_message_flow(self):
        """Verify message flow: start → message → answer"""
        with TestClient(app) as client:
            with client.websocket_connect("/ws/spec/test-project") as websocket:
                # Start session
                websocket.send_json({"type": "start"})
                websocket.receive_json()

                # Send message
                websocket.send_json({
                    "type": "message",
                    "content": "Create auth system"
                })

                # Should receive answer
                data = websocket.receive_json()
                assert data["type"] == "answer"

    # TEST 3: File Writing
    @pytest.mark.asyncio
    async def test_file_written_event(self):
        """Verify file_written events are sent"""
        with TestClient(app) as client:
            with client.websocket_connect("/ws/spec/test-project") as websocket:
                # ... complete flow ...

                # Eventually receive file_written
                data = websocket.receive_json(timeout=5)
                assert data["type"] == "file_written"
                assert "path" in data

    # TEST 4: Completion Event
    @pytest.mark.asyncio
    async def test_completion_event(self):
        """Verify complete event signals end of session"""
        with TestClient(app) as client:
            with client.websocket_connect("/ws/spec/test-project") as websocket:
                # ... complete flow ...

                # Should receive complete
                data = websocket.receive_json(timeout=10)
                assert data["type"] == "complete"

    # TEST 5: Error Handling
    @pytest.mark.asyncio
    async def test_websocket_error_handling(self):
        """Verify WebSocket handles errors gracefully"""
        with TestClient(app) as client:
            with client.websocket_connect("/ws/spec/test-project") as websocket:
                # Send invalid message
                websocket.send_json({"type": "invalid"})

                # Should receive error
                data = websocket.receive_json()
                assert data["type"] == "error"

    # TEST 6: Connection Timeout
    @pytest.mark.asyncio
    async def test_websocket_timeout(self):
        """Verify WebSocket disconnects after timeout"""
        with TestClient(app) as client:
            with client.websocket_connect("/ws/spec/test-project") as websocket:
                # No activity for 30 minutes
                # Should disconnect (or keep-alive with ping)
                pass

    # TEST 7: Multiple Concurrent Connections
    @pytest.mark.asyncio
    async def test_concurrent_websocket_connections(self):
        """Verify multiple clients can connect simultaneously"""
        with TestClient(app) as client:
            with client.websocket_connect("/ws/spec/project-1") as ws1:
                with client.websocket_connect("/ws/spec/project-2") as ws2:
                    # Both should work independently
                    ws1.send_json({"type": "start"})
                    ws2.send_json({"type": "start"})

                    data1 = ws1.receive_json()
                    data2 = ws2.receive_json()

                    assert data1["type"] == "start"
                    assert data2["type"] == "start"

    # TEST 8: Reconnection Handling
    @pytest.mark.asyncio
    async def test_reconnection_after_disconnect(self):
        """Verify client can reconnect after disconnect"""
        with TestClient(app) as client:
            # First connection
            with client.websocket_connect("/ws/spec/test-project") as ws1:
                ws1.send_json({"type": "start"})
                ws1.receive_json()

            # Reconnect
            with client.websocket_connect("/ws/spec/test-project") as ws2:
                ws2.send_json({"type": "start"})
                data = ws2.receive_json()
                assert data["type"] == "start"
```

### 5c. Run Tests
```bash
cd /home/kellyb_dev/projects/hex-ade/server
source .venv/bin/activate
python -m pytest tests/test_websocket_spec.py -v -s
```

**Success Criteria**:
- ✅ 8/8 tests passing
- ✅ WebSocket communication verified
- ✅ Error scenarios covered
- ✅ Concurrency tested

---

## TASK 6: Integration Test - End-to-End API Flow (60 min)

### 6a. Create Test File
**File**: `server/tests/test_integration_flow.py`

### 6b. Test Scenario
```python
import pytest
from fastapi.testclient import TestClient
from server.main import app

client = TestClient(app)

def test_complete_user_workflow():
    """Full integration: Create project → Start agent → Get status → Stop agent"""

    # Step 1: Create project
    project_response = client.post("/api/projects", json={
        "name": "integration-test-project",
        "description": "Integration test"
    })
    assert project_response.status_code == 200
    project_id = project_response.json()["id"]

    # Step 2: Add features
    features_response = client.post(f"/api/projects/{project_id}/features", json={
        "name": "Feature 1",
        "description": "Test feature"
    })
    assert features_response.status_code == 200

    # Step 3: Start agent
    start_response = client.post(f"/api/projects/{project_id}/agent/start", json={
        "concurrency": 2,
        "yolo_mode": False
    })
    assert start_response.status_code == 200
    assert start_response.json()["status"] == "running"

    # Step 4: Get status
    status_response = client.get(f"/api/projects/{project_id}/agent/status")
    assert status_response.status_code == 200
    assert status_response.json()["status"] == "running"

    # Step 5: Stop agent
    stop_response = client.post(f"/api/projects/{project_id}/agent/stop")
    assert stop_response.status_code == 200
    assert stop_response.json()["status"] == "stopped"

    # Step 6: Verify final status
    final_status = client.get(f"/api/projects/{project_id}/agent/status")
    assert final_status.json()["status"] == "stopped"
```

### 6c. Run Tests
```bash
cd /home/kellyb_dev/projects/hex-ade/server
source .venv/bin/activate
python -m pytest tests/test_integration_flow.py -v
```

**Success Criteria**:
- ✅ Complete workflow tested
- ✅ All steps verified
- ✅ State transitions correct

---

## TASK 7: Coverage Report (30 min)

### 7a. Generate Coverage
```bash
# Frontend
cd /home/kellyb_dev/projects/hex-ade/apps/web
pnpm test:coverage

# Backend
cd /home/kellyb_dev/projects/hex-ade/server
source .venv/bin/activate
python -m pytest --cov=server tests/

```

### 7b. Create Report
**File**: `.flagpost/PHASE1_TEST_COVERAGE_REPORT.md`

**Contents**:
```markdown
# Phase 1 Test Coverage Report

## Frontend Coverage
- Components: [X]% (AgentControl, WebSocket components)
- Hooks: [Y]% (useExpandChat, useWebSocket)
- Utils: [Z]% (API client)
- Overall: [W]%

## Backend Coverage
- Agent Endpoints: [A]%
- WebSocket Spec: [B]%
- Integration: [C]%
- Overall: [D]%

## Coverage Goals vs. Achieved
| Area | Goal | Actual | Status |
|------|------|--------|--------|
| Unit Tests | 80% | [X]% | ✅/❌ |
| Integration | 70% | [Y]% | ✅/❌ |
| E2E Tests | All critical flows | [Z] flows | ✅/❌ |

## Recommendations for Phase 2
1. [Priority 1]
2. [Priority 2]
3. [Priority 3]
```

**Success Criteria**:
- ✅ Coverage report generated
- ✅ Metrics documented
- ✅ Gaps identified

---

## TASK 8: Update Test Documentation (20 min)

### 8a. Create Test README
**File**: `apps/web/README.TESTING.md`

**Contents**:
```markdown
# Phase 1 Test Suite Documentation

## Running Tests

### Unit Tests
```bash
pnpm test:unit                    # Run all unit tests
pnpm test:unit -- Component.test  # Run specific test
pnpm test:unit --watch            # Watch mode
```

### E2E Tests
```bash
pnpm test:e2e                     # Run all E2E tests
pnpm test:e2e -- flows.spec.ts    # Run specific suite
```

### Backend Tests
```bash
cd server && source .venv/bin/activate
python -m pytest                  # Run all tests
python -m pytest tests/test_agent_endpoints.py  # Specific test file
python -m pytest -v               # Verbose output
```

## Test Structure
- Unit: Component logic, hooks, utilities
- E2E: User workflows, interactions
- Integration: API flows, WebSocket streams

## Coverage Targets
- Frontend: 80%+ unit, 100% critical E2E
- Backend: 70%+ API endpoints, 90% WebSocket

## Known Issues
[List any test flakiness or limitations]
```

### 8b. Update Main README
```bash
# Add section to main README.md about testing
# Include quick start commands
# Link to TESTING.md
```

**Success Criteria**:
- ✅ Test documentation complete
- ✅ Quick start guide provided
- ✅ Coverage goals documented

---

## TASK 9: Create Test Summary Report (20 min)

### 9a. Prepare Summary
**File**: `.flagpost/PHASE1_TEST_EXECUTION_SUMMARY.md`

**Contents**:
```markdown
# Phase 1 Test Execution Summary

## Overview
Comprehensive test suite for WebSocket infrastructure:
- 8 Unit tests (AgentControl)
- 8 Hook tests (useExpandChat)
- 10 E2E tests (Critical flows)
- 8 Backend API tests
- 8 WebSocket tests
- 1 Integration test
**Total: 43 tests**

## Results
- Passing: [X]/43 ✅
- Failing: [Y]/43 ❌
- Skipped: [Z]/43 ⏭️
- Coverage: [W]%

## Test Categories

### Unit Tests ✅
- AgentControl component lifecycle
- WebSocket hook behavior
- API mocking verification

### E2E Tests ✅
- Project creation flow
- Agent start/stop
- Keyboard shortcuts
- Modal interactions
- Graph visualization

### API Tests ✅
- Agent endpoints
- Status management
- Error handling
- Validation

### WebSocket Tests ✅
- Connection management
- Message flow
- Error scenarios
- Reconnection logic

## Quality Metrics
| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Unit Coverage | 80% | [X]% | ✅/❌ |
| E2E Coverage | 100% critical | [Y]% | ✅/❌ |
| API Coverage | 70% | [Z]% | ✅/❌ |
| Overall Pass Rate | 100% | [W]% | ✅/❌ |

## Issues Found & Fixed
1. [Issue 1]
2. [Issue 2]
3. [Issue 3]

## Next Steps (Phase 2)
- [ ] Additional UI component tests
- [ ] Performance testing
- [ ] Load testing for WebSocket
- [ ] Security testing

---

**Phase 1 Testing: COMPLETE ✅**
```

### 9b. Save Summary
```bash
cat > /home/kellyb_dev/projects/hex-ade/.flagpost/PHASE1_TEST_EXECUTION_SUMMARY.md << 'EOF'
[CONTENT FROM 9a ABOVE]
EOF
```

**Success Criteria**:
- ✅ Summary report created
- ✅ All metrics documented
- ✅ Results tabulated

---

## TASK 10: Final Commit & Handoff (15 min)

### 10a. Stage All Test Files
```bash
cd /home/kellyb_dev/projects/hex-ade

git add apps/web/src/components/__tests__/AgentControl.test.ts
git add apps/web/src/hooks/__tests__/useExpandChat.test.ts
git add apps/web/tests/e2e/phase1-critical-flows.spec.ts
git add server/tests/test_agent_endpoints.py
git add server/tests/test_websocket_spec.py
git add server/tests/test_integration_flow.py
git add .flagpost/PHASE1_TEST_COVERAGE_REPORT.md
git add .flagpost/PHASE1_TEST_EXECUTION_SUMMARY.md
git add apps/web/README.TESTING.md

git status
```

### 10b. Commit Tests
```bash
git commit -m "test(phase1): Add comprehensive test suite for WebSocket infrastructure

## Summary
Complete test coverage for Phase 1 WebSocket components:

## Tests Added
- Unit Tests: AgentControl (8), useExpandChat (8)
- E2E Tests: Critical flows (10)
- Backend API Tests: Agent endpoints (8)
- WebSocket Tests: Connection & message flow (8)
- Integration Tests: Complete workflow (1)

Total: 43 tests

## Coverage
- Frontend: 80%+ unit coverage
- Backend: 70%+ API endpoint coverage
- E2E: 100% critical user flows
- Overall: [X]%

## Test Categories
1. Component behavior (AgentControl lifecycle)
2. WebSocket hooks (connection, messaging, reconnection)
3. User workflows (creation, expansion, visualization)
4. API endpoints (start/stop/status)
5. WebSocket protocols (message flow, errors)
6. Integration flows (end-to-end workflows)

## Running Tests
- Frontend: pnpm test:unit && pnpm test:e2e
- Backend: python -m pytest

## Results
- All tests: ✅ [X]/43 passing
- Coverage: ✅ [Y]% overall
- Ready for: Phase 1 merge

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

### 10c. Verify Commit
```bash
git log --oneline -1
# Should show test commit
```

### 10d. Report to User
```bash
echo "✅ Phase 1 Test Suite Complete
- 43 tests written
- [X] tests passing
- [Y]% coverage achieved
- Ready for Phase 1 merge"
```

**Success Criteria**:
- ✅ All tests created
- ✅ Tests passing (or documented failures)
- ✅ Commit created
- ✅ Ready for merge

---

## SUCCESS CRITERIA (ALL REQUIRED)

- ✅ 43 tests written (unit + E2E + API + WebSocket + integration)
- ✅ 100% of critical flows tested
- ✅ 80%+ coverage achieved (or documented plan)
- ✅ All tests passing (or failures documented)
- ✅ Test documentation complete
- ✅ Coverage report generated
- ✅ Commit created with test summary
- ✅ Ready for Phase 1 merge

---

## DELIVERABLES

1. **Test Files**:
   - AgentControl.test.ts
   - useExpandChat.test.ts
   - phase1-critical-flows.spec.ts
   - test_agent_endpoints.py
   - test_websocket_spec.py
   - test_integration_flow.py

2. **Documentation**:
   - PHASE1_TEST_COVERAGE_REPORT.md
   - PHASE1_TEST_EXECUTION_SUMMARY.md
   - README.TESTING.md

3. **Commit**:
   - test(phase1): Comprehensive test suite for WebSocket infrastructure

4. **Status**:
   - Ready for Phase 1 merge
   - Test infrastructure verified
   - Coverage goals met (or documented)

---

## TIMELINE
- Task 1 (AgentControl tests): 90 min
- Task 2 (Hook tests): 90 min
- Task 3 (E2E tests): 120 min
- Task 4 (API tests): 75 min
- Task 5 (WebSocket tests): 75 min
- Task 6 (Integration tests): 60 min
- Task 7 (Coverage report): 30 min
- Task 8 (Documentation): 20 min
- Task 9 (Summary): 20 min
- Task 10 (Commit): 15 min
**Total: ~595 min (~10 hours)**

---

**Status**: ✅ READY FOR EXECUTION
