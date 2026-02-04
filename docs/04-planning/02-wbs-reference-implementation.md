# hex-ade WBS: Reference Implementation
**Version**: 1.0
**Date**: 2026-02-04
**Target**: Map Leon's AutoCoder to hex-ade
**Duration**: 4 weeks (30-35 hours development)

---

## EXECUTIVE SUMMARY

**Goal**: Implement Leon's AutoCoder UI/UX patterns in hex-ade while maintaining GOTCHA + ATLAS-VM workflow

**Approach**:
- Phase 1: Core Dashboard & Agent Control (Week 1)
- Phase 2: Project Creation & Spec Chat (Week 2-3)
- Phase 3: Graph Visualization (Week 3-4)
- Phase 4: Enhancement & Polish (Week 4+)

**Team Split**: GC (Backend/API) | OC (Frontend/UI)

---

## PHASE 1: CORE DASHBOARD (Week 1, 8-10 hours)

### 1.1 Agent Control Panel
**Owner**: OC
**Estimate**: 2 hours
**Dependencies**: Backend agent status API (exists)

**Tasks**:
- [ ] Create `AgentControl.tsx` component
  - Start/stop button with loading states
  - Concurrency slider (1-5 agents)
  - Debounced save (500ms)
  - Status badge (stopped/running/paused/crashed)
- [ ] Update `apps/web/src/lib/types.ts`:
  ```typescript
  interface AgentStatus {
    status: 'stopped' | 'running' | 'paused' | 'crashed'
    concurrency?: number
    yolo_mode?: boolean
  }
  ```
- [ ] Integrate with `/api/projects/{name}/agent/start` and `/stop`
- [ ] Test: Start agent with concurrency 3, stop, verify slider saves

**Files**:
- `apps/web/src/components/AgentControl.tsx` (NEW)
- `apps/web/src/lib/types.ts` (UPDATE)

---

### 1.2 Mission Control Dashboard
**Owner**: OC
**Estimate**: 3 hours
**Dependencies**: Backend WebSocket agent_update events (needs GC task 1.3)

**Tasks**:
- [ ] Create `AgentMissionControl.tsx` container
  - Grid layout for agent cards
  - Orchestrator status card (top)
  - Activity feed (collapsible)
- [ ] Create `AgentCard.tsx`
  - Agent index, name, type (coding/testing)
  - Feature name + ID
  - Current state (idle/thinking/working/testing/success/error)
  - Thought bubble (last log line)
  - Click to open log modal
- [ ] Create `OrchestratorStatusCard.tsx`
  - State: idle/initializing/scheduling/spawning/monitoring/complete
  - Coding agents count / max
  - Testing agents count / max
  - Ready/blocked feature counts
- [ ] Update `apps/web/src/lib/types.ts`:
  ```typescript
  interface ActiveAgent {
    agentIndex: number
    agentName: string
    agentType: 'coding' | 'testing'
    featureId: number | null
    featureIds: number[]
    featureName: string | null
    state: 'idle' | 'thinking' | 'working' | 'testing' | 'success' | 'error' | 'struggling'
    thought: string | null
    timestamp: string
  }

  interface OrchestratorStatus {
    state: 'idle' | 'initializing' | 'scheduling' | 'spawning' | 'monitoring' | 'complete'
    message: string
    codingAgents: number
    testingAgents: number
    maxConcurrency: number
    readyCount: number
    blockedCount: number
  }
  ```
- [ ] Test: Run agent in parallel mode (concurrency 3), verify agent cards update

**Files**:
- `apps/web/src/components/AgentMissionControl.tsx` (NEW)
- `apps/web/src/components/AgentCard.tsx` (NEW)
- `apps/web/src/components/OrchestratorStatusCard.tsx` (NEW)
- `apps/web/src/lib/types.ts` (UPDATE)

---

### 1.3 WebSocket Agent Updates (Backend)
**Owner**: GC
**Estimate**: 2 hours
**Dependencies**: None (extends existing WebSocket)

**Tasks**:
- [ ] Update `server/websocket.py` to emit `agent_update` events:
  ```python
  {
    "type": "agent_update",
    "agentIndex": 0,
    "agentName": "Agent 0",
    "agentType": "coding",
    "featureId": 12,
    "featureIds": [12],
    "featureName": "User authentication",
    "state": "working",
    "thought": "Reading auth.py...",
    "timestamp": "2026-02-04T10:30:00Z"
  }
  ```
- [ ] Update `server/websocket.py` to emit `orchestrator_update` events:
  ```python
  {
    "type": "orchestrator_update",
    "eventType": "state_change",
    "state": "monitoring",
    "message": "Monitoring 3 agents",
    "codingAgents": 2,
    "testingAgents": 1,
    "maxConcurrency": 3,
    "readyCount": 5,
    "blockedCount": 2,
    "timestamp": "2026-02-04T10:30:00Z"
  }
  ```
- [ ] Test: Start agent, verify WebSocket emits agent_update every 5s

**Files**:
- `server/websocket.py` (UPDATE)
- `server/agents/orchestrator.py` (UPDATE if needed)

---

### 1.4 Progress Dashboard Enhancement
**Owner**: OC
**Estimate**: 1.5 hours
**Dependencies**: None (refactor existing component)

**Tasks**:
- [ ] Update `apps/web/src/components/MetricsBar.tsx` → rename to `ProgressDashboard.tsx`
- [ ] Add progress bar with percentage
- [ ] Add connection status badge (Live/Offline)
- [ ] Add agent thought display:
  - Extract from agent logs using regex
  - Fade transition between thoughts
  - Only show when agent is running
  - Brain icon with sparkle animation
- [ ] Test: Run agent, verify thought updates every 5s

**Files**:
- `apps/web/src/components/ProgressDashboard.tsx` (RENAME + UPDATE)

---

### 1.5 Debug Panel Tab Enhancement
**Owner**: OC
**Estimate**: 1.5 hours
**Dependencies**: None (refactor existing component)

**Tasks**:
- [ ] Update `apps/web/src/components/DebugPanel.tsx`
  - Add tab bar: [Agent] [DevServer] [Terminal 1] [Terminal 2] [+ New]
  - Persist active tab in localStorage
  - Auto-scroll toggle (checkbox)
  - Clear logs button
  - Keyboard shortcut: `T` for terminal tab
- [ ] Test: Switch tabs, verify logs persist, test auto-scroll

**Files**:
- `apps/web/src/components/DebugPanel.tsx` (UPDATE)

---

## PHASE 2: PROJECT CREATION (Week 2-3, 12-15 hours)

### 2.1 New Project Modal (Frontend)
**Owner**: OC
**Estimate**: 4 hours
**Dependencies**: Backend filesystem API (exists), spec chat (task 2.2)

**Tasks**:
- [ ] Create `NewProjectModal.tsx` - 4-step wizard:
  - Step 1: Project name input with validation
  - Step 2: Folder browser (use existing FolderBrowser or create)
  - Step 3: Spec method selection (Claude AI | Manual)
  - Step 4: Spec creation chat (if Claude) or complete (if Manual)
- [ ] Create stepper component (progress dots: ●○○○)
- [ ] Add validation:
  - Name: alphanumeric, -, _
  - Folder: must exist, must be empty or have package.json
- [ ] Integrate with `POST /api/projects` on completion
- [ ] Auto-start initializer agent if Claude method chosen
- [ ] Test: Create project with Claude method, verify spec files created

**Files**:
- `apps/web/src/components/NewProjectModal.tsx` (NEW)
- `apps/web/src/components/Stepper.tsx` (NEW)

---

### 2.2 Spec Creation Chat (Frontend)
**Owner**: OC
**Estimate**: 5 hours
**Dependencies**: Backend spec WebSocket (task 2.3)

**Tasks**:
- [ ] Create `SpecCreationChat.tsx` full-screen chat interface:
  - Chat message list (user + assistant bubbles)
  - Auto-scroll to bottom on new messages
  - Typing indicator (animated dots)
  - Image attachment support (drag-drop or click, max 5MB)
  - Sample prompt button (loads "Simple Todo app")
- [ ] Create `ChatMessage.tsx` component:
  - Markdown rendering (use react-markdown)
  - Image preview (base64 or URL)
  - Timestamp
- [ ] Create `QuestionOptions.tsx` component:
  - Structured multi-select/single-select questions
  - Checkbox grid layout
  - Submit button
- [ ] Implement `useSpecChat.ts` hook:
  - WebSocket connection to `/ws/spec/{projectName}`
  - Message types: text, question, spec_complete, file_written, error
  - Send: message (with attachments), answer (structured responses)
  - Reconnection with exponential backoff
- [ ] Add completion UI:
  - "Spec created successfully" message
  - Files written list
  - YOLO mode toggle
  - "Exit to Project" button
  - "Continue to Project & Start Agent" button
- [ ] Update `apps/web/src/lib/types.ts`:
  ```typescript
  interface SpecQuestion {
    questionId: string
    question: string
    header: string
    options: Array<{ label: string; description: string }>
    multiSelect: boolean
  }

  interface SpecChatServerMessage {
    type: 'text' | 'question' | 'spec_complete' | 'file_written' | 'complete' | 'error' | 'response_done' | 'pong'
    content?: string
    questions?: SpecQuestion[]
    path?: string
    tool_id?: string
  }
  ```
- [ ] Test: Create spec, answer questions, verify spec files written

**Files**:
- `apps/web/src/components/SpecCreationChat.tsx` (NEW)
- `apps/web/src/components/ChatMessage.tsx` (NEW)
- `apps/web/src/components/QuestionOptions.tsx` (NEW)
- `apps/web/src/components/TypingIndicator.tsx` (NEW)
- `apps/web/src/hooks/useSpecChat.ts` (NEW)
- `apps/web/src/lib/types.ts` (UPDATE)

---

### 2.3 Spec Creation WebSocket (Backend)
**Owner**: GC
**Estimate**: 6 hours
**Dependencies**: None (new endpoint)

**Tasks**:
- [ ] Implement `server/routers/spec_creation.py` WebSocket endpoint `/ws/spec/{project_name}`:
  - Accept: `{type: 'message', content, attachments?}`
  - Accept: `{type: 'answer', answers: {questionId: value}}`
  - Accept: `{type: 'ping'}`
  - Send: `{type: 'text', content}` (streamed)
  - Send: `{type: 'question', questions: [...], tool_id}`
  - Send: `{type: 'spec_complete', path}`
  - Send: `{type: 'file_written', path}`
  - Send: `{type: 'complete'}`
  - Send: `{type: 'error', content}`
  - Send: `{type: 'response_done'}`
  - Send: `{type: 'pong'}`
- [ ] Implement spec creation agent logic:
  - Use Claude to interview user
  - Generate spec.md and features.json files
  - Write to `{project_path}/prompts/` directory
- [ ] Add image attachment handling (base64 decode, save to temp, pass to Claude)
- [ ] Add structured question tool for multi-choice questions
- [ ] Test: Create spec via WebSocket, verify files written

**Files**:
- `server/routers/spec_creation.py` (NEW or UPDATE)
- `server/services/spec_chat_session.py` (NEW)

---

## PHASE 3: GRAPH VISUALIZATION (Week 3-4, 5-7 hours)

### 3.1 Dependency Graph Component (Frontend)
**Owner**: OC
**Estimate**: 4 hours
**Dependencies**: Backend graph API (exists)

**Tasks**:
- [ ] Install `vis-network` or `react-flow` library (`pnpm add vis-network`)
- [ ] Create `DependencyGraph.tsx` component:
  - Fetch graph data from `GET /api/projects/{name}/features/graph`
  - Render nodes (features) with colors by status:
    - Pending: Grey
    - In Progress: Blue (pulsing)
    - Done: Green
    - Blocked: Red
  - Render edges (dependencies) as arrows
  - Show agent avatars on active nodes
  - Click node → open FeatureModal
  - Pan/zoom controls
  - Fit/center buttons
- [ ] Create `ViewToggle.tsx` component:
  - Radio buttons: Kanban | Graph
  - Persist selection in localStorage
  - Keyboard shortcut: `G` to toggle
- [ ] Update main dashboard to conditionally render Kanban or Graph
- [ ] Test: Toggle view, click node, verify modal opens

**Files**:
- `apps/web/src/components/DependencyGraph.tsx` (NEW)
- `apps/web/src/components/ViewToggle.tsx` (NEW)
- `apps/web/src/app/page.tsx` (UPDATE)

---

### 3.2 Feature Modal (Frontend)
**Owner**: OC
**Estimate**: 3 hours
**Dependencies**: Backend feature CRUD APIs (exist)

**Tasks**:
- [ ] Create `FeatureModal.tsx` dialog with 3 tabs:
  - Tab 1: Details (category, priority, description, steps)
  - Tab 2: Dependencies (manage which features must complete first)
  - Tab 3: Actions (delete, skip, edit)
- [ ] Create `EditFeatureForm.tsx` for inline editing
- [ ] Add dependency selector (checkboxes for all features)
- [ ] Integrate with:
  - `PATCH /api/projects/{name}/features/{id}` - Update
  - `DELETE /api/projects/{name}/features/{id}` - Delete
  - `PATCH /api/projects/{name}/features/{id}/skip` - Mark passing
  - `POST /api/projects/{name}/features/{id}/dependencies/{depId}` - Add dep
  - `DELETE /api/projects/{name}/features/{id}/dependencies/{depId}` - Remove dep
- [ ] Test: Edit feature, add dependency, delete feature

**Files**:
- `apps/web/src/components/FeatureModal.tsx` (NEW)
- `apps/web/src/components/EditFeatureForm.tsx` (NEW)

---

## PHASE 4: ENHANCEMENT & POLISH (Week 4+, 5-8 hours)

### 4.1 Expand Project Chat (Frontend)
**Owner**: OC
**Estimate**: 2 hours
**Dependencies**: Backend expand WebSocket (task 4.2)

**Tasks**:
- [ ] Create `ExpandProjectModal.tsx` + `ExpandProjectChat.tsx`:
  - Similar to SpecCreationChat but simpler
  - No image attachments
  - Focus on bulk feature generation
  - Shows "Features created: X" message
  - Auto-refreshes feature list on completion
- [ ] Implement `useExpandChat.ts` hook:
  - WebSocket to `/ws/expand/{projectName}`
  - Message types: text, features_created, expansion_complete, error
- [ ] Add button to KanbanBoard header
- [ ] Keyboard shortcut: `E` to open
- [ ] Test: Expand project, verify features added

**Files**:
- `apps/web/src/components/ExpandProjectModal.tsx` (NEW)
- `apps/web/src/components/ExpandProjectChat.tsx` (NEW)
- `apps/web/src/hooks/useExpandChat.ts` (NEW)

---

### 4.2 Expand Project WebSocket (Backend)
**Owner**: GC
**Estimate**: 3 hours
**Dependencies**: None (new endpoint)

**Tasks**:
- [ ] Implement `server/routers/expand_project.py` WebSocket endpoint `/ws/expand/{project_name}`:
  - Accept: `{type: 'message', content}`
  - Send: `{type: 'text', content}` (streamed)
  - Send: `{type: 'features_created', count, features: [{id, name, category}]}`
  - Send: `{type: 'expansion_complete', total_added}`
  - Send: `{type: 'response_done'}`
  - Send: `{type: 'error', content}`
- [ ] Implement bulk feature creation logic
- [ ] Test: Send "Add user profile feature", verify features created

**Files**:
- `server/routers/expand_project.py` (NEW or UPDATE)
- `server/services/expand_chat_session.py` (UPDATE)

---

### 4.3 Settings Modal (Frontend)
**Owner**: OC
**Estimate**: 1.5 hours
**Dependencies**: Backend settings API (exists)

**Tasks**:
- [ ] Create `SettingsModal.tsx`:
  - YOLO mode toggle
  - Claude model selector (dropdown)
  - Testing agent ratio slider (0-3)
  - Batch size slider (1-3 features per agent)
  - Playwright headless toggle
  - Mode indicators (Ollama/GLM badges)
- [ ] Integrate with `GET /api/settings` and `PATCH /api/settings`
- [ ] Keyboard shortcut: `,` to open
- [ ] Test: Toggle YOLO mode, change model, verify saved

**Files**:
- `apps/web/src/components/SettingsModal.tsx` (NEW)

---

### 4.4 Assistant Panel (Frontend)
**Owner**: OC
**Estimate**: 3 hours
**Dependencies**: Backend assistant WebSocket (exists)

**Tasks**:
- [ ] Create `AssistantPanel.tsx` slide-in panel:
  - Conversation history sidebar (list past conversations)
  - Chat interface (similar to SpecCreationChat)
  - New conversation button
  - Delete conversation button
- [ ] Create `ConversationHistory.tsx` sidebar component
- [ ] Update `useAssistantChat.ts` hook:
  - Load conversations on mount: `GET /api/assistant/conversations/{project}`
  - Create conversation: `POST /api/assistant/conversations/{project}`
  - Delete conversation: `DELETE /api/assistant/conversations/{project}/{id}`
  - WebSocket to `/ws/assistant/{project}` (already exists)
- [ ] Persist active conversation ID in localStorage
- [ ] Keyboard shortcut: `A` to toggle
- [ ] Test: Create conversation, switch conversations, delete conversation

**Files**:
- `apps/web/src/components/AssistantPanel.tsx` (NEW)
- `apps/web/src/components/ConversationHistory.tsx` (NEW)
- `apps/web/src/hooks/useAssistantChat.ts` (UPDATE)

---

### 4.5 Schedule Management (Frontend)
**Owner**: OC
**Estimate**: 2 hours
**Dependencies**: Backend schedule API (exists)

**Tasks**:
- [ ] Create `ScheduleModal.tsx`:
  - List schedules with enable/disable toggles
  - Create/edit schedule form
  - Time picker (local time, stored as UTC)
  - Days of week checkboxes (Mon-Sun)
  - Duration input (minutes)
  - Delete schedule button
- [ ] Integrate with:
  - `GET /api/projects/{name}/schedules` - List
  - `POST /api/projects/{name}/schedules` - Create
  - `PATCH /api/projects/{name}/schedules/{id}` - Update
  - `DELETE /api/projects/{name}/schedules/{id}` - Delete
  - `GET /api/projects/{name}/schedules/next` - Next run
- [ ] Add schedule indicator badge to AgentControl
- [ ] Test: Create schedule, verify next run shows

**Files**:
- `apps/web/src/components/ScheduleModal.tsx` (NEW)

---

### 4.6 Keyboard Shortcuts Help (Frontend)
**Owner**: OC
**Estimate**: 1 hour
**Dependencies**: None

**Tasks**:
- [ ] Create `KeyboardShortcutsHelp.tsx` modal:
  - List all 9 shortcuts with descriptions
  - Grouped by category (Navigation, Actions, Panels)
  - Search/filter shortcuts
- [ ] Keyboard shortcut: `?` to open
- [ ] Test: Press ?, verify all shortcuts listed

**Files**:
- `apps/web/src/components/KeyboardShortcutsHelp.tsx` (NEW)

---

### 4.7 Reset Project Modal (Frontend)
**Owner**: OC
**Estimate**: 1 hour
**Dependencies**: Backend reset API (exists)

**Tasks**:
- [ ] Create `ResetProjectModal.tsx`:
  - Warning message
  - Two options: Quick reset (keep spec) | Full reset (delete all)
  - Confirmation checkbox
  - Reset button (destructive style)
- [ ] Integrate with `POST /api/projects/{name}/reset?full_reset={bool}`
- [ ] Keyboard shortcut: `R` to open
- [ ] Test: Quick reset, verify features cleared but spec remains

**Files**:
- `apps/web/src/components/ResetProjectModal.tsx` (NEW)

---

## INFRASTRUCTURE TASKS

### I.1 Configure ade-api.getmytestdrive.com Subdomain
**Owner**: GC
**Estimate**: 1 hour
**Dependencies**: None

**Tasks**:
- [ ] Use Render REST API or MCP to configure custom domain:
  - Add `ade-api.getmytestdrive.com` as custom domain
  - Point to `hex-ade-api.onrender.com` service
  - Verify SSL certificate auto-provisioned
- [ ] Update CORS in `server/main.py`:
  - Add `https://ade.getmytestdrive.com` to allowed origins
  - Add `https://ade-api.getmytestdrive.com` to allowed origins
- [ ] Update DNS:
  - CNAME: `ade-api.getmytestdrive.com` → `hex-ade-api.onrender.com`
- [ ] Test: `curl https://ade-api.getmytestdrive.com/health` → `{"status":"healthy"}`

**Files**:
- `server/main.py` (UPDATE CORS)
- DNS configuration (external)

---

### I.2 Update Frontend API Client for Subdomain
**Owner**: OC
**Estimate**: 0.5 hours
**Dependencies**: Task I.1 complete

**Tasks**:
- [ ] Update `apps/web/src/lib/api.ts`:
  - Change `API_BASE` to `https://ade-api.getmytestdrive.com`
  - Update WebSocket URLs in hooks to use `wss://ade-api.getmytestdrive.com`
- [ ] Update `.env.local` for development:
  - `NEXT_PUBLIC_API_BASE=http://localhost:8000`
- [ ] Update `.env.production` for production:
  - `NEXT_PUBLIC_API_BASE=https://ade-api.getmytestdrive.com`
- [ ] Test: Frontend can call backend, WebSocket connects

**Files**:
- `apps/web/src/lib/api.ts` (UPDATE)
- `apps/web/.env.local` (UPDATE)
- `apps/web/.env.production` (CREATE)

---

### I.3 Create TDD Document
**Owner**: CC (Claude Code)
**Estimate**: 1 hour
**Dependencies**: None

**Tasks**:
- [ ] Write `docs/03-technical/02-tdd-reference-mapping.md`:
  - API endpoint specifications (request/response schemas)
  - WebSocket protocol (all message types)
  - Type definitions (copy from reference types.ts)
  - State management hooks (useProjectWebSocket, useSpecChat, etc.)
  - Database schema (features table, conversations table)
  - Authentication/authorization model
  - Error handling patterns

**Files**:
- `docs/03-technical/02-tdd-reference-mapping.md` (NEW)

---

### I.4 Create HDS Document with Wireframes
**Owner**: CC (Claude Code)
**Estimate**: 1 hour
**Dependencies**: None

**Tasks**:
- [ ] Complete `docs/02-design/02-hds-reference-mapping.md`:
  - ASCII wireframes for all 18 screens
  - Component mapping table (reference → hex-ade)
  - Layout specifications (responsive breakpoints)
  - Interaction patterns (keyboard shortcuts, hover states)
  - Animation specifications (pulse, fade, slide)
  - Color palette (category colors, agent colors, status colors)
  - Typography scale
  - Accessibility requirements (ARIA labels, screen reader support)

**Files**:
- `docs/02-design/02-hds-reference-mapping.md` (UPDATE - add wireframes)

---

## TESTING TASKS

### T.1 End-to-End Browser Testing
**Owner**: OC
**Estimate**: 3 hours (spread across phases)
**Dependencies**: Playwright installed

**Tasks**:
- [ ] Install Playwright: `cd apps/web && npx playwright install`
- [ ] Create `apps/web/e2e/project-creation.spec.ts`:
  - Test: Create project with Claude method
  - Test: Answer questions, verify spec files created
- [ ] Create `apps/web/e2e/feature-workflow.spec.ts`:
  - Test: Add feature manually
  - Test: Start agent, verify feature moves to in progress
  - Test: Wait for completion, verify celebration
- [ ] Create `apps/web/e2e/keyboard-shortcuts.spec.ts`:
  - Test: All 9 keyboard shortcuts
- [ ] Run tests: `npx playwright test`

**Files**:
- `apps/web/e2e/*.spec.ts` (NEW)
- `apps/web/playwright.config.ts` (NEW)

---

## TASK ASSIGNMENT SUMMARY

### GC (Backend / API): 5 tasks, ~13 hours
1. ✅ I.1 - Configure ade-api subdomain (1h)
2. ✅ 1.3 - WebSocket agent updates (2h)
3. ✅ 2.3 - Spec creation WebSocket (6h)
4. ✅ 4.2 - Expand project WebSocket (3h)
5. ✅ Backend CORS updates (1h)

### OC (Frontend / UI): 16 tasks, ~30 hours
1. ✅ I.2 - Update frontend API client (0.5h)
2. ✅ 1.1 - Agent control panel (2h)
3. ✅ 1.2 - Mission control dashboard (3h)
4. ✅ 1.4 - Progress dashboard enhancement (1.5h)
5. ✅ 1.5 - Debug panel tab enhancement (1.5h)
6. ✅ 2.1 - New project modal (4h)
7. ✅ 2.2 - Spec creation chat (5h)
8. ✅ 3.1 - Dependency graph component (4h)
9. ✅ 3.2 - Feature modal (3h)
10. ✅ 4.1 - Expand project chat (2h)
11. ✅ 4.3 - Settings modal (1.5h)
12. ✅ 4.4 - Assistant panel (3h)
13. ✅ 4.5 - Schedule management (2h)
14. ✅ 4.6 - Keyboard shortcuts help (1h)
15. ✅ 4.7 - Reset project modal (1h)
16. ✅ T.1 - E2E browser testing (3h)

### CC (Documentation): 2 tasks, ~2 hours
1. ✅ I.3 - Create TDD document (1h)
2. ✅ I.4 - Complete HDS with wireframes (1h)

---

## CRITICAL PATH

**Week 1**:
1. I.1 (GC) → I.2 (OC) - Subdomain setup MUST be done first
2. 1.3 (GC) || 1.1 (OC) - Can work in parallel
3. 1.2 (OC) depends on 1.3 (GC)
4. 1.4 (OC) || 1.5 (OC) - Can work in parallel

**Week 2-3**:
5. 2.3 (GC) || 2.1 (OC) - Can work in parallel
6. 2.2 (OC) depends on 2.3 (GC)

**Week 3-4**:
7. 3.1 (OC) || 3.2 (OC) - Can work in parallel

**Week 4+**:
8. 4.2 (GC) || 4.1 (OC) - Can work in parallel
9. 4.3-4.7 (OC) - Sequential or parallel

**Testing**: T.1 (OC) - Run at end of each phase

---

## SUCCESS CRITERIA

### Phase 1 Complete:
- [ ] Agent control shows concurrency slider
- [ ] Mission control shows active agents
- [ ] Progress dashboard shows agent thoughts
- [ ] WebSocket emits agent_update events
- [ ] Debug panel has tabs

### Phase 2 Complete:
- [ ] Can create project with Claude AI method
- [ ] Spec creation chat works end-to-end
- [ ] Spec files written to prompts/ directory
- [ ] Initializer agent auto-starts

### Phase 3 Complete:
- [ ] Can toggle between Kanban and Graph view
- [ ] Graph shows features with dependencies
- [ ] Can click node to open feature modal
- [ ] Feature modal allows editing

### Phase 4 Complete:
- [ ] Can expand project with bulk features
- [ ] Settings modal saves preferences
- [ ] Assistant panel persists conversations
- [ ] All 9 keyboard shortcuts work

### Final Acceptance:
- [ ] E2E tests pass (Playwright)
- [ ] No console errors in production
- [ ] WebSocket connection stable (no drops)
- [ ] UI matches reference screenshots (80%+)
- [ ] Performance: First load < 2s

---

**WBS Complete**: All tasks defined, estimated, and assigned.
