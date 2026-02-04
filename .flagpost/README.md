# Flag Post Coordination System

## Architecture
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│     GC      │     │     OC      │     │   Auditor   │
│  Backend    │     │  Frontend   │     │   (Opus)    │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────┐
│                  .flagpost/                         │
│  ├── status.json    # Agent status (read/write)    │
│  ├── memory.md      # Shared learnings             │
│  ├── blockers.md    # Blocking issues              │
│  └── quality.json   # QA gate results              │
└─────────────────────────────────────────────────────┘
```

## Protocol

### Before Starting Task
1. Read status.json - check other agent status
2. Update own status to "working"
3. Check blockers.md for dependencies

### During Task
1. Follow ATLAS-VM 7-step workflow
2. Log to memory.md at each step
3. Run quality checks before completing

### After Task
1. Update status.json to "completed"
2. Log learnings to memory.md
3. If blocked, add to blockers.md
