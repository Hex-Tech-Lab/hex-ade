# hex-ade High-Level Design Specification (HDS)
**Version**: 1.0
**Date**: 2026-02-03
**Status**: Draft

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        hex-ade Web UI                           │
│                    (Next.js 15 + MUI + Tailwind)                │
├─────────────────────────────────────────────────────────────────┤
│                        API Routes Layer                          │
│              /api/projects  /api/tasks  /api/tools              │
├─────────────────────────────────────────────────────────────────┤
│                     Orchestration Layer                          │
│         GOTCHA Framework  ←→  ATLAS-VM Workflow                 │
├─────────────────────────────────────────────────────────────────┤
│                    Deterministic Tools Layer                     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │ router  │ │ budget  │ │ timebox │ │sentinel │ │ memory  │  │
│  │   .py   │ │   .py   │ │   .py   │ │   .py   │ │   .py   │  │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                      Data Layer (Supabase)                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ projects │ │ features │ │  memory  │ │  spend   │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
├─────────────────────────────────────────────────────────────────┤
│                    External Integrations                         │
│      OpenRouter  │  Cerebras  │  GitHub  │  MCP Servers         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Design

### 2.1 Web UI Layer

| Component | Technology | Responsibility |
|-----------|------------|----------------|
| Dashboard | Next.js + MUI | Project overview, metrics |
| Task Panel | MUI DataGrid | Feature list, status tracking |
| Execution View | Custom | ATLAS-VM step visualization |
| Settings | MUI Forms | Config, API keys, budgets |

### 2.2 API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/projects` | CRUD | Project management |
| `/api/projects/[id]/features` | CRUD | Feature tracking |
| `/api/tasks/execute` | POST | Trigger ATLAS-VM |
| `/api/tools/[name]` | POST | Direct tool invocation |
| `/api/budget/status` | GET | Spend dashboard |
| `/api/memory/search` | POST | Semantic memory search |

### 2.3 Orchestration Layer

```
GOTCHA Controller
├── phase_goals.py      → Validate objectives defined
├── phase_orchestrate.py → Plan task sequence
├── phase_tools.py      → Verify tool availability
├── phase_checkpoint.py → Run quality gates
└── phase_handoff.py    → Final audit + delivery

ATLAS-VM Executor
├── step_audit()        → Sentinel gate check
├── step_timebox()      → Start time budget
├── step_load()         → Memory context
├── step_assemble()     → Model selection + exec
├── step_scan()         → Static analysis
├── step_validate()     → PR review simulation
└── step_memory()       → Persist learnings
```

### 2.4 Deterministic Tools

| Tool | Input | Output | Side Effects |
|------|-------|--------|--------------|
| router.py | task, role?, bias | model config | None |
| budget_assessor.py | cost, tokens | status, gate | DB write |
| timebox.py | task, complexity | id, deadline | DB write |
| sentinel.py | command/path | safe/blocked | Log write |
| memory/*.py | query/content | results | DB write |
| qodana_runner.py | path | issues[] | Report file |
| pr_sweeper.py | comment | severity | Log write |

---

## 3. Data Model

### 3.1 Supabase Schema

```sql
-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  repo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Features (replaces JSON file)
CREATE TABLE features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  code TEXT NOT NULL,           -- e.g., "F01"
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'P1',   -- P0, P1, P2
  status TEXT DEFAULT 'pending', -- pending, in_progress, completed, blocked
  phase TEXT,                   -- GOTCHA phase
  estimated_hours NUMERIC,
  actual_hours NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Memory entries
CREATE TABLE memory_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  content TEXT NOT NULL,
  entry_type TEXT,              -- decision, learning, context
  source TEXT,
  tags TEXT[],
  embedding VECTOR(1536),       -- pgvector
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spend tracking
CREATE TABLE spend_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  task_id TEXT,
  model TEXT,
  tokens_input INTEGER,
  tokens_output INTEGER,
  cost_usd NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Timebox entries
CREATE TABLE timebox_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  task TEXT NOT NULL,
  complexity TEXT DEFAULT 'moderate',
  estimated_minutes INTEGER,
  actual_minutes NUMERIC,
  deviation_percent NUMERIC,
  status TEXT DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

---

## 4. Integration Points

### 4.1 Model Providers

| Provider | Models | Use Case |
|----------|--------|----------|
| Cerebras | GLM-4.7 | Code generation, debugging |
| OpenRouter | Multiple | Fallback, specialized tasks |

### 4.2 MCP Server

```
hex-ade MCP Server
├── tools/
│   ├── create_feature    → Add feature to project
│   ├── execute_task      → Run ATLAS-VM
│   ├── check_budget      → Get spend status
│   └── search_memory     → Query memory
└── resources/
    ├── project://current → Active project context
    └── features://list   → Feature list
```

---

## 5. Security Design

| Layer | Mechanism |
|-------|-----------|
| Auth | Supabase Auth (email/OAuth) |
| API | Row Level Security (RLS) |
| Secrets | Vercel env vars (encrypted) |
| Tools | Sentinel guardrails |

---

## 6. Deployment Architecture

```
GitHub Repo
    │
    ▼ (push)
GitHub Actions (CI)
    │
    ├── Lint + Type Check
    ├── Unit Tests (Vitest)
    └── Build
    │
    ▼ (deploy)
Vercel
    │
    ├── Edge Functions (API routes)
    └── Static Assets (UI)
    │
    ▼ (data)
Supabase
    │
    ├── Postgres + pgvector
    ├── Auth
    └── Realtime (optional)
```
