# Detailed Implementation Mapping - Reference to hex-ade

**Purpose:** Line-by-line code mapping for implementing missing features

---

## MAPPING 1: WebSocket Message Types Enhancement

### Current hex-ade (useWebSocket.ts)
**Status:** PARTIAL - Missing orchestrator support

**Current Message Types Handled:**
- `progress`
- `log`
- `agent_status`

**Missing in hex-ade:**
- `agent_update` (detailed per-agent state)
- `orchestrator_update` (multi-agent coordination)
- `feature_update` (feature completion triggers)

### Required Changes to types.ts

**ADD:** (After line ~180 in hex-ade types.ts)

```typescript
// ============================================================================
// Agent State (Multi-Agent Support)
// ============================================================================

export type AgentState = 'idle' | 'thinking' | 'working' | 'testing' | 'success' | 'error' | 'struggling'
export type AgentType = 'coding' | 'testing'

export interface ActiveAgent {
  agentIndex: number              // -1 for synthetic completions
  agentName: AgentMascot | 'Unknown'
  agentType: AgentType            // "coding" or "testing"
  featureId: number               // Current/primary feature
  featureIds: number[]            // All features in batch
  featureName: string
  state: AgentState
  thought?: string                // Agent thinking for activity feed
  timestamp: string
  logs?: AgentLogEntry[]          // Per-agent log history
}

export interface AgentLogEntry {
  line: string
  timestamp: string
  type: 'output' | 'state_change' | 'error'
}

export const AGENT_MASCOTS = [
  'Spark', 'Fizz', 'Octo', 'Hoot', 'Buzz',
  'Pixel', 'Byte', 'Nova', 'Chip', 'Bolt',
  'Dash', 'Zap', 'Gizmo', 'Turbo', 'Blip',
  'Neon', 'Widget', 'Zippy', 'Quirk', 'Flux',
] as const
export type AgentMascot = typeof AGENT_MASCOTS[number]

// ============================================================================
// Orchestrator (Multi-Agent Coordination)
// ============================================================================

export type OrchestratorState =
  | 'idle'
  | 'initializing'
  | 'scheduling'
  | 'spawning'
  | 'monitoring'
  | 'complete'

export interface OrchestratorEvent {
  eventType: string
  message: string
  timestamp: string
  featureId?: number
  featureName?: string
}

export interface OrchestratorStatus {
  state: OrchestratorState
  message: string
  codingAgents: number
  testingAgents: number
  maxConcurrency: number
  readyCount: number              // Ready to execute
  blockedCount: number            // Blocked by dependencies
  timestamp: string
  recentEvents: OrchestratorEvent[]
}

// ============================================================================
// WebSocket Messages (Extended)
// ============================================================================

export interface WSAgentUpdateMessage {
  type: 'agent_update'
  agentIndex: number              // -1 for synthetic completions
  agentName: AgentMascot | 'Unknown'
  agentType: AgentType            // "coding" or "testing"
  featureId: number
  featureIds?: number[]           // All features in batch
  featureName: string
  state: AgentState
  thought?: string
  timestamp: string
  synthetic?: boolean             // True for synthetic completions
}

export interface WSOrchestratorUpdateMessage {
  type: 'orchestrator_update'
  eventType: string
  state: OrchestratorState
  message: string
  timestamp: string
  codingAgents?: number
  testingAgents?: number
  maxConcurrency?: number
  readyCount?: number
  blockedCount?: number
  featureId?: number
  featureName?: string
}

export interface WSFeatureUpdateMessage {
  type: 'feature_update'
  feature_id: number
  passes: boolean
}

// Add to WSMessage union:
export type WSMessage =
  | WSProgressMessage
  | WSFeatureUpdateMessage          // NEW
  | WSLogMessage
  | WSAgentStatusMessage
  | WSAgentUpdateMessage            // NEW
  | WSPongMessage
  | WSDevLogMessage
  | WSDevServerStatusMessage
  | WSOrchestratorUpdateMessage     // NEW
```

---

## MAPPING 2: useWebSocket.ts Enhancement

### Reference Implementation Structure
**File:** `/home/kellyb_dev/projects/hex-rag-dss/_reference/autocoder/ui/src/hooks/useWebSocket.ts` (479 lines)

### Key Sections to Add to hex-ade

#### A. Extended WebSocketState Interface

```typescript
interface WebSocketState {
  progress: {
    passing: number
    in_progress: number
    total: number
    percentage: number
  }
  agentStatus: AgentStatus
  logs: Array<{ line: string; timestamp: string; featureId?: number; agentIndex?: number }>
  isConnected: boolean
  devServerStatus: DevServerStatus
  devServerUrl: string | null
  devLogs: Array<{ line: string; timestamp: string }>

  // ADDITIONS:
  activeAgents: ActiveAgent[]                           // NEW: Multi-agent support
  recentActivity: ActivityItem[]                        // NEW: Agent thoughts feed
  agentLogs: Map<number, AgentLogEntry[]>              // NEW: Per-agent logging
  celebrationQueue: CelebrationTrigger[]               // NEW: Celebration queue
  celebration: CelebrationTrigger | null               // NEW: Current celebration
  orchestratorStatus: OrchestratorStatus | null        // NEW: Orchestrator state
}

interface ActivityItem {                               // NEW
  agentName: string
  thought: string
  timestamp: string
  featureId: number
}

interface CelebrationTrigger {                         // NEW
  agentName: AgentMascot | 'Unknown'
  featureName: string
  featureId: number
}
```

#### B. Message Handlers to Add

**In `ws.onmessage` switch statement:**

```typescript
case 'feature_update':
  // Feature updates will trigger a refetch via React Query
  break

case 'agent_update':
  setState(prev => {
    // Log state change to per-agent logs
    const newAgentLogs = new Map(prev.agentLogs)
    const existingLogs = newAgentLogs.get(message.agentIndex) || []
    const stateLogEntry: AgentLogEntry = {
      line: `[STATE] ${message.state}${message.thought ? `: ${message.thought}` : ''}`,
      timestamp: message.timestamp,
      type: message.state === 'error' ? 'error' : 'state_change',
    }
    newAgentLogs.set(
      message.agentIndex,
      [...existingLogs.slice(-500 + 1), stateLogEntry]  // Keep last 500 logs
    )

    // Update or add the agent in activeAgents
    const existingAgentIdx = prev.activeAgents.findIndex(
      a => a.agentIndex === message.agentIndex
    )

    let newAgents: ActiveAgent[]
    if (message.state === 'success' || message.state === 'error') {
      // Remove agent from active list on completion
      if (message.agentIndex === -1) {
        newAgents = prev.activeAgents.filter(a => a.featureId !== message.featureId)
      } else {
        newAgents = prev.activeAgents.filter(a => a.agentIndex !== message.agentIndex)
      }
    } else if (existingAgentIdx >= 0) {
      // Update existing agent
      newAgents = [...prev.activeAgents]
      newAgents[existingAgentIdx] = {
        agentIndex: message.agentIndex,
        agentName: message.agentName,
        agentType: message.agentType || 'coding',
        featureId: message.featureId,
        featureIds: message.featureIds || [message.featureId],
        featureName: message.featureName,
        state: message.state,
        thought: message.thought,
        timestamp: message.timestamp,
        logs: newAgentLogs.get(message.agentIndex) || [],
      }
    } else {
      // Add new agent
      newAgents = [
        ...prev.activeAgents,
        {
          agentIndex: message.agentIndex,
          agentName: message.agentName,
          agentType: message.agentType || 'coding',
          featureId: message.featureId,
          featureIds: message.featureIds || [message.featureId],
          featureName: message.featureName,
          state: message.state,
          thought: message.thought,
          timestamp: message.timestamp,
          logs: newAgentLogs.get(message.agentIndex) || [],
        },
      ]
    }

    // Add to activity feed if there's a thought
    let newActivity = prev.recentActivity
    if (message.thought) {
      newActivity = [
        {
          agentName: message.agentName,
          thought: message.thought,
          timestamp: message.timestamp,
          featureId: message.featureId,
        },
        ...prev.recentActivity.slice(0, 19),  // Keep last 20
      ]
    }

    // Handle celebration queue on success
    let newCelebrationQueue = prev.celebrationQueue
    let newCelebration = prev.celebration

    if (message.state === 'success') {
      const newCelebrationItem: CelebrationTrigger = {
        agentName: message.agentName,
        featureName: message.featureName,
        featureId: message.featureId,
      }

      if (!prev.celebration) {
        newCelebration = newCelebrationItem
      } else {
        newCelebrationQueue = [...prev.celebrationQueue, newCelebrationItem]
      }
    }

    return {
      ...prev,
      activeAgents: newAgents,
      agentLogs: newAgentLogs,
      recentActivity: newActivity,
      celebrationQueue: newCelebrationQueue,
      celebration: newCelebration,
    }
  })
  break

case 'orchestrator_update':
  setState(prev => {
    const newEvent: OrchestratorEvent = {
      eventType: message.eventType,
      message: message.message,
      timestamp: message.timestamp,
      featureId: message.featureId,
      featureName: message.featureName,
    }

    return {
      ...prev,
      orchestratorStatus: {
        state: message.state,
        message: message.message,
        codingAgents: message.codingAgents ?? prev.orchestratorStatus?.codingAgents ?? 0,
        testingAgents: message.testingAgents ?? prev.orchestratorStatus?.testingAgents ?? 0,
        maxConcurrency: message.maxConcurrency ?? prev.orchestratorStatus?.maxConcurrency ?? 3,
        readyCount: message.readyCount ?? prev.orchestratorStatus?.readyCount ?? 0,
        blockedCount: message.blockedCount ?? prev.orchestratorStatus?.blockedCount ?? 0,
        timestamp: message.timestamp,
        recentEvents: [newEvent, ...(prev.orchestratorStatus?.recentEvents ?? []).slice(0, 4)],
      },
    }
  })
  break

case 'agent_status':
  setState(prev => ({
    ...prev,
    agentStatus: message.status,
    // Clear active agents and orchestrator status when process stops or crashes
    ...((message.status === 'stopped' || message.status === 'crashed') && {
      activeAgents: [],
      recentActivity: [],
      orchestratorStatus: null,
    }),
  }))
  break
```

#### C. New Functions to Add

```typescript
// Stale agent cleanup (add to useEffect)
useEffect(() => {
  const STALE_THRESHOLD_MS = 30 * 60 * 1000  // 30 minutes

  const cleanup = setInterval(() => {
    setState(prev => {
      const now = Date.now()
      const fresh = prev.activeAgents.filter(a =>
        now - new Date(a.timestamp).getTime() < STALE_THRESHOLD_MS
      )
      if (fresh.length !== prev.activeAgents.length) {
        return { ...prev, activeAgents: fresh }
      }
      return prev
    })
  }, 60000)  // Check every minute

  return () => clearInterval(cleanup)
}, [])

// Clear celebration and show next from queue
const clearCelebration = useCallback(() => {
  setState(prev => {
    const [nextCelebration, ...remainingQueue] = prev.celebrationQueue
    return {
      ...prev,
      celebration: nextCelebration || null,
      celebrationQueue: remainingQueue,
    }
  })
}, [])

// Get logs for specific agent (for debugging)
const getAgentLogs = useCallback((agentIndex: number): AgentLogEntry[] => {
  return state.agentLogs.get(agentIndex) || []
}, [state.agentLogs])

// Clear logs for specific agent
const clearAgentLogs = useCallback((agentIndex: number) => {
  setState(prev => {
    const newAgentLogs = new Map(prev.agentLogs)
    newAgentLogs.delete(agentIndex)
    return { ...prev, agentLogs: newAgentLogs }
  })
}, [])
```

---

## MAPPING 3: New Components to Create

### 1. AgentMissionControl.tsx

**Reference:** `/home/kellyb_dev/projects/hex-rag-dss/_reference/autocoder/ui/src/components/AgentMissionControl.tsx` (150+ lines)

**Location in hex-ade:** `/home/kellyb_dev/projects/hex-ade/apps/web/src/components/AgentMissionControl.tsx`

**Key Props:**
```typescript
interface AgentMissionControlProps {
  agents: ActiveAgent[]
  orchestratorStatus: OrchestratorStatus | null
  recentActivity: Array<{
    agentName: string
    thought: string
    timestamp: string
    featureId: number
  }>
  getAgentLogs?: (agentIndex: number) => AgentLogEntry[]
}
```

**Render Structure:**
```
Card (p-0)
  ├─ Button (header - collapsible)
  │  ├─ Rocket icon
  │  ├─ "Mission Control" text
  │  ├─ Badge showing active agent count / status
  │  └─ ChevronUp/Down toggle icon
  │
  ├─ [IF expanded]
  │  ├─ OrchestratorStatusCard
  │  │  ├─ State: {state}
  │  │  ├─ Metrics: codingAgents, testingAgents
  │  │  ├─ Counts: readyCount, blockedCount
  │  │  └─ Recent events (last 5)
  │  │
  │  ├─ Grid of AgentCard components (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
  │  │  └─ For each agent in activeAgents[]
  │  │     ├─ Avatar with agent mascot
  │  │     ├─ Agent name + type
  │  │     ├─ Current feature
  │  │     ├─ State indicator (thinking/working/success/error)
  │  │     ├─ Agent thought (if available)
  │  │     └─ "View Logs" button
  │  │
  │  ├─ Divider
  │  │
  │  └─ ActivityFeed
  │     └─ For each item in recentActivity[]
  │        ├─ Agent avatar
  │        ├─ Agent name
  │        ├─ Thought text
  │        └─ Timestamp
```

### 2. AgentCard.tsx

**Purpose:** Show individual agent state with detailed logs

**Key Features:**
- Agent avatar (using agent mascot)
- Agent name, type (coding/testing)
- Feature ID + name
- State indicator (color-coded)
- Thought display
- "View Logs" button → Modal with per-agent logs

**Structure:**
```typescript
interface AgentCardProps {
  agent: ActiveAgent
  onViewLogs?: (agent: ActiveAgent) => void
}

// State colors:
// idle: gray
// thinking: yellow
// working: blue
// testing: purple
// success: green
// error: red
// struggling: orange
```

### 3. OrchestratorStatusCard.tsx

**Purpose:** Show orchestrator state and metrics

**Display:**
```
┌─────────────────────────────────┐
│ State: Monitoring               │
│ Ready: 3 | Blocked: 2           │
│ Coding: 2 | Testing: 1          │
│ Max Concurrency: 3              │
│                                 │
│ Recent Events:                  │
│ • feature_scheduled: #42        │
│ • agent_spawned: Spark          │
│ • batch_assigned: 2 features    │
│ • agent_succeeded: Fizz         │
│ • feature_completed: #43        │
└─────────────────────────────────┘
```

### 4. ActivityFeed.tsx

**Purpose:** Show recent agent thoughts/activity

**Display:**
- Scrollable list of activity items
- Most recent first
- Avatar + agent name
- Agent thought (up to 2 lines)
- Relative timestamp (e.g., "2 seconds ago")
- Max 20 items kept

---

## MAPPING 4: Spec Creation Chat System

### Components to Create

#### 1. SpecCreationChat.tsx (MAIN)

**Reference:** `/home/kellyb_dev/projects/hex-rag-dss/_reference/autocoder/ui/src/components/SpecCreationChat.tsx` (300+ lines)

**Location:** `/home/kellyb_dev/projects/hex-ade/apps/web/src/components/SpecCreationChat.tsx`

**Key Props:**
```typescript
interface SpecCreationChatProps {
  projectName: string
  onComplete: (specPath: string, yoloMode?: boolean) => void
  onCancel: () => void
  onExitToProject: () => void
  initializerStatus?: 'idle' | 'starting' | 'error'
  initializerError?: string | null
  onRetryInitializer?: () => void
}
```

**Render Structure:**
```
FullScreen (fixed inset-0 z-50)
  ├─ Header (sticky)
  │  ├─ "Create App Specification" title
  │  ├─ Connection status indicator
  │  └─ Close button (X)
  │
  ├─ Chat messages area
  │  ├─ Scrollable container (max-h-[calc(100vh-240px)])
  │  ├─ System welcome message
  │  ├─ User messages (right-aligned)
  │  ├─ Assistant messages (left-aligned)
  │  ├─ Question UI (when type === 'question')
  │  ├─ File written confirmation
  │  ├─ Completion card
  │  └─ TypingIndicator (when assistant thinking)
  │
  ├─ Input area (sticky bottom)
  │  ├─ Textarea for user input
  │  ├─ File attachment button
  │  ├─ Send button
  │  └─ yolo_mode toggle checkbox
  │
  └─ Status overlay (if initializing)
     └─ "Starting agent..." + spinner
```

**Key Behaviors:**
- Auto-scroll to latest message
- Ctrl+Enter or Cmd+Enter sends message
- Image attachment support (5MB max, JPEG/PNG)
- File selection retry on error
- Show spec path when ready
- Display questions as multi-choice UI
- Handle file_written confirmations

#### 2. useSpecChat.ts Hook

**Purpose:** Manage WebSocket connection to /ws/spec/{projectName}

**Returns:**
```typescript
{
  messages: ChatMessage[]
  isLoading: boolean
  isComplete: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  currentQuestions: SpecQuestion[] | null
  start: () => void
  sendMessage: (content: string, attachments?: ImageAttachment[]) => void
  sendAnswer: (toolId: string, answers: string[]) => void
  cancel: () => void
  error: string | null
}
```

**State Management:**
```typescript
const [messages, setMessages] = useState<ChatMessage[]>([])
const [isLoading, setIsLoading] = useState(false)
const [isComplete, setIsComplete] = useState(false)
const [connectionStatus, setConnectionStatus] = useState('connecting')
const [currentQuestions, setCurrentQuestions] = useState<SpecQuestion[] | null>(null)

// WebSocket message handlers:
// - 'text': Add to messages
// - 'question': Store questions + prompt user
// - 'spec_complete': Set isComplete = true
// - 'file_written': Show confirmation
// - 'error': Display error
// - 'response_done': Mark assistant response as complete
```

#### 3. ChatMessage.tsx

**Purpose:** Render individual chat message with markdown support

**Features:**
- Markdown rendering (use `react-markdown`)
- Code syntax highlighting (use `react-syntax-highlighter`)
- Avatar based on role (user/assistant/system)
- Timestamp
- Optional attachment display

#### 4. QuestionOptions.tsx

**Purpose:** Display multi-choice question UI

**Render:**
```
Card
  ├─ Question header
  ├─ Question text
  ├─ Options list
  │  └─ Checkbox or radio for each option
  │     ├─ Option label
  │     └─ Option description
  └─ Buttons
     ├─ "Back" button
     └─ "Continue" button (disabled until selection)
```

#### 5. TypingIndicator.tsx

**Purpose:** Show "Claude is typing..." animation

**Display:**
- Animated dots: ● ○ ○ → ○ ● ○ → ○ ○ ●

---

## MAPPING 5: Dependency Graph Visualization

### DependencyGraph.tsx

**Reference:** `/home/kellyb_dev/projects/hex-rag-dss/_reference/autocoder/ui/src/components/DependencyGraph.tsx`

**Library Options:**
- Option A: D3.js (powerful, complex)
- Option B: Vis.js (simpler, suitable for this use case)
- Option C: React Flow (React-friendly)

**Recommendation:** Vis.js for simplicity

**Installation:**
```bash
cd apps/web
npm install vis-network
```

**Props:**
```typescript
interface DependencyGraphProps {
  graphData: DependencyGraph
  onNodeClick: (nodeId: number) => void
  activeAgents?: ActiveAgent[]
}
```

**Render:**
```
Canvas container
  ├─ Vis.js network visualization
  ├─ Zoom controls
  ├─ Legend (color meanings)
  └─ Export button (optional)

Node styling by status:
  - pending: gray border, light fill
  - in_progress: blue border, blue fill
  - done: green border, green fill
  - blocked: red border, red fill, dashed

Edge styling:
  - Solid line for dependency
  - Color matches target node status
```

**Event Handling:**
```typescript
// On node click
network.on('click', (event) => {
  if (event.nodes.length > 0) {
    onNodeClick(event.nodes[0])  // First clicked node
  }
})
```

### ViewToggle.tsx

**Purpose:** Switch between Kanban and Graph views

**Props:**
```typescript
interface ViewToggleProps {
  viewMode: 'kanban' | 'graph'
  onViewModeChange: (mode: 'kanban' | 'graph') => void
}
```

**Render:**
```
ButtonGroup (two buttons)
  ├─ Button "Kanban" (active when viewMode === 'kanban')
  └─ Button "Graph" (active when viewMode === 'graph')
```

**Storage:**
```typescript
const VIEW_MODE_KEY = 'autocoder-view-mode'

// Persist to localStorage on change
useEffect(() => {
  localStorage.setItem(VIEW_MODE_KEY, viewMode)
}, [viewMode])
```

---

## MAPPING 6: App.tsx Integration

### Changes Required

```typescript
// 1. Add new state variables (line ~70)
const [viewMode, setViewMode] = useState<'kanban' | 'graph'>(() => {
  try {
    const stored = localStorage.getItem('autocoder-view-mode')
    return (stored === 'graph' ? 'graph' : 'kanban') as ViewMode
  } catch {
    return 'kanban'
  }
})

// 2. Update useProjectWebSocket return destructuring (line ~83)
const wsState = useProjectWebSocket(selectedProject)
// Now includes:
//   - activeAgents: ActiveAgent[]
//   - orchestratorStatus: OrchestratorStatus | null
//   - recentActivity: ActivityItem[]
//   - clearCelebration: () => void
//   - getAgentLogs: (agentIndex: number) => AgentLogEntry[]

// 3. Fetch dependency graph (line ~91)
const { data: graphData } = useQuery({
  queryKey: ['dependencyGraph', selectedProject],
  queryFn: () => getDependencyGraph(selectedProject!),
  enabled: !!selectedProject && viewMode === 'graph',
  refetchInterval: 5000,
})

// 4. Add keyboard shortcuts (enhance existing switch statement, line ~154)
// Add:
// - G/g: Toggle view mode
// - E/e: Expand project
// - A/a: Toggle assistant
// - T/t: Terminal tab
// - ?: Keyboard help
// - R/r: Reset project

// 5. Render AgentMissionControl (after ProgressDashboard, line ~407)
<AgentMissionControl
  agents={wsState.activeAgents}
  orchestratorStatus={wsState.orchestratorStatus}
  recentActivity={wsState.recentActivity}
  getAgentLogs={wsState.getAgentLogs}
/>

// 6. Add view toggle UI (line ~436)
{features && (features.pending.length + features.in_progress.length + features.done.length) > 0 && (
  <div className="flex justify-center">
    <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
  </div>
)}

// 7. Conditional rendering for Kanban vs Graph (line ~443)
{viewMode === 'kanban' ? (
  <KanbanBoard
    features={features}
    onFeatureClick={setSelectedFeature}
    onAddFeature={() => setShowAddFeature(true)}
    onExpandProject={() => setShowExpandProject(true)}
    activeAgents={wsState.activeAgents}
    onCreateSpec={() => setShowSpecChat(true)}
    hasSpec={hasSpec}
  />
) : (
  <Card className="overflow-hidden" style={{ height: '600px' }}>
    {graphData ? (
      <DependencyGraph
        graphData={graphData}
        onNodeClick={handleGraphNodeClick}
        activeAgents={wsState.activeAgents}
      />
    ) : (
      <div className="h-full flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    )}
  </Card>
)}

// 8. Add celebration overlay (line ~589)
{wsState.celebration && (
  <CelebrationOverlay
    agentName={wsState.celebration.agentName}
    featureName={wsState.celebration.featureName}
    onComplete={wsState.clearCelebration}
  />
)}
```

---

## MAPPING 7: API Endpoints Required

### Backend Endpoints to Verify/Implement

**1. WebSocket Endpoints:**
```
✅ /ws/projects/{projectName}
   - Sends: progress, log, agent_status, feature_update
   - Need to add: agent_update, orchestrator_update

❌ /ws/spec/{projectName}
   - NEW - Stream spec creation progress
   - Sends: text, question, spec_complete, file_written, error, response_done

❌ /ws/assistant/{projectName}/{conversationId}
   - NEW - Stream assistant responses

❌ /ws/expand/{projectName}
   - NEW - Stream expand project progress
```

**2. REST Endpoints:**
```
✅ GET /api/projects/{name}/features/graph
   - Returns: DependencyGraph { nodes[], edges[] }

❌ GET /api/projects/{name}/dependencies
   - Get all dependencies for project

❌ POST /api/spec/start
   - Start spec creation session
   - Upgrade to WebSocket at /ws/spec/{projectName}
```

---

## MAPPING 8: Database Schema Changes

### For Persistent Assistant Chat

**Table: `assistant_conversations`**
```sql
CREATE TABLE assistant_conversations (
  id SERIAL PRIMARY KEY,
  project_name VARCHAR(255),
  title VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (project_name) REFERENCES projects(name)
)

CREATE TABLE assistant_messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER,
  role VARCHAR(20),  -- 'user' | 'assistant' | 'system'
  content TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (conversation_id) REFERENCES assistant_conversations(id)
)
```

### For Schedule Automation

**Table: `schedules`**
```sql
CREATE TABLE schedules (
  id SERIAL PRIMARY KEY,
  project_name VARCHAR(255),
  start_time VARCHAR(5),           -- "HH:MM"
  duration_minutes INTEGER,
  days_of_week INTEGER,            -- Bitfield
  enabled BOOLEAN DEFAULT true,
  yolo_mode BOOLEAN,
  model VARCHAR(255),
  max_concurrency INTEGER,
  crash_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (project_name) REFERENCES projects(name)
)
```

---

## MAPPING 9: TypeScript Type Migration

### From Reference types.ts to hex-ade

**COPY ENTIRE SECTIONS:**
- Lines 176-182: AGENT_MASCOTS constant
- Lines 184-241: Orchestrator types + agent types

**EXTEND EXISTING:**
- WSMessage union: Add `| WSAgentUpdateMessage | WSOrchestratorUpdateMessage | WSFeatureUpdateMessage`
- ActiveAgent interface (NEW)
- OrchestratorStatus interface (NEW)

**KEEP:** Everything else stays the same

---

## MAPPING 10: Package Dependencies

### Add to package.json

```json
{
  "dependencies": {
    "vis-network": "^9.1.2",           // For DependencyGraph
    "react-markdown": "^9.0.1",         // For ChatMessage markdown
    "react-syntax-highlighter": "^15.5.0", // For code blocks
    "uuid": "^9.0.1"                   // For message IDs
  },
  "devDependencies": {
    "@types/uuid": "^9.0.7"
  }
}
```

---

## SUMMARY: Implementation Order

1. **Step 1:** Update types.ts with all new type definitions (1 hour)
2. **Step 2:** Enhance useWebSocket.ts with orchestrator + agent_update handlers (2 hours)
3. **Step 3:** Create AgentCard.tsx, OrchestratorStatusCard.tsx, ActivityFeed.tsx (4 hours)
4. **Step 4:** Create AgentMissionControl.tsx wrapper (2 hours)
5. **Step 5:** Integrate Mission Control into App.tsx (1 hour)
6. **Step 6:** Create ChatMessage.tsx, QuestionOptions.tsx, TypingIndicator.tsx (3 hours)
7. **Step 7:** Implement useSpecChat hook (4 hours)
8. **Step 8:** Create SpecCreationChat.tsx main component (5 hours)
9. **Step 9:** Create DependencyGraph.tsx with Vis.js (5 hours)
10. **Step 10:** Create ViewToggle.tsx and integrate graph view (2 hours)
11. **Step 11:** Test full flow, fix bugs (2-3 hours)

**Total Estimated Time: 30-35 hours**

---

