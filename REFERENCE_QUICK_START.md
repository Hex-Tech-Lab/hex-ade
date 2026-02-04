# Quick Reference: What to Implement First

**For Kelly:** This is your starting point. Read this first before opening the detailed docs.

---

## THE SITUATION

Leon van Zyl's AutoCoder has **production-grade features** that hex-ade is missing:

1. **Multi-agent orchestration display** (Mission Control)
2. **Interactive spec creation** (Spec Chat)
3. **Feature dependency visualization** (Graph View)
4. **Persistent assistant chat** (Assistant Panel)
5. **Expansion/bulk features** (Expand Chat)

These are **NOT nice-to-haves**—they're core UX blockers for a multi-agent system.

---

## PRIORITY 1: Mission Control (DO THIS FIRST)

### Why?
- Users can't see multiple agents working in parallel
- Current UI shows only single-agent status
- Reference implementation is production-ready

### What to Build?
Three components showing agent orchestration:

1. **AgentCard.tsx** (120 lines)
   - Show individual agent: name, status, feature, logs button
   - Color-coded state: thinking (yellow), working (blue), success (green), error (red)

2. **OrchestratorStatusCard.tsx** (100 lines)
   - Show master state: "Initializing" → "Scheduling" → "Monitoring" → "Complete"
   - Metrics: codingAgents, testingAgents, ready, blocked
   - Recent events feed (last 5 events)

3. **AgentMissionControl.tsx** (150 lines)
   - Collapsible container
   - Shows OrchestratorStatusCard + grid of AgentCards + ActivityFeed
   - Place below ProgressDashboard in App.tsx

### Time: 1-2 days
### Impact: HIGH (enables multi-agent UX)
### Reference Files:
- `/home/kellyb_dev/projects/hex-rag-dss/_reference/autocoder/ui/src/components/AgentMissionControl.tsx`
- `/home/kellyb_dev/projects/hex-rag-dss/_reference/autocoder/ui/src/components/AgentCard.tsx`
- `/home/kellyb_dev/projects/hex-rag-dss/_reference/autocoder/ui/src/components/OrchestratorStatusCard.tsx`
- `/home/kellyb_dev/projects/hex-rag-dss/_reference/autocoder/ui/src/components/ActivityFeed.tsx`

### Backend Requirements:
- ✅ Existing: WebSocket /ws/projects/{projectName}
- 🟡 Needs update: Send `agent_update` messages (per-agent state changes)
- 🟡 Needs update: Send `orchestrator_update` messages (orchestrator status)

### Key Code to Add:
1. **types.ts additions:**
   ```typescript
   export interface ActiveAgent {
     agentIndex: number
     agentName: AgentMascot  // 'Spark', 'Fizz', etc.
     agentType: 'coding' | 'testing'
     featureId: number
     featureName: string
     state: 'idle'|'thinking'|'working'|'testing'|'success'|'error'|'struggling'
     thought?: string
     timestamp: string
     logs?: AgentLogEntry[]
   }

   export interface OrchestratorStatus {
     state: 'idle'|'initializing'|'scheduling'|'spawning'|'monitoring'|'complete'
     codingAgents: number
     testingAgents: number
     maxConcurrency: number
     readyCount: number
     blockedCount: number
     recentEvents: OrchestratorEvent[]
   }
   ```

2. **useWebSocket.ts additions:**
   - Handle `agent_update` WebSocket messages
   - Handle `orchestrator_update` WebSocket messages
   - Maintain `activeAgents: ActiveAgent[]` state
   - Maintain `orchestratorStatus: OrchestratorStatus | null` state
   - Implement celebration queue (when agent succeeds)

3. **App.tsx integration:**
   ```typescript
   // After ProgressDashboard:
   <AgentMissionControl
     agents={wsState.activeAgents}
     orchestratorStatus={wsState.orchestratorStatus}
     recentActivity={wsState.recentActivity}
     getAgentLogs={wsState.getAgentLogs}
   />
   ```

---

## PRIORITY 2: Spec Creation Chat (DO THIS SECOND)

### Why?
- Users can't create new projects interactively
- Current setup requires manual spec file
- Interactive chat is core feature selling point

### What to Build?
One complex component + one hook:

1. **SpecCreationChat.tsx** (300+ lines)
   - Full-screen chat interface
   - User types description
   - Claude asks clarifying questions (multi-choice UI)
   - Claude generates app features + spec file
   - Shows when spec is ready to use

2. **useSpecChat.ts** hook (200+ lines)
   - WebSocket connection to /ws/spec/{projectName}
   - Parses streaming messages
   - Manages question state + file completion

### Time: 2-3 days
### Impact: CRITICAL (blocks all new projects)
### Reference Files:
- `/home/kellyb_dev/projects/hex-rag-dss/_reference/autocoder/ui/src/components/SpecCreationChat.tsx`
- `/home/kellyb_dev/projects/hex-rag-dss/_reference/autocoder/ui/src/hooks/useSpecChat.ts`
- `/home/kellyb_dev/projects/hex-rag-dss/_reference/autocoder/ui/src/components/ChatMessage.tsx`
- `/home/kellyb_dev/projects/hex-rag-dss/_reference/autocoder/ui/src/components/QuestionOptions.tsx`

### Backend Requirements:
- ❌ NEW: WebSocket `/ws/spec/{projectName}` endpoint
- ❌ NEW: Streaming spec creation messages

### Additional Components Needed:
- **ChatMessage.tsx** (100 lines) - Display chat messages with markdown
- **QuestionOptions.tsx** (120 lines) - Multi-choice question UI
- **TypingIndicator.tsx** (40 lines) - "Claude is typing..." animation

### Integration Points:
- Show when project has no spec (ProjectSetupRequired screen)
- Auto-start agent on completion (optional)
- Display yolo_mode toggle

---

## PRIORITY 3: Dependency Graph View (DO THIS THIRD)

### Why?
- Can't visualize feature dependencies
- Current Kanban board hides relationships
- Visualization helps understand project structure

### What to Build?
Two components + one library:

1. **DependencyGraph.tsx** (250+ lines)
   - D3.js or Vis.js visualization
   - Nodes: Features (colored by status)
   - Edges: Dependencies
   - Click node → Open feature details

2. **ViewToggle.tsx** (50 lines)
   - Toggle between Kanban and Graph views
   - Persist choice to localStorage

### Time: 1-2 days
### Impact: MEDIUM (visibility improvement)
### Library: Install `vis-network` (simpler than D3.js)

### Reference Files:
- `/home/kellyb_dev/projects/hex-rag-dss/_reference/autocoder/ui/src/components/DependencyGraph.tsx`
- `/home/kellyb_dev/projects/hex-rag-dss/_reference/autocoder/ui/src/components/ViewToggle.tsx`

### Backend Requirements:
- ✅ Existing: GET /api/projects/{name}/features/graph

### Changes to App.tsx:
```typescript
// Add state
const [viewMode, setViewMode] = useState<'kanban'|'graph'>('kanban')

// Fetch graph data
const { data: graphData } = useQuery({
  queryKey: ['dependencyGraph', selectedProject],
  queryFn: () => getDependencyGraph(selectedProject!),
  enabled: !!selectedProject && viewMode === 'graph',
  refetchInterval: 5000,
})

// Add keyboard shortcut: G to toggle views

// Render toggle UI
<ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />

// Conditional render
{viewMode === 'kanban' ? <KanbanBoard /> : <DependencyGraph />}
```

---

## PRIORITY 4: Expand Project Chat (DO THIS FOURTH)

### Why?
- Users can't bulk-generate features for existing projects
- Have to manually create each feature
- Expansion is key productivity feature

### What to Build?
Similar to Spec Chat but simpler:

1. **ExpandProjectChat.tsx** (200+ lines)
   - Modal dialog (not full-screen like spec)
   - User describes features to add
   - Claude generates feature list
   - Shows confirmation
   - Adds to Kanban board

2. **useExpandChat.ts** hook (150+ lines)
   - Similar to useSpecChat but simpler

### Time: 1 day
### Impact: HIGH (project growth feature)

### Integration:
- "Expand Project" button in Kanban when features exist
- Keyboard shortcut: E
- After completion: Invalidate features query

---

## PRIORITY 5: Assistant Panel (DO THIS FIFTH)

### Why?
- Users can't get interactive help
- No conversation history
- Useful for debugging agent behavior

### What to Build?
Three components + one hook:

1. **AssistantPanel.tsx** (120 lines)
   - Slide-in right panel
   - Reusable conversation selector

2. **AssistantChat.tsx** (150 lines)
   - Chat interface (reuse ChatMessage.tsx)

3. **useAssistantChat.ts** hook (150+ lines)
   - WebSocket to /ws/assistant/{projectName}/{conversationId}

### Time: 1-2 days
### Impact: MEDIUM (convenience feature)

### Backend Requirements:
- ❌ NEW: Database tables for conversations/messages
- ❌ NEW: WebSocket /ws/assistant/{projectName}/{conversationId}

---

## IMPLEMENTATION CHECKLIST

### Phase 1: Mission Control (Week 1)
- [ ] Add ActiveAgent, OrchestratorStatus types to types.ts
- [ ] Update useWebSocket.ts to handle agent_update + orchestrator_update
- [ ] Create AgentCard.tsx component
- [ ] Create OrchestratorStatusCard.tsx component
- [ ] Create ActivityFeed.tsx component
- [ ] Create AgentMissionControl.tsx container
- [ ] Integrate into App.tsx
- [ ] Test with mock data

### Phase 2: Spec Chat (Week 2-3)
- [ ] Create ChatMessage.tsx component
- [ ] Create QuestionOptions.tsx component
- [ ] Create TypingIndicator.tsx component
- [ ] Implement useSpecChat.ts hook
- [ ] Create SpecCreationChat.tsx component
- [ ] Integrate into ProjectSetupRequired
- [ ] Test full flow

### Phase 3: Graph View (Week 3-4)
- [ ] Install vis-network library
- [ ] Create DependencyGraph.tsx component
- [ ] Create ViewToggle.tsx component
- [ ] Update App.tsx for view switching
- [ ] Add keyboard shortcut G
- [ ] Test graph rendering

### Phase 4: Expand Chat (Week 4)
- [ ] Create ExpandProjectChat.tsx
- [ ] Create ExpandProjectModal.tsx wrapper
- [ ] Implement useExpandChat.ts
- [ ] Add button to KanbanBoard
- [ ] Test expansion flow

### Phase 5: Assistant Panel (Week 5+)
- [ ] Create database schema
- [ ] Create AssistantPanel.tsx
- [ ] Implement useAssistantChat.ts
- [ ] Test persistence

---

## FILE LOCATIONS

### Reference Project (Copy From)
```
/home/kellyb_dev/projects/hex-rag-dss/_reference/autocoder/ui/src/
```

### hex-ade Project (Copy To)
```
/home/kellyb_dev/projects/hex-ade/apps/web/src/
```

### Documents Already Created
- `/home/kellyb_dev/projects/hex-ade/REFERENCE_ARCHITECTURE_ANALYSIS.md` (Comprehensive analysis)
- `/home/kellyb_dev/projects/hex-ade/IMPLEMENTATION_MAPPING_DETAILED.md` (Code-level mapping)
- `/home/kellyb_dev/projects/hex-ade/REFERENCE_QUICK_START.md` (This file)

---

## DECISION TREE

**Q: Where should I start?**
A: Start with Mission Control (Priority 1). It's the quickest win with highest impact.

**Q: Do I need all of this?**
A: Mission Control + Spec Chat are CRITICAL. Others are valuable but not blocking.

**Q: How long will this take?**
A: ~3-4 weeks for Priorities 1-4. Priorities 5+ are bonus.

**Q: What if backend doesn't support WebSocket?**
A: You'll need to implement the WebSocket endpoints. That's a 1-2 week backend task.

**Q: Can I do this incrementally?**
A: YES! Each priority is independent:
1. Mission Control works without Spec Chat
2. Graph View works without Mission Control
3. Etc.

---

## NEXT STEPS

1. **Read** REFERENCE_ARCHITECTURE_ANALYSIS.md (understand architecture)
2. **Read** IMPLEMENTATION_MAPPING_DETAILED.md (understand code)
3. **Browse** reference files in `/home/kellyb_dev/projects/hex-rag-dss/_reference/`
4. **Start** with Priority 1: AgentMissionControl
5. **Follow** the checklist above

---

## KEY INSIGHTS FROM REFERENCE

### What Works Well
- ✅ WebSocket double-layer (real-time + polling fallback)
- ✅ Celebration queue prevents race conditions
- ✅ Per-agent logging for debugging
- ✅ Stale agent cleanup after 30 minutes
- ✅ localStorage persistence (view mode, conversation ID)
- ✅ Keyboard shortcuts power users love
- ✅ Modular components (easy to compose)

### What to Avoid
- ❌ Don't let celebration overlays stack
- ❌ Don't forget to clean up WebSocket on unmount
- ❌ Don't hardcode max limits (make configurable)
- ❌ Don't render 50+ agents in a grid (use pagination)

### Best Practices
- ✅ Use React Query for server state
- ✅ Use useState for UI state
- ✅ Use localStorage for preferences (with try-catch)
- ✅ Use WebSocket for real-time updates
- ✅ Use types.ts as single source of truth for data shapes

---

**Ready to start? Begin with Mission Control. It's the quickest path to multi-agent visibility.**

