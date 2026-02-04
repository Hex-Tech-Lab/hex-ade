# OC S1: Phase 2 - Mission Control Enhanced Dashboard (10x Task)

## OBJECTIVE
Build Mission Control dashboard enhancements: AgentMissionControl upgrade, MetricsBar real-time updates, DebugPanel with tabs, ScheduleModal, KeyboardHelp, SettingsModal.

## CURRENT STATE
- Phase 1: ✅ Complete (WebSocket infrastructure)
- AgentMissionControl: ✅ Exists (basic version)
- MetricsBar: ⚠️ Needs real-time updates
- DebugPanel: ⚠️ Needs tab support
- Modals: ❌ Missing (Schedule, Settings, KeyboardHelp)

## WBS Phase 2 Breakdown (16 components, 4 weeks target)

### P1 Priority (Week 1-2) - 14 hours
1. **AgentMissionControl Enhancement** (3h)
   - Upgrade to show real-time agent state
   - Add agent lifecycle visualization
   - Show resource usage (CPU, memory)
   - Display active tasks per agent

2. **MetricsBar Real-Time Updates** (1.5h)
   - Connect to useProjectWebSocket
   - Show live progress metrics
   - Display budget tracking (tokens used/remaining)
   - Real-time status badges

3. **DebugPanel Enhancement** (1.5h)
   - Add tab switching (Terminal, Logs, Performance)
   - Auto-scroll toggle
   - Filter by log level
   - Keyboard shortcuts (Tab, L for Logs, P for Performance)

4. **KeyboardHelp Component** (1h)
   - List all keyboard shortcuts
   - Modal triggered by '?'
   - Searchable shortcuts
   - Categorized by function

5. **SettingsModal** (1.5h)
   - User preferences (theme, font size, notifications)
   - Keyboard shortcut customization
   - WebSocket reconnection settings
   - Save to localStorage

6. **ScheduleModal** (2h)
   - Cron expression builder
   - Visual schedule preview
   - Timezone selection
   - Save schedule to project

7. **AssistantPanel Enhancement** (1.5h)
   - Show active conversations
   - Quick-access to spec/expand chats
   - Conversation history
   - Pin important messages

8. **FeedbackPanel Enhancement** (1h)
   - Real-time feedback from agents
   - Filter by type (error, warning, info, success)
   - Auto-dismiss after 5 seconds
   - Persistent history in DebugPanel

---

## TASK 1: AgentMissionControl Upgrade (3h)

### 1a. Enhance Component
**File**: `apps/web/src/components/AgentMissionControl.tsx`

**New Features**:
```typescript
interface AgentWithMetrics extends ActiveAgent {
  cpuUsage: number;        // 0-100%
  memoryUsage: number;     // MB
  tasksCompleted: number;
  currentTask: string;
  uptime: number;          // seconds
}

export interface MissionControlProps {
  agents: AgentWithMetrics[];
  orchestratorStatus: OrchestratorStatus;
  onAgentClick?: (agentId: string) => void;
  onPauseAll?: () => void;
  onResumeAll?: () => void;
}
```

**Components to Add**:
1. Agent list with real-time status cards
2. Resource usage gauges (CPU, memory)
3. Timeline of agent activities
4. Orchestrator control buttons (Pause All, Resume All)
5. Agent detail panel on click

### 1b. Connect WebSocket
```typescript
const { activeAgents, orchestratorStatus } = useProjectWebSocket(projectName);
const agentsWithMetrics = activeAgents.map(agent => ({
  ...agent,
  cpuUsage: agent.metrics?.cpu || 0,
  memoryUsage: agent.metrics?.memory || 0,
  // ... other metrics
}));
```

### 1c. Test
```bash
cd apps/web
pnpm dev  # Frontend on :3000
# Manually verify: agents show with metrics, WebSocket updates in real-time
```

**Success Criteria**:
- ✅ Component renders agent list
- ✅ Real-time metrics update
- ✅ WebSocket integration working
- ✅ Pause/Resume controls functional

---

## TASK 2: MetricsBar Real-Time Updates (1.5h)

### 2a. Enhance Component
**File**: `apps/web/src/components/MetricsBar.tsx`

**Current State**: Static metrics
**Target State**: Real-time updates via WebSocket

```typescript
interface MetricsBarProps {
  projectName: string;
  metrics: {
    totalTokens: number;
    usedTokens: number;
    remainingTokens: number;
    progressPercent: number;
    activeAgents: number;
    completedFeatures: number;
  };
}
```

### 2b. Connect to WebSocket
```typescript
const { metrics } = useProjectWebSocket(projectName);
const progressPercent = (metrics.usedTokens / metrics.totalTokens) * 100;
```

### 2c. Add Visual Updates
- Token progress bar (animated)
- Status badges (agents active, features complete)
- Budget warning (if >80% used)
- Real-time counter updates

### 2d. Test
```bash
# Verify metrics update when:
# - Agent completes a task
# - Features are created
# - Tokens are consumed
```

**Success Criteria**:
- ✅ Metrics display correctly
- ✅ Real-time updates from WebSocket
- ✅ Progress animation smooth
- ✅ Warning states trigger at thresholds

---

## TASK 3: DebugPanel Enhancement (1.5h)

### 3a. Add Tab Support
**File**: `apps/web/src/components/DebugPanel.tsx`

**New Tabs**:
1. **Terminal** - Agent output (existing)
2. **Logs** - Structured logs (new)
3. **Performance** - Metrics/timings (new)

```typescript
type DebugTab = 'terminal' | 'logs' | 'performance';

interface DebugPanelProps {
  activeTab: DebugTab;
  onTabChange: (tab: DebugTab) => void;
  autoScroll: boolean;
  onAutoScrollChange: (value: boolean) => void;
}
```

### 3b. Implement Tabs
```typescript
const renderTabContent = () => {
  switch (activeTab) {
    case 'terminal':
      return <TerminalOutput logs={terminalLogs} />;
    case 'logs':
      return <StructuredLogs logs={structuredLogs} filter={logFilter} />;
    case 'performance':
      return <PerformanceMetrics metrics={metrics} />;
  }
};
```

### 3c. Add Keyboard Shortcuts
- `T` → Terminal tab
- `L` → Logs tab
- `P` → Performance tab
- `A` → Toggle auto-scroll

### 3d. Test
```bash
# Press T, L, P to switch tabs
# Verify content changes
# Verify auto-scroll toggles
```

**Success Criteria**:
- ✅ Three tabs render correctly
- ✅ Content switches on click
- ✅ Keyboard shortcuts work
- ✅ Auto-scroll toggle functional

---

## TASK 4: KeyboardHelp Component (1h)

### 4a. Create Component
**File**: `apps/web/src/components/KeyboardHelp.tsx`

```typescript
const KEYBOARD_SHORTCUTS = [
  { key: 'D', description: 'Dashboard', category: 'Navigation' },
  { key: 'T', description: 'Spec Creation (Magic)', category: 'Features' },
  { key: 'E', description: 'Expand Project', category: 'Features' },
  { key: 'M', description: 'Mission Control', category: 'Views' },
  { key: 'G', description: 'Dependency Graph', category: 'Views' },
  { key: 'S', description: 'Settings', category: 'Config' },
  { key: '?', description: 'Show Keyboard Shortcuts', category: 'Help' },
  // ... more shortcuts
];

export const KeyboardHelp: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredShortcuts = KEYBOARD_SHORTCUTS.filter(
    s => s.key.includes(searchTerm) || s.description.includes(searchTerm)
  );

  return (
    <Dialog open onClose={onClose}>
      {/* Search input */}
      {/* Grouped shortcuts by category */}
      {/* Close button */}
    </Dialog>
  );
};
```

### 4b. Trigger Modal
In `page.tsx`:
```typescript
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === '?') {
      e.preventDefault();
      setShowKeyboardHelp(true);
    }
  };
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

### 4c. Test
```bash
# Press ?
# Verify help modal opens
# Verify shortcuts are searchable
# Verify close button works
```

**Success Criteria**:
- ✅ Modal triggers on '?'
- ✅ All shortcuts listed
- ✅ Search/filter works
- ✅ Close button functional

---

## TASK 5: SettingsModal (1.5h)

### 5a. Create Component
**File**: `apps/web/src/components/SettingsModal.tsx`

```typescript
interface UserSettings {
  theme: 'dark' | 'light' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  autoScroll: boolean;
  notifications: {
    errors: boolean;
    warnings: boolean;
    info: boolean;
  };
  webSocketReconnect: {
    maxRetries: number;
    initialDelay: number;
  };
}

export const SettingsModal: React.FC<{
  open: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSave: (settings: UserSettings) => void;
}> = ({ open, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    localStorage.setItem('hex-ade-settings', JSON.stringify(localSettings));
    onSave(localSettings);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      {/* Theme selector */}
      {/* Font size selector */}
      {/* Notification toggles */}
      {/* WebSocket settings */}
      {/* Save/Cancel buttons */}
    </Dialog>
  );
};
```

### 5b. Load Settings on Startup
```typescript
useEffect(() => {
  const saved = localStorage.getItem('hex-ade-settings');
  if (saved) {
    setSettings(JSON.parse(saved));
  }
}, []);
```

### 5c. Test
```bash
# Open Settings (S key)
# Change theme to light
# Reload page
# Verify theme persisted
```

**Success Criteria**:
- ✅ Modal opens on 'S'
- ✅ Settings save to localStorage
- ✅ Settings load on startup
- ✅ All toggles functional

---

## TASK 6: ScheduleModal (2h)

### 6a. Create Component
**File**: `apps/web/src/components/ScheduleModal.tsx`

```typescript
interface ScheduleConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  time: string;      // HH:mm
  timezone: string;
  cronExpression?: string;
}

export const ScheduleModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSchedule: (config: ScheduleConfig) => void;
}> = ({ open, onClose, onSchedule }) => {
  const [config, setConfig] = useState<ScheduleConfig>({
    enabled: false,
    frequency: 'daily',
    time: '09:00',
    timezone: 'UTC',
  });

  const previewCron = generateCronExpression(config);

  return (
    <Dialog open={open} onClose={onClose}>
      {/* Frequency selector (Daily/Weekly/Monthly/Custom) */}
      {/* Time picker */}
      {/* Timezone selector */}
      {/* Cron preview */}
      {/* Schedule/Cancel buttons */}
    </Dialog>
  );
};
```

### 6b. Helper Functions
```typescript
const generateCronExpression = (config: ScheduleConfig): string => {
  const [hours, minutes] = config.time.split(':');

  switch (config.frequency) {
    case 'daily':
      return `${minutes} ${hours} * * *`;  // Every day at HH:mm
    case 'weekly':
      return `${minutes} ${hours} * * 1`;  // Weekly Monday
    case 'monthly':
      return `${minutes} ${hours} 1 * *`;  // Monthly 1st
    case 'custom':
      return config.cronExpression || '* * * * *';
  }
};
```

### 6c. Test
```bash
# Open Schedule modal
# Select Daily at 14:00 UTC
# Verify cron: "0 14 * * *"
# Save schedule
# Verify API call with cron expression
```

**Success Criteria**:
- ✅ Modal opens and closes
- ✅ Cron expression generated correctly
- ✅ Time/timezone saved
- ✅ API call sends schedule

---

## TASK 7: AssistantPanel Enhancement (1.5h)

### 7a. Enhance Component
**File**: `apps/web/src/components/AssistantPanel.tsx`

**Add**:
1. Conversation history list
2. Quick-access buttons (SpecChat, ExpandChat)
3. Pin/unpin messages
4. Search conversation history

```typescript
interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  pinned?: boolean;
}

export const AssistantPanel: React.FC<{
  projectName: string;
  conversations: ConversationMessage[];
}> = ({ projectName, conversations }) => {
  const pinned = conversations.filter(c => c.pinned);

  return (
    <Box>
      {/* Quick action buttons */}
      {/* Pinned messages */}
      {/* Conversation history */}
      {/* Search bar */}
    </Box>
  );
};
```

### 7b. Connect to Chat Hooks
```typescript
const { messages } = useAssistantChat(projectName);
const { expandMessages } = useExpandChat(projectName);

const allConversations = [...messages, ...expandMessages];
```

### 7c. Test
```bash
# Click "Open SpecChat"
# Verify SpecCreationChat modal opens
# Send message
# Verify message appears in AssistantPanel history
```

**Success Criteria**:
- ✅ Conversation history displays
- ✅ Quick-access buttons work
- ✅ Pin/unpin functional
- ✅ Search filters conversations

---

## TASK 8: FeedbackPanel Enhancement (1h)

### 8a. Enhance Component
**File**: `apps/web/src/components/FeedbackPanel.tsx`

**Add**:
1. Filter by type (error, warning, info, success)
2. Timestamp display
3. Auto-dismiss toggle
4. Persistent history in DebugPanel

```typescript
interface Feedback {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  message: string;
  timestamp: Date;
  source?: string;  // Which agent/component
}

export const FeedbackPanel: React.FC<{
  feedback: Feedback[];
  onDismiss: (id: string) => void;
  autoDismiss?: boolean;
}> = ({ feedback, onDismiss, autoDismiss = true }) => {
  useEffect(() => {
    if (autoDismiss) {
      feedback.forEach(f => {
        const timeout = setTimeout(() => onDismiss(f.id), 5000);
        return () => clearTimeout(timeout);
      });
    }
  }, [feedback]);

  return (
    <Stack spacing={1}>
      {/* Filter buttons */}
      {/* Feedback list with close buttons */}
    </Stack>
  );
};
```

### 8b. Connect to WebSocket
```typescript
const { feedback } = useProjectWebSocket(projectName);
```

### 8c. Test
```bash
# Trigger error (e.g., invalid project)
# Verify error appears and dismisses after 5s
# Verify history in DebugPanel → Logs
```

**Success Criteria**:
- ✅ Feedback displays with type icon
- ✅ Auto-dismiss works (5s)
- ✅ Manual dismiss works
- ✅ History available in Logs tab

---

## TASK 9: Integration & Testing (2h)

### 9a. Update page.tsx
Add all modals:
```typescript
const [showSettings, setShowSettings] = useState(false);
const [showSchedule, setShowSchedule] = useState(false);
const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

// Add keyboard listeners
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 's') setShowSettings(true);
    if (e.key === '?') setShowKeyboardHelp(true);
  };
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);

// Render all modals
return (
  <>
    {/* Existing components */}
    <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
    <ScheduleModal open={showSchedule} onClose={() => setShowSchedule(false)} />
    <KeyboardHelp open={showKeyboardHelp} onClose={() => setShowKeyboardHelp(false)} />
  </>
);
```

### 9b. Test Full Integration
```bash
pnpm dev

# Test all features:
# - AgentMissionControl: Shows real-time agent metrics
# - MetricsBar: Updates in real-time
# - DebugPanel: Tabs work, shortcuts work
# - Settings: Save/load settings
# - Schedule: Cron expression correct
# - KeyboardHelp: ? opens help
# - FeedbackPanel: Shows feedback with auto-dismiss
```

### 9c. E2E Tests
Create: `apps/web/tests/e2e/phase2-mission-control.spec.ts`

---

## TASK 10: Commit & Report (30 min)

### 10a. Commit Changes
```bash
git add apps/web/src/components/AgentMissionControl.tsx
git add apps/web/src/components/MetricsBar.tsx
git add apps/web/src/components/DebugPanel.tsx
git add apps/web/src/components/KeyboardHelp.tsx
git add apps/web/src/components/SettingsModal.tsx
git add apps/web/src/components/ScheduleModal.tsx
git add apps/web/src/components/AssistantPanel.tsx
git add apps/web/src/components/FeedbackPanel.tsx
git add apps/web/src/app/page.tsx

git commit -m "feat(phase2): Mission Control dashboard enhancements

## Summary
Phase 2 Mission Control implementation:

## Features Added
- AgentMissionControl: Real-time agent metrics + resource usage
- MetricsBar: Real-time token tracking + budget warnings
- DebugPanel: Multi-tab support (Terminal, Logs, Performance)
- KeyboardHelp: Keyboard shortcut reference modal
- SettingsModal: User preferences + persistence
- ScheduleModal: Cron-based scheduling builder
- AssistantPanel: Conversation history + quick actions
- FeedbackPanel: Feedback filtering + auto-dismiss

## Keyboard Shortcuts
- M: Mission Control
- S: Settings
- ?: Keyboard Help
- T/L/P: Debug Panel tabs

## Components Enhanced
8 components updated/created, all WebSocket-integrated

## Testing
- All components tested locally
- E2E tests created
- Integration verified

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"

git log --oneline -1
```

### 10b. Report Summary
**Status**: ✅ Phase 2 Mission Control Complete
- ✅ 8 components (created/enhanced)
- ✅ Real-time WebSocket integration
- ✅ All keyboard shortcuts functional
- ✅ Settings persistence
- ✅ Integration tested
- ✅ Ready for merge

---

## SUCCESS CRITERIA (ALL REQUIRED)

- ✅ AgentMissionControl shows real-time metrics
- ✅ MetricsBar updates in real-time
- ✅ DebugPanel has 3 tabs + keyboard shortcuts
- ✅ KeyboardHelp modal with all shortcuts
- ✅ SettingsModal saves/loads preferences
- ✅ ScheduleModal generates cron expressions
- ✅ AssistantPanel shows conversation history
- ✅ FeedbackPanel with filtering + auto-dismiss
- ✅ All components integrated into page.tsx
- ✅ Keyboard shortcuts working (M, S, ?, T, L, P)
- ✅ E2E tests created
- ✅ Commit created
- ✅ Ready for Phase 2 merge

---

## DELIVERABLES

1. **8 Enhanced/New Components**
2. **Full page.tsx integration**
3. **E2E test suite** (phase2-mission-control.spec.ts)
4. **Git commit** with comprehensive message
5. **Keyboard shortcut system**
6. **WebSocket real-time integration**
7. **Settings persistence** (localStorage)

---

## TIMELINE
- Task 1 (AgentMissionControl): 3h
- Task 2 (MetricsBar): 1.5h
- Task 3 (DebugPanel): 1.5h
- Task 4 (KeyboardHelp): 1h
- Task 5 (SettingsModal): 1.5h
- Task 6 (ScheduleModal): 2h
- Task 7 (AssistantPanel): 1.5h
- Task 8 (FeedbackPanel): 1h
- Task 9 (Integration): 2h
- Task 10 (Commit): 0.5h
**Total: ~15.5 hours**

---

**Status**: ✅ READY FOR EXECUTION
