# OC: Phase 2 UI Component Build (OPTION A)
**Date**: 2026-02-06  
**Agent**: OpenCode (Claude)  
**Duration**: 14 hours (4 components × 3.5h average)  
**Priority**: HIGH (unblocks user-facing features)  

---

## Mission
Build 4 priority P0 UI components to achieve 80% feature parity with reference design. These components will integrate with existing hooks and backend APIs.

## Current State
- ✅ All hooks implemented (useSpecChat, useExpandChat, useAssistantChat, useWebSocket)
- ✅ All types defined in `apps/web/src/lib/types.ts`
- ✅ Backend APIs operational (40+ endpoints)
- ❌ 0 of 16 modal/panel components exist (need to be built)

## Success Criteria
- [ ] NewProjectModal: Users can create projects with name + description
- [ ] SpecCreationChat: Interactive spec creation via Claude with real-time updates
- [ ] AgentControl: Users can start/stop autonomous agents
- [ ] AgentMissionControl: Users can see multiple agents + their progress
- [ ] All components responsive (mobile + desktop)
- [ ] Zero TypeScript errors
- [ ] Keyboard navigation functional
- [ ] E2E tests passing for each component

---

## Component Build Order (Estimated Hours)

### P0 Components (Week 1) - Critical Path

#### 1. NewProjectModal (4 hours)
**Location**: `apps/web/src/components/NewProjectModal.tsx`
**Figma/Reference**: HDS wireframe Section 2.1

**Specifications**:
```typescript
interface NewProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (project: Project) => void;
}

interface ProjectFormData {
  name: string;
  description: string;
  framework?: 'nextjs' | 'react' | 'vue' | 'svelte';
  targetArchitecture?: string;
}
```

**Features**:
- Text input: Project name (required, max 100 chars)
- Textarea: Project description (optional, max 500 chars)
- Dropdown: Framework selection (Next.js default)
- Button: "Create Project" (disabled until name filled)
- Error handling: Duplicate name, API errors
- Loading state: Spinner during submission

**Integration**:
- Uses `POST /api/projects` endpoint
- Triggers `onCreated` callback on success
- Validates with Zod schema from backend

**Testing**:
- Unit: Form validation, error states
- E2E: Create project, verify in project list

**Acceptance Criteria**:
- [ ] Modal renders when `open=true`
- [ ] Closes on X button or outside click
- [ ] Form validation prevents submission
- [ ] API error displays user-friendly message
- [ ] Success closes modal and calls callback

---

#### 2. SpecCreationChat (5 hours)
**Location**: `apps/web/src/components/SpecCreationChat.tsx`
**Figma/Reference**: HDS wireframe Section 3.1

**Specifications**:
```typescript
interface SpecCreationChatProps {
  projectId: string;
  onSpecCreated: (spec: ProjectSpec) => void;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
```

**Features**:
- Chat history display (scrollable, auto-scroll to bottom)
- Input field: User questions about spec
- Send button: Submits message via WebSocket
- Real-time response streaming from Claude
- Spec preview pane: Shows structured spec as it builds
- Save button: Commits spec to project

**Integration**:
- Uses `useSpecChat` hook (already implemented)
- WebSocket: `/ws/spec/{projectId}`
- POST `/api/features` to save features

**Testing**:
- Unit: Message formatting, timestamp handling
- E2E: Send message, receive response, save spec

**Acceptance Criteria**:
- [ ] Chat connects via WebSocket
- [ ] Messages display in real-time
- [ ] Spec preview updates as messages arrive
- [ ] Save button creates features in backend
- [ ] Smooth streaming animation

---

#### 3. AgentControl (2 hours)
**Location**: `apps/web/src/components/AgentControl.tsx`
**Figma/Reference**: HDS wireframe Section 4.1

**Specifications**:
```typescript
interface AgentControlProps {
  projectId: string;
  agentType: 'autonomousAgent' | 'specAgent' | 'testAgent';
}

interface AgentStatus {
  agentId: string;
  status: 'idle' | 'running' | 'paused' | 'error';
  progress: number;
  currentTask: string;
}
```

**Features**:
- Status indicator: Green (running), Gray (idle), Red (error)
- Start button: Begins agent execution
- Stop button: Gracefully stops agent
- Pause button: Pauses execution (if running)
- Progress bar: Shows % complete
- Logs pane: Real-time agent output

**Integration**:
- POST `/api/agents/{agentId}/start`
- POST `/api/agents/{agentId}/stop`
- WebSocket: `/ws/agent/{agentId}` for real-time updates

**Testing**:
- Unit: Button enable/disable logic
- E2E: Start agent, verify status changes

**Acceptance Criteria**:
- [ ] Buttons enable/disable based on status
- [ ] Status updates in real-time
- [ ] Stop kills agent gracefully
- [ ] Progress bar animates

---

#### 4. AgentMissionControl (3 hours)
**Location**: `apps/web/src/components/AgentMissionControl.tsx`
**Figma/Reference**: HDS wireframe Section 4.2

**Specifications**:
```typescript
interface MissionControlProps {
  projectId: string;
}

interface AgentCard {
  agentId: string;
  name: string;
  type: string;
  status: AgentStatus;
  progress: number;
  lastUpdate: Date;
  actions: 'start' | 'stop' | 'pause';
}
```

**Features**:
- Agent grid: Shows all agents for project
- Each agent card displays:
  - Name + type badge
  - Status indicator + percentage complete
  - Last update timestamp
  - Action buttons (Start/Stop/Pause)
- Summary stats: X agents running, Y completed
- Logs consolidation: Combined logs from all agents

**Integration**:
- GET `/api/agents?projectId={id}` (list agents)
- WebSocket: `/ws/agents/{projectId}` (all agent updates)

**Testing**:
- Unit: Grid layout, sorting
- E2E: Multiple agents, verify updates sync

**Acceptance Criteria**:
- [ ] All agents display in grid
- [ ] Status updates real-time
- [ ] Multiple agents can run simultaneously
- [ ] Logs consolidate without duplicates

---

## P1 Components (Week 2) - High Impact
*To be built after P0 if time allows*

- ScheduleModal: Configure automated agent runs
- SettingsModal: Project preferences, API keys
- AssistantPanel: Persistent chat for questions
- FeedbackPanel: Collect user feedback on features
- ExpandProjectModal: Expand project scope interactively
- FeatureModal: Edit/delete features
- KeyboardHelp: Show keyboard shortcuts
- DependencyGraph: Visualize feature dependencies

---

## Build Workflow

### For Each Component:

1. **Create TSX file** in `apps/web/src/components/`
2. **Define Props interface** at top of file
3. **Implement component** with:
   - MUI components for structure
   - Tailwind for styling
   - Proper error boundaries
   - Loading states
4. **Add TypeScript exports** to `index.ts`
5. **Create unit tests** in `src/components/__tests__/`
6. **Create E2E tests** in `tests/e2e/`
7. **Test locally** with `pnpm dev`
8. **Run type checking**: `pnpm type-check`
9. **Lint code**: `pnpm lint`

### Code Style Guidelines

**Imports** (top of file):
```typescript
import type { FC } from 'react';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useSpecChat } from '@/hooks/useSpecChat';
import { Project } from '@/lib/types';
```

**Component Pattern**:
```typescript
interface ComponentProps {
  prop1: string;
  onEvent: (data: Data) => void;
}

export const ComponentName: FC<ComponentProps> = ({ prop1, onEvent }) => {
  const [state, setState] = useState(null);
  
  return (
    <Box className="component-class">
      {/* JSX */}
    </Box>
  );
};
```

**Styling**:
- Use MUI components (Button, TextField, Dialog, etc.)
- Add Tailwind for spacing/margins: `className="p-4 mb-2"`
- Use MUI `sx` prop for dynamic styles
- Mobile-first responsive design

**Error Handling**:
```typescript
if (!projectId) {
  return <div>Error: No project selected</div>;
}

try {
  await api.createProject(data);
} catch (error) {
  setError((error as Error).message);
}
```

---

## Integration Checklist

After building each component:

- [ ] Component renders without errors
- [ ] Props are properly typed
- [ ] Component uses correct hooks/APIs
- [ ] Loading states display correctly
- [ ] Error states display user-friendly messages
- [ ] Responsive design tested (mobile + desktop)
- [ ] Keyboard navigation works
- [ ] TypeScript strict mode passes
- [ ] ESLint passes
- [ ] Unit tests pass (>80% coverage)
- [ ] E2E tests pass

---

## API Endpoints Reference

```
GET    /api/projects              # List projects
POST   /api/projects              # Create project
GET    /api/projects/{id}         # Get project
PUT    /api/projects/{id}         # Update project
DELETE /api/projects/{id}         # Delete project

POST   /api/features              # Create features
GET    /api/features?projectId=   # List features
PUT    /api/features/{id}         # Update feature
DELETE /api/features/{id}         # Delete feature

GET    /api/agents                # List agents
POST   /api/agents/{id}/start     # Start agent
POST   /api/agents/{id}/stop      # Stop agent

WS     /ws/spec/{projectId}       # Spec chat
WS     /ws/expand/{projectId}     # Project expansion
WS     /ws/assistant              # Assistant chat
WS     /ws/agent/{agentId}        # Agent updates
```

---

## Parallel Execution Notes
- **GC Flash** configures WebSocket infrastructure simultaneously
- **CC** sets up E2E test infrastructure
- **No blocking dependencies** - all teams work independently
- Merge PRs after QA passes

---

## Timeline Estimate
- NewProjectModal: 4 hours
- SpecCreationChat: 5 hours
- AgentControl: 2 hours
- AgentMissionControl: 3 hours
- **Subtotal P0**: 14 hours
- **QA/Testing**: 2 hours
- **PR/Review**: 1 hour
- **Total**: ~17 hours

---

## Testing Strategy

### Unit Tests (Vitest)
```bash
pnpm test:unit -- --coverage
# Target: >80% coverage for components
```

### E2E Tests (Playwright)
```bash
pnpm test:e2e
# Run: component load, user interactions, API calls
```

### Manual Testing
- Local dev server: `pnpm dev`
- Test on both mobile + desktop viewport
- Verify WebSocket works (once GC sets up subdomain)

---

## Rollback Plan
If a component breaks the build:
1. Check TypeScript errors: `pnpm type-check`
2. Check lint errors: `pnpm lint`
3. Revert component file: `git checkout apps/web/src/components/Component.tsx`
4. Re-run build: `pnpm build`

---

## Success Metrics
| Component | Status | Tests | E2E |
|-----------|--------|-------|-----|
| NewProjectModal | 🔄 | 🔄 | 🔄 |
| SpecCreationChat | 🔄 | 🔄 | 🔄 |
| AgentControl | 🔄 | 🔄 | 🔄 |
| AgentMissionControl | 🔄 | 🔄 | 🔄 |

---

## Questions? Next Steps?
1. Start with NewProjectModal (simplest)
2. Move to SpecCreationChat (highest value)
3. Build AgentControl + MissionControl in parallel
4. Report progress every 2-3 components
5. When ready: Run Qodana + Cubic analysis
6. Create PRs and engage sweeper for final cleanup
