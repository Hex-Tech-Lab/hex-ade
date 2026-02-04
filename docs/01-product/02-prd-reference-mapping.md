# hex-ade PRD: Reference Mapping (Leon's AutoCoder)
**Version**: 1.0
**Date**: 2026-02-04
**Status**: Draft
**Reference**: /home/kellyb_dev/projects/hex-rag-dss/_reference/autocoder/

---

## 1. Executive Summary

This PRD maps Leon's AutoCoder reference implementation to the hex-ade framework (GOTCHA + ATLAS-VM). AutoCoder is a proven, production-ready autonomous coding agent with a React UI and FastAPI backend. hex-ade will adopt its complete feature set and UX patterns while enforcing our deterministic workflow principles.

**Core Architecture Retained:**
- Two-agent pattern (Initializer → Coding Agent)
- SQLite feature management with MCP server
- WebSocket real-time updates
- React + FastAPI + Claude Agent SDK

**hex-ade Enhancement:**
- GOTCHA 5-phase quality gates
- ATLAS-VM 7-step task workflow
- Deterministic Python tool governance
- Supabase backend (replacing SQLite for multi-user future)

---

## 2. User Stories (From Reference Implementation)

### US-01: Project Management
**As a developer**, I want to create, select, and manage multiple projects so that I can organize different applications.

**Acceptance Criteria:**
- Create new projects with interactive spec generation (US-09)
- Select projects from dropdown (with localStorage persistence)
- View project statistics (passing/in_progress/total features)
- Reset project state (partial: keep spec, full: delete all)
- Delete projects from registry
- View project path and prompts directory

**Reference Files:**
- `ui/src/components/ProjectSelector.tsx`
- `ui/src/components/NewProjectModal.tsx`
- `ui/src/components/ResetProjectModal.tsx`
- `server/routers/projects.py`

---

### US-02: Kanban Board Feature Tracking
**As a developer**, I want to view features in a Kanban board so that I can track implementation progress visually.

**Acceptance Criteria:**
- Three columns: Pending, In Progress, Done
- Color-coded feature cards by category
- Display feature priority, dependencies, blocking status
- Click card to view full details (steps, description)
- Show agent avatars on cards being worked on
- Filter/search features (implicit in UI)
- Drag-and-drop not implemented (agent-driven workflow)

**Reference Files:**
- `ui/src/components/KanbanBoard.tsx`
- `ui/src/components/KanbanColumn.tsx`
- `ui/src/components/FeatureCard.tsx`
- `ui/src/components/FeatureModal.tsx`

---

### US-03: Dependency Graph View
**As a developer**, I want to visualize feature dependencies as a graph so that I understand the project structure.

**Acceptance Criteria:**
- Toggle between Kanban and Graph view (keyboard shortcut: G)
- Node colors indicate status (pending/in_progress/done/blocked)
- Edges show dependency relationships
- Click node to open feature detail modal
- Real-time updates as features progress
- Agent indicators on active nodes

**Reference Files:**
- `ui/src/components/DependencyGraph.tsx`
- `ui/src/components/ViewToggle.tsx`
- `server/routers/features.py` (GET /graph endpoint)

---

### US-04: Manual Feature Management
**As a developer**, I want to manually add, edit, and delete features so that I can adjust the project scope.

**Acceptance Criteria:**
- Add single feature with form (category, name, description, steps, priority, dependencies)
- Edit existing feature properties
- Delete features (with dependency validation)
- Reorder feature priority
- Mark feature as passing/failing manually

**Reference Files:**
- `ui/src/components/AddFeatureForm.tsx`
- `ui/src/components/EditFeatureForm.tsx`
- `server/routers/features.py` (POST, PUT, DELETE endpoints)

---

### US-05: AI-Powered Feature Expansion
**As a developer**, I want to expand my project by chatting with AI so that it generates additional features from my description.

**Acceptance Criteria:**
- Modal chat interface with Claude
- Describe desired functionality in natural language
- AI suggests new features as JSON proposals
- Review and approve/reject before creation
- Batch create approved features
- Handle dependencies automatically

**Reference Files:**
- `ui/src/components/ExpandProjectModal.tsx`
- `ui/src/components/ExpandProjectChat.tsx`
- `server/routers/expand_project.py`
- `server/services/expand_chat_session.py`

---

### US-06: Interactive Spec Creation
**As a developer**, I want to create an app specification through guided conversation so that I don't have to write technical specs manually.

**Acceptance Criteria:**
- Full-screen chat interface
- Claude asks structured questions (framework, features, design)
- Multi-select and single-select question formats
- Image upload support (wireframes, mockups)
- Real-time streaming responses
- Generates 3 spec files: app_spec.txt, initializer_prompt.md, coding_prompt.md
- "Quick Start" sample prompt for testing

**Reference Files:**
- `ui/src/components/SpecCreationChat.tsx`
- `ui/src/components/QuestionOptions.tsx`
- `server/routers/spec_creation.py`
- `server/services/spec_chat_session.py`
- `.claude/commands/create-spec.md` (slash command)

---

### US-07: Agent Control
**As a developer**, I want to start, pause, and configure the autonomous agent so that I control when code generation happens.

**Acceptance Criteria:**
- Start agent with options: YOLO mode, max concurrency (1-5 agents), model selection
- Pause agent gracefully (finish current feature)
- Stop agent immediately
- View agent status: stopped/running/paused/crashed/loading
- Parallel mode with 3 agent roles: Initializer, Coding, Regression Testing
- Concurrency control (1-5 concurrent agents)
- Testing agent ratio (0-3 regression test agents)

**Reference Files:**
- `ui/src/components/AgentControl.tsx`
- `server/routers/agent.py`
- `agent.py` (session logic)
- `parallel_orchestrator.py` (multi-agent coordination)

---

### US-08: Mission Control Dashboard
**As a developer**, I want to see all active agents and their status so that I understand what the system is building.

**Acceptance Criteria:**
- Collapsible "Mission Control" panel
- Orchestrator status card (state, message, agent counts)
- Agent cards with mascot avatars (Spark, Fizz, Octo, Hoot, Buzz, etc.)
- Agent states: idle, thinking, working, testing, success, error, struggling
- Agent type badges: coding vs testing
- Per-agent thought bubbles (current action)
- Per-agent log viewer modal
- Activity feed of recent events
- Real-time WebSocket updates

**Reference Files:**
- `ui/src/components/AgentMissionControl.tsx`
- `ui/src/components/AgentCard.tsx`
- `ui/src/components/OrchestratorStatusCard.tsx`
- `ui/src/components/ActivityFeed.tsx`
- `ui/src/components/AgentAvatar.tsx`

---

### US-09: Progress Dashboard
**As a developer**, I want to see real-time progress metrics so that I know how much work is complete.

**Acceptance Criteria:**
- Passing/total feature count
- Percentage complete (with progress bar)
- Connection status indicator (WebSocket)
- Agent status badge (when single agent mode)
- Log output display (when not in parallel mode)
- Auto-updates via WebSocket

**Reference Files:**
- `ui/src/components/ProgressDashboard.tsx`
- WebSocket message type: `WSProgressMessage`

---

### US-10: Real-Time WebSocket Updates
**As a developer**, I want the UI to update automatically as the agent works so that I don't need to refresh.

**Acceptance Criteria:**
- Connect to project-specific WebSocket: `/ws/projects/{project_name}`
- Message types: progress, feature_update, log, agent_status, agent_update, orchestrator_update, dev_log, dev_server_status
- Reconnect automatically on disconnect
- Ping/pong heartbeat (30s interval)
- Visual connection indicator (green/red wifi icon)

**Reference Files:**
- `ui/src/hooks/useWebSocket.ts`
- `server/websocket.py` (not in routers/)

---

### US-11: Debug Panel with Logs and Terminal
**As a developer**, I want to view agent logs and run commands so that I can debug issues.

**Acceptance Criteria:**
- Fixed bottom panel (resizable, collapsible)
- Tabs: Agent Logs, Dev Server Logs, Terminal
- Agent logs: stdout from subprocess, auto-scroll
- Dev server logs: npm run dev output
- Terminal: Full xterm.js instance with Bash access
- Multiple terminal tabs (create, rename, close)
- Keyboard shortcuts: D (toggle), T (toggle terminal tab)
- Clear logs button

**Reference Files:**
- `ui/src/components/DebugLogViewer.tsx`
- `ui/src/components/Terminal.tsx`
- `ui/src/components/TerminalTabs.tsx`
- `server/routers/terminal.py` (WebSocket PTY)

---

### US-12: Dev Server Management
**As a developer**, I want to start/stop the generated app's dev server so that I can preview the application.

**Acceptance Criteria:**
- Auto-detect project type: Vite, Next.js, Create React App, generic npm
- Start dev server with detected command
- Stop dev server (kill process)
- View server status: running/stopped/crashed
- Display server URL (clickable link)
- WebSocket status updates
- Process isolation from agent

**Reference Files:**
- `ui/src/components/DevServerControl.tsx`
- `server/routers/devserver.py`
- `server/services/dev_server_manager.py`

---

### US-13: Project Assistant Chat
**As a developer**, I want to ask questions about my project so that the AI can help me understand or modify code.

**Acceptance Criteria:**
- Slide-in panel (right side, keyboard shortcut: A)
- Persistent conversation history (SQLite database)
- Context-aware: uses project files via MCP tools
- Conversation list (switch between past chats)
- New chat button
- Tool call display (show file reads, searches)
- Image attachment support (for screenshots, designs)
- Auto-scroll and typing indicators

**Reference Files:**
- `ui/src/components/AssistantPanel.tsx`
- `ui/src/components/AssistantChat.tsx`
- `ui/src/components/ConversationHistory.tsx`
- `server/routers/assistant_chat.py`
- `server/services/assistant_chat_session.py`
- `server/services/assistant_database.py`

---

### US-14: Schedule Management
**As a developer**, I want to schedule agent runs so that coding happens automatically at specific times.

**Acceptance Criteria:**
- Create schedules: start time, duration, days of week
- Enable/disable schedules
- Time zone conversion (local display, UTC storage)
- Schedule-specific settings: YOLO mode, model, max concurrency
- Next run indicator (when will agent start)
- Crash counter (auto-disable after repeated failures)
- Up to 50 schedules per project

**Reference Files:**
- `ui/src/components/ScheduleModal.tsx`
- `server/routers/schedules.py`
- `server/services/scheduler_service.py` (background thread)
- `api/database.py` (Schedule model)

---

### US-15: Settings Management
**As a developer**, I want to configure agent behavior so that I control code generation parameters.

**Acceptance Criteria:**
- Global settings: model selection, YOLO mode, testing agent ratio, Playwright headless, batch size
- Project settings: default concurrency
- Model list from OpenRouter API
- Ollama mode indicator (badge)
- GLM mode indicator (badge)
- Settings persistence in environment and database

**Reference Files:**
- `ui/src/components/SettingsModal.tsx`
- `server/routers/settings.py`
- `env_constants.py` (environment variable parsing)

---

### US-16: Keyboard Shortcuts
**As a developer**, I want keyboard shortcuts so that I can navigate the UI quickly.

**Acceptance Criteria:**
- D: Toggle debug panel
- T: Toggle terminal tab
- N: Add new feature
- E: Expand project with AI
- A: Toggle assistant panel
- G: Toggle graph/kanban view
- R: Reset project
- , (comma): Open settings
- ?: Show keyboard shortcuts help
- Escape: Close modals/panels

**Reference Files:**
- `ui/src/components/KeyboardShortcutsHelp.tsx`
- `ui/src/lib/keyboard.ts`
- `App.tsx` (event listener)

---

### US-17: Theme System
**As a developer**, I want to customize the UI appearance so that I can match my preferences.

**Acceptance Criteria:**
- Dark/light mode toggle
- Multiple theme presets: Nord, Catppuccin, Tokyo Night, Gruvbox, Dracula, Synthwave, Cyberpunk
- Theme selector dropdown
- CSS custom properties for colors
- Persistence to localStorage

**Reference Files:**
- `ui/src/components/ThemeSelector.tsx`
- `ui/src/hooks/useTheme.ts`
- `ui/src/index.css` (theme definitions)

---

### US-18: Celebration Effects
**As a developer**, I want visual feedback when features complete so that progress feels rewarding.

**Acceptance Criteria:**
- Confetti animation on feature completion
- Sound effects on column transitions
- Agent mascot display with feature name
- Auto-dismiss after 3 seconds
- Celebration overlay (full-screen)

**Reference Files:**
- `ui/src/components/CelebrationOverlay.tsx`
- `ui/src/hooks/useCelebration.ts`
- `ui/src/hooks/useFeatureSound.ts`

---

### US-19: Filesystem Browser
**As a developer**, I want to browse my filesystem so that I can select project directories during setup.

**Acceptance Criteria:**
- Drive list (Windows support)
- Directory tree navigation
- Path validation (exists, writable, is_directory)
- Parent directory navigation
- Autocomplete for manual paths

**Reference Files:**
- `ui/src/components/FolderBrowser.tsx`
- `server/routers/filesystem.py`

---

### US-20: Documentation System
**As a developer**, I want built-in documentation so that I understand how to use the platform.

**Acceptance Criteria:**
- Hash-based routing to /docs
- Sidebar navigation
- Search functionality
- Sections: Getting Started, Features/Kanban, AI Assistant, Scheduling, Settings, Security, Advanced Config
- Markdown-style rendering
- Code examples and screenshots

**Reference Files:**
- `ui/src/components/docs/DocsPage.tsx`
- `ui/src/components/docs/DocsContent.tsx`
- `ui/src/components/docs/DocsSidebar.tsx`
- `ui/src/components/docs/sections/*.tsx` (10+ doc sections)

---

### US-21: Security Model
**As a developer**, I want command restrictions so that the agent can't harm my system.

**Acceptance Criteria:**
- Bash command allowlist (file inspection, npm, git, process management only)
- OS-level sandbox (Claude Agent SDK)
- Filesystem restrictions (project directory only)
- Blocked commands: rm -rf, curl external, network access
- Security hook validation before execution

**Reference Files:**
- `security.py` (ALLOWED_COMMANDS)
- `client.py` (sandbox configuration)

---

### US-22: Setup Wizard
**As a developer**, I want guided onboarding so that I can configure the system on first run.

**Acceptance Criteria:**
- Check Claude CLI installation
- Check authentication status
- Check Node.js and npm
- Step-by-step instructions
- Skip option for advanced users

**Reference Files:**
- `ui/src/components/SetupWizard.tsx`
- `ui/src/components/ProjectSetupRequired.tsx`

---

## 3. Feature List (Exact Match to Reference)

| ID | Feature | Category | Priority | hex-ade Phase |
|----|---------|----------|----------|---------------|
| F01 | Project Management (Create, Select, Reset, Delete) | Core | P0 | GOTCHA-G |
| F02 | Kanban Board UI | Visualization | P0 | GOTCHA-O |
| F03 | Dependency Graph Visualization | Visualization | P1 | GOTCHA-O |
| F04 | Manual Feature CRUD | Feature Management | P0 | GOTCHA-G |
| F05 | AI Feature Expansion Chat | AI | P1 | ATLAS-A |
| F06 | Interactive Spec Creation | AI | P0 | ATLAS-A |
| F07 | Agent Control (Start/Pause/Stop) | Core | P0 | ATLAS-L |
| F08 | Multi-Agent Orchestrator | Core | P0 | ATLAS-A |
| F09 | Mission Control Dashboard | Monitoring | P0 | GOTCHA-C |
| F10 | Progress Dashboard | Monitoring | P0 | GOTCHA-C |
| F11 | Real-Time WebSocket Updates | Infrastructure | P0 | GOTCHA-C |
| F12 | Debug Panel (Logs + Terminal) | Developer Tools | P1 | GOTCHA-C |
| F13 | Dev Server Management | Developer Tools | P1 | GOTCHA-T |
| F14 | Project Assistant Chat | AI | P1 | ATLAS-A |
| F15 | Schedule Management | Automation | P2 | GOTCHA-O |
| F16 | Settings Management | Configuration | P1 | GOTCHA-G |
| F17 | Keyboard Shortcuts | UX | P2 | GOTCHA-O |
| F18 | Theme System | UX | P2 | GOTCHA-O |
| F19 | Celebration Effects | UX | P2 | GOTCHA-C |
| F20 | Filesystem Browser | Developer Tools | P1 | GOTCHA-T |
| F21 | Documentation System | Documentation | P1 | GOTCHA-HA |
| F22 | Security Command Allowlist | Security | P0 | ATLAS-A |
| F23 | Setup Wizard | Onboarding | P1 | GOTCHA-G |
| F24 | MCP Feature Server | Infrastructure | P0 | ATLAS-T |
| F25 | SQLite Feature Database | Data | P0 | GOTCHA-T |

**Note:** hex-ade will replace F25 with Supabase (Postgres) for multi-user future scalability.

---

## 4. Acceptance Criteria (Overall)

### Quality Gates (GOTCHA)
- **G (Goals):** All features in this PRD must have corresponding acceptance criteria documented
- **O (Orchestration):** Task execution order follows ATLAS-VM 7-step workflow
- **T (Tools):** Python deterministic scripts govern all agent operations
- **C (Checkpoints):** WebSocket updates provide real-time validation feedback
- **HA (Handoff/Audit):** All agent actions logged to SQLite/Supabase with timestamps

### Technical Requirements
- Frontend: React 18 + TypeScript + Vite + Tailwind CSS v4 + Radix UI
- Backend: FastAPI + Python 3.11+ + SQLAlchemy
- Database: Supabase (Postgres) for hex-ade (SQLite in reference)
- Deployment: Vercel (frontend) + Render/Supabase (backend)
- Testing: Vitest (unit) + Playwright (E2E)

### Performance
- WebSocket latency < 100ms (local network)
- UI frame rate > 30fps during animations
- Feature list render < 500ms for 200 features
- Graph render < 2s for 200 nodes

### Security
- All Bash commands validated against allowlist
- Filesystem access restricted to project directory
- No external network access from agent subprocess
- API keys stored in environment variables only

---

## 5. Out of Scope (v1.0)

### Multi-Agent Orchestration (Later Phase)
The reference implementation includes a **parallel orchestrator** with:
- Multiple concurrent coding agents (1-5)
- Dedicated regression testing agents (0-3)
- Agent mascots and mission control UI
- Batch processing (1-3 features per agent)

**Decision:** hex-ade v1.0 will implement the **single-agent** workflow first. Multi-agent orchestration becomes a Phase 2 feature after core GOTCHA/ATLAS-VM validation is proven.

**Rationale:**
1. Simpler initial architecture reduces risk
2. Single-agent workflow easier to debug
3. GOTCHA quality gates need validation first
4. Multi-agent adds complexity (scheduling, deadlocks, resource contention)

**Files to Defer:**
- `parallel_orchestrator.py`
- `ui/src/components/AgentMissionControl.tsx` (simplified version retained)
- `ui/src/components/AgentCard.tsx`
- Multi-agent WebSocket message types

---

### Also Out of Scope (v1.0)
- Multi-tenant SaaS (single user only)
- Team collaboration features
- Custom model fine-tuning
- Mobile app
- Cloud storage integration (beyond Supabase)
- Git provider integration (GitHub, GitLab)
- CI/CD pipeline generation
- Containerization (Docker/K8s)

---

## 6. Dependencies

### External Services
- Supabase project provisioned (Postgres + Auth + pgvector)
- Vercel account connected
- Claude API access (via claude-code CLI)
- GitHub repository created

### Development Tools
- Node.js 20+ (frontend build)
- Python 3.11+ (backend + agent)
- Claude Code CLI installed and authenticated
- pnpm package manager

---

## 7. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Feature parity with reference | 100% (22/22 user stories) | Manual verification |
| Agent start time | < 10s | Stopwatch from button click to first log |
| WebSocket message latency | < 100ms | Network tab timing |
| UI responsiveness (Lighthouse) | > 90 score | Automated audit |
| Test coverage (backend) | > 80% | pytest --cov |
| E2E test pass rate | 100% | Playwright CI results |
| Documentation completeness | All 22 user stories documented | Manual review |

---

## 8. Implementation Notes

### Phase 1: Core Infrastructure (Single Agent)
1. Port SQLite database schema to Supabase
2. Implement ATLAS-VM 7-step workflow
3. Single coding agent only (no orchestrator)
4. Basic WebSocket updates

### Phase 2: UI Parity
1. Kanban board + dependency graph
2. Spec creation chat
3. Feature expansion chat
4. Assistant chat
5. Debug panel + terminal

### Phase 3: Polish
1. Themes and keyboard shortcuts
2. Celebration effects and sounds
3. Schedule management
4. Documentation system

### Phase 4: Multi-Agent (Future)
1. Parallel orchestrator
2. Mission control dashboard
3. Agent mascots and activity feed
4. Batch processing

---

## 9. File Structure Mapping

### Reference → hex-ade
```
autocoder/
├── ui/                           → apps/web/
│   ├── src/components/           → src/components/
│   ├── src/hooks/                → src/hooks/
│   └── src/lib/                  → src/lib/
├── server/                       → server/
│   ├── routers/                  → routers/
│   ├── services/                 → services/
│   └── schemas.py                → schemas.py
├── api/database.py               → api/database.py (migrate to Supabase)
├── agent.py                      → agents/single_agent.py
├── parallel_orchestrator.py      → agents/orchestrator.py (Phase 4)
├── security.py                   → utils/security.py
├── mcp_server/feature_mcp.py     → mcp/feature_mcp.py
└── .claude/                      → .claude/
```

---

## 10. Migration Checklist

- [ ] Copy reference UI components to apps/web/src/components/
- [ ] Port backend routers to server/routers/
- [ ] Migrate SQLite schema to Supabase (api/database.py)
- [ ] Implement single agent workflow (agent.py)
- [ ] Port MCP feature server (mcp_server/feature_mcp.py)
- [ ] Copy WebSocket handler (server/websocket.py)
- [ ] Port security.py command allowlist
- [ ] Copy .claude/ templates and commands
- [ ] Update environment variables (Supabase credentials)
- [ ] Configure Vercel deployment (apps/web/)
- [ ] Configure Render backend deployment (server/)
- [ ] Write E2E tests (Playwright)
- [ ] Document all 22 user stories in WBS

---

## Appendix A: Reference Component Inventory

### UI Components (44 total)
```
AddFeatureForm.tsx          - Manual feature creation
ActivityFeed.tsx            - Agent event timeline
AgentAvatar.tsx             - Mascot images
AgentCard.tsx               - Mission control agent cards
AgentControl.tsx            - Start/pause/stop buttons
AgentMissionControl.tsx     - Multi-agent dashboard
AssistantChat.tsx           - Chat UI component
AssistantFAB.tsx            - Floating action button
AssistantPanel.tsx          - Slide-in chat panel
CelebrationOverlay.tsx      - Confetti animation
ChatMessage.tsx             - Single chat bubble
ConfirmDialog.tsx           - Reusable confirmation
ConversationHistory.tsx     - Past chat list
DebugLogViewer.tsx          - Bottom panel with tabs
DependencyBadge.tsx         - Feature dependency indicator
DependencyGraph.tsx         - D3.js force graph
DevServerControl.tsx        - Start/stop dev server
EditFeatureForm.tsx         - Edit feature modal
ExpandProjectChat.tsx       - AI expansion chat
ExpandProjectModal.tsx      - Expansion modal wrapper
FeatureCard.tsx             - Kanban card
FeatureModal.tsx            - Feature detail modal
FolderBrowser.tsx           - Directory tree
KanbanBoard.tsx             - Three-column layout
KanbanColumn.tsx            - Single column
KeyboardShortcutsHelp.tsx   - Help modal
NewProjectModal.tsx         - Create project form
OrchestratorAvatar.tsx      - Orchestrator icon
OrchestratorStatusCard.tsx  - Orchestrator state
ProgressDashboard.tsx       - Metrics display
ProjectSelector.tsx         - Dropdown + create button
ProjectSetupRequired.tsx    - Empty state prompt
QuestionOptions.tsx         - Multi/single select
ResetProjectModal.tsx       - Reset confirmation
ScheduleModal.tsx           - Schedule CRUD
SetupWizard.tsx             - Onboarding flow
SettingsModal.tsx           - Settings form
SpecCreationChat.tsx        - Full-screen spec chat
Terminal.tsx                - xterm.js component
TerminalTabs.tsx            - Tab management
ThemeSelector.tsx           - Theme dropdown
TypingIndicator.tsx         - "Claude is typing..."
ViewToggle.tsx              - Kanban/Graph toggle
DocsPage.tsx + 10 sections  - Documentation
```

### Backend Routers (10 total)
```
agent.py                - Start/pause/stop agent
assistant_chat.py       - WebSocket + REST for assistant
devserver.py            - Dev server management
expand_project.py       - WebSocket for feature expansion
features.py             - Feature CRUD + graph endpoint
filesystem.py           - Directory browsing
projects.py             - Project CRUD
schedules.py            - Schedule CRUD
settings.py             - Settings CRUD
spec_creation.py        - WebSocket for spec chat
terminal.py             - WebSocket PTY
```

---

**END OF PRD**
