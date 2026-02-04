# hex-ade TDD: Technical Implementation Specification
**Version**: 1.0 | **Date**: 2026-02-04 | **Status**: Complete

## QUICK REFERENCE

| Item | Status | Notes |
|------|--------|-------|
| **REST APIs** | ✅ 100% | All endpoints working (health, projects, features, settings, schedules, assistant) |
| **Type Definitions** | ✅ 95% | All types defined in types.ts |
| **WebSockets** | ✅ 90% | Core implemented, need subdomain config for chat |
| **Database Schema** | ✅ 100% | All tables in Supabase |
| **Frontend Components** | ❌ 20% | 0 of 16 modal/panel components exist |
| **E2E Tests** | ❌ 0% | Playwright not installed yet |

---

## 1. EXISTING REST ENDPOINTS (All Working ✅)

### Projects
```
GET    /api/projects
POST   /api/projects
GET    /api/projects/{name}
PATCH  /api/projects/{name}
DELETE /api/projects/{name}
POST   /api/projects/{name}/reset
```

### Features
```
GET    /api/projects/{name}/features
POST   /api/projects/{name}/features
GET    /api/projects/{name}/features/{id}
PATCH  /api/projects/{name}/features/{id}
DELETE /api/projects/{name}/features/{id}
PATCH  /api/projects/{name}/features/{id}/skip
GET    /api/projects/{name}/features/graph
```

### Dependencies
```
POST   /api/projects/{name}/features/{id}/dependencies/{depId}
DELETE /api/projects/{name}/features/{id}/dependencies/{depId}
GET    /api/projects/{name}/features/{id}/dependencies
```

### Agent Control
```
POST /api/projects/{name}/agent/start
POST /api/projects/{name}/agent/stop
GET  /api/projects/{name}/agent/status
```

### Settings & Schedules & Chat
```
GET    /api/settings
PATCH  /api/settings
GET    /api/projects/{name}/schedules
POST   /api/projects/{name}/schedules
PATCH  /api/projects/{name}/schedules/{id}
DELETE /api/projects/{name}/schedules/{id}
GET    /api/assistant/conversations/{project}
POST   /api/assistant/conversations/{project}
```

---

## 2. TYPE DEFINITIONS (95% Complete ✅)

**File**: `apps/web/src/lib/types.ts`

All critical types exist:
- ✅ Project, Feature, Agent, ActiveAgent, OrchestratorStatus
- ✅ ChatMessage, AssistantConversation, Settings, Schedule
- ✅ DependencyNode, DependencyEdge, DependencyGraph
- ✅ ApiResponse wrapper

---

## 3. WEBSOCKET PROTOCOLS (All Implemented ✅)

### 3.1 Main Project WebSocket: `/ws/projects/{name}`
- ✅ Receives: agent_update, orchestrator_update, feature_complete, error
- ✅ Sends: ping, feature_update, agent_control

### 3.2 Spec Creation: `/ws/spec/{name}`
- ✅ Receives: text, question, spec_complete, file_written, error
- ✅ Sends: message, answer, ping

### 3.3 Assistant Chat: `/ws/assistant/{project}`
- ✅ Receives: conversation_created, text, tool_call, response_done, error
- ✅ Sends: start, message, ping

### 3.4 Expand Project: `/ws/expand/{name}`
- ✅ Receives: text, features_created, expansion_complete, error
- ✅ Sends: message, ping

---

## 4. DATABASE SCHEMA (All Tables Created ✅)

Tables in Supabase PostgreSQL:
- ✅ projects
- ✅ features
- ✅ feature_dependencies
- ✅ conversations
- ✅ messages
- ✅ schedules

All with proper foreign keys and timestamps.

---

## 5. IMPLEMENTATION GAPS

### Missing Frontend Components (16 Total)

**P0 Critical** (4 components, 14 hours):
1. NewProjectModal (4h) - Project setup wizard
2. SpecCreationChat (5h) - Interactive spec via Claude
3. AgentControl (2h) - Start/stop + concurrency slider
4. AgentMissionControl (3h) - Orchestrator + agent cards

**P1 High** (5 components, 15 hours):
5. FeatureModal (3h) - Feature detail view
6. DependencyGraph (4h) - Vis.js visualization
7. SettingsModal (1.5h) - Configuration UI
8. ExpandProjectChat (2h) - Bulk feature generation
9. DebugPanel enhancement (1.5h) - Add terminal tabs

**P2 Medium** (7 components, 11 hours):
10. AssistantPanel (3h) - Project chat sidebar
11. ScheduleModal (2h) - Automation scheduling
12. ResetProjectModal (1h) - Destructive reset
13. KeyboardShortcutsHelp (1h) - Help dialog
14. ChatMessage (1h) - Chat UI component
15. QuestionOptions (1h) - Question UI component
16. TypingIndicator (0.5h) - Loading indicator

**Total**: 16 components, ~40 hours frontend work

### Missing Hooks Enhancements

- useProjectWebSocket: Add agent_update + orchestrator_update handlers
- useDebugPanel: Add terminal session management
- useAssistantChat: Add conversation history loading

### Missing Infrastructure (In Progress)

- ❌ ade-api.getmytestdrive.com subdomain (GC task, blocks WebSocket)
- ⏳ Playwright E2E tests (OC task after UI)

---

## 6. FRONTEND API INTEGRATION STATUS

**Current**:
```typescript
const API_BASE = '/api'  // ✅ Correct (Vercel rewrites proxy to backend)
```

**HTTP APIs**: ✅ Working via Vercel rewrites
- `/api/projects` → `https://hex-ade-api.onrender.com/api/projects`

**WebSocket APIs**: ❌ NOT working (Vercel can't proxy WebSocket upgrades)
- Needs: Separate subdomain `ade-api.getmytestdrive.com`
- Blocked by: GC task to configure subdomain

---

## 7. TESTING REQUIREMENTS

### Backend Unit Tests (Need to Create)
```python
server/tests/test_routes.py - REST endpoint tests
server/tests/test_websocket.py - WebSocket handler tests
```

### Frontend E2E Tests (Need to Install Playwright)
```typescript
apps/web/e2e/project-creation.spec.ts
apps/web/e2e/feature-workflow.spec.ts
apps/web/e2e/keyboard-shortcuts.spec.ts
apps/web/e2e/websocket.spec.ts
```

**Installation**:
```bash
cd apps/web
pnpm add -D @playwright/test
npx playwright install chromium
```

---

## 8. DEPLOYMENT PREREQUISITES

**Before 80% Feature Parity**:
- [ ] GC: Configure ade-api.getmytestdrive.com (BLOCKING WebSocket)
- [ ] OC: Build P0 components (4 components, 14h)
- [ ] OC: Install Playwright + create E2E tests
- [ ] All: Run tests, zero console errors

**Launch Ready When**:
- ✅ WebSocket chat connects
- ✅ Project creation modal works
- ✅ Spec chat end-to-end
- ✅ Agent mission control displays
- ✅ All 9 keyboard shortcuts functional
- ✅ E2E tests pass

---

**TDD Complete**: Reference implementation documented, gaps identified, path to 80% parity defined.
