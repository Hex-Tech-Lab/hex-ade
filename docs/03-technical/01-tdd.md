# hex-ade Technical Design Document (TDD)
**Version**: 1.0
**Date**: 2026-02-03
**Status**: Draft

---

## 1. Technology Stack

### 1.1 Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.x LTS | Framework |
| React | 18.x | UI library |
| TypeScript | 5.x | Type safety |
| MUI | 5.x | Component library |
| Tailwind CSS | 3.x | Utility classes, positioning |
| Zustand | 4.x | State management |

### 1.2 Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Supabase | Latest | Database, Auth, Realtime |
| Python | 3.11+ | Deterministic tools |
| Node.js | 20.x LTS | API routes |

### 1.3 DevOps

| Technology | Purpose |
|------------|---------|
| Vercel | Hosting, Edge functions |
| GitHub Actions | CI/CD |
| Vitest | Unit testing |
| Playwright | E2E testing |

---

## 2. Project Structure

```
hex-ade/
├── apps/
│   └── web/                    # Next.js application
│       ├── src/
│       │   ├── app/            # App router pages
│       │   │   ├── (auth)/     # Auth routes
│       │   │   ├── dashboard/  # Main dashboard
│       │   │   ├── projects/   # Project views
│       │   │   └── api/        # API routes
│       │   ├── components/     # React components
│       │   │   ├── ui/         # MUI wrappers
│       │   │   ├── dashboard/  # Dashboard components
│       │   │   └── execution/  # ATLAS-VM visualization
│       │   ├── lib/            # Utilities
│       │   │   ├── supabase/   # Supabase client
│       │   │   ├── tools/      # Tool invocation
│       │   │   └── hooks/      # Custom hooks
│       │   └── stores/         # Zustand stores
│       ├── public/
│       └── tests/
│           ├── unit/
│           └── e2e/
├── tools/                      # Deterministic Python tools
│   ├── router.py
│   ├── budget_assessor.py
│   ├── timebox.py
│   ├── sentinel.py
│   ├── qodana_runner.py
│   ├── pr_sweeper.py
│   ├── orchestrator.py
│   └── memory/
│       ├── __init__.py
│       ├── memory_db.py
│       ├── memory_read.py
│       ├── memory_write.py
│       └── semantic_search.py
├── mcp/                        # MCP server
│   ├── server.py
│   └── tools/
├── supabase/
│   └── migrations/
├── docs/
│   ├── 01-product/
│   ├── 02-design/
│   ├── 03-technical/
│   └── 04-planning/
├── .github/
│   └── workflows/
│       └── ci.yml
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.json
└── README.md
```

---

## 3. API Design

### 3.1 Projects API

```typescript
// GET /api/projects
Response: { projects: Project[] }

// POST /api/projects
Body: { name: string, description?: string, repo_url?: string }
Response: { project: Project }

// GET /api/projects/[id]
Response: { project: Project, features: Feature[], stats: ProjectStats }

// PATCH /api/projects/[id]
Body: Partial<Project>
Response: { project: Project }
```

### 3.2 Features API

```typescript
// GET /api/projects/[id]/features
Query: { status?: string, priority?: string }
Response: { features: Feature[] }

// POST /api/projects/[id]/features
Body: { code: string, title: string, description?: string, priority?: string }
Response: { feature: Feature }

// PATCH /api/projects/[id]/features/[featureId]
Body: Partial<Feature>
Response: { feature: Feature }
```

### 3.3 Task Execution API

```typescript
// POST /api/tasks/execute
Body: {
  project_id: string,
  feature_id?: string,
  task: string,
  complexity: 'trivial' | 'simple' | 'moderate' | 'complex' | 'epic',
  role?: string,
  bias?: 'performance' | 'cost' | 'balanced',
  dry_run?: boolean
}
Response: {
  success: boolean,
  task_id: string,
  steps: Record<string, StepResult>,
  duration_seconds: number
}
```

### 3.4 Tools API

```typescript
// POST /api/tools/router
Body: { task: string, role?: string, bias?: string }
Response: { model: string, provider: string, tps: number }

// GET /api/tools/budget/status
Response: { today: DayStatus, month: MonthStatus }

// POST /api/tools/memory/search
Body: { query: string, limit?: number }
Response: { results: MemoryEntry[] }
```

---

## 4. Tool Specifications

### 4.1 router.py

```python
# Input
{
  "task": str,          # Task description
  "role": str | None,   # Force role (optional)
  "bias": str           # "performance" | "cost" | "balanced"
}

# Output
{
  "model": str,         # e.g., "z.ai/glm-4.7"
  "provider": str,      # e.g., "cerebras"
  "tps": int,           # Tokens per second
  "cost_input": float,  # Per 1M tokens
  "cost_output": float  # Per 1M tokens
}

# Algorithm
score = (quality/100 * W_Q) + (tps/1500 * W_S) - (cost/10 * W_C)
# Where weights depend on bias:
# performance: W_Q=0.7, W_S=0.2, W_C=0.1
# cost:        W_Q=0.2, W_S=0.1, W_C=0.7
# balanced:    W_Q=0.4, W_S=0.3, W_C=0.3
```

### 4.2 orchestrator.py

```python
# ATLAS-VM Sequence (must execute in order)
def run_atlas_vm(task: str, complexity: str, role: str | None, bias: str):
    # Step 1: AUDIT
    if not step_audit():
        return {"blocked": True, "reason": "sentinel"}

    # Step 2: TIMEBOX
    task_id = step_timebox_start(task, complexity)

    # Step 3: LOAD
    context = step_load_context(task)

    # Step 4: ASSEMBLE
    model = step_assemble(task, role, bias)
    # >>> EXECUTION POINT: Call LLM here <<<

    # Step 5: SCAN
    scan_result = step_scan()
    if scan_result["critical"] > 0:
        return {"blocked": True, "reason": "quality_gate"}

    # Step 6: VALIDATE
    validate_result = step_validate()

    # Step 7: MEMORY
    step_memory_persist(task, "completed")
    step_timebox_complete(task_id)

    return {"success": True}
```

---

## 5. State Management

### 5.1 Zustand Stores

```typescript
// stores/projectStore.ts
interface ProjectStore {
  currentProject: Project | null;
  features: Feature[];
  setProject: (project: Project) => void;
  addFeature: (feature: Feature) => void;
  updateFeature: (id: string, updates: Partial<Feature>) => void;
}

// stores/executionStore.ts
interface ExecutionStore {
  isRunning: boolean;
  currentStep: string | null;
  steps: Record<string, StepResult>;
  startExecution: (task: string) => void;
  updateStep: (step: string, result: StepResult) => void;
  completeExecution: () => void;
}

// stores/budgetStore.ts
interface BudgetStore {
  today: DayStatus;
  month: MonthStatus;
  fetchStatus: () => Promise<void>;
}
```

---

## 6. Testing Strategy

### 6.1 Unit Tests (Vitest)

| Area | Coverage Target |
|------|-----------------|
| API routes | 80% |
| Zustand stores | 90% |
| Utility functions | 95% |
| Python tools | 90% |

### 6.2 E2E Tests (Playwright)

| Test | Trigger |
|------|---------|
| Auth flow | Every PR |
| Project CRUD | Every PR |
| Feature CRUD | Every PR |
| Task execution (dry run) | Every PR |
| Full ATLAS-VM cycle | Phase completion |

### 6.3 Browser Testing Triggers

1. **Phase-level**: After each GOTCHA phase completion
2. **Ad-hoc**: When UI changes substantially (frontend, backend, or middleware causing UI impact)

---

## 7. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Model Providers
OPENROUTER_API_KEY=
CEREBRAS_API_KEY=

# GitHub (for PR sweeper)
GITHUB_PAT=

# Qodana (optional)
QODANA_TOKEN=
```

---

## 8. CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm lint
      - run: pnpm type-check
      - run: pnpm test:unit

  e2e:
    runs-on: ubuntu-latest
    needs: lint-and-test
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
      - run: pnpm install
      - run: pnpm exec playwright install --with-deps
      - run: pnpm test:e2e
```
