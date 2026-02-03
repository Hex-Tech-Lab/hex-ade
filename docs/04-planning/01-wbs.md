# hex-ade Work Breakdown Structure (WBS)
**Version**: 1.0
**Date**: 2026-02-03
**Status**: Draft

---

## Overview

This WBS defines the complete task breakdown for implementing hex-ade. Each task is designed to be executable by any LLM given the document package (PRD, HDS, TDD).

**Governance Rule**: Execute tasks in order. Do not skip. Validate completion before proceeding.

---

## Phase 1: Foundation (GOTCHA: Goals + Orchestration)

### 1.1 Repository Setup

| Task ID | Task | Input | Output | Validation |
|---------|------|-------|--------|------------|
| T1.1.1 | Create GitHub repo | repo name: hex-ade | GitHub URL | `gh repo view` succeeds |
| T1.1.2 | Clone locally | GitHub URL | local directory | `ls hex-ade/` shows files |
| T1.1.3 | Init pnpm workspace | local directory | pnpm-workspace.yaml | file exists |
| T1.1.4 | Create apps/web scaffold | workspace | Next.js 15 app | `pnpm dev` runs |
| T1.1.5 | Configure TypeScript | apps/web | tsconfig.json strict | no TS errors |
| T1.1.6 | Configure ESLint 9 flat | apps/web | eslint.config.mjs | `pnpm lint` passes |
| T1.1.7 | Add MUI + Tailwind | apps/web | both installed | imports work |

### 1.2 Supabase Setup

| Task ID | Task | Input | Output | Validation |
|---------|------|-------|--------|------------|
| T1.2.1 | Create Supabase project | Supabase dashboard | project URL + keys | can connect |
| T1.2.2 | Create migrations folder | local | supabase/migrations/ | folder exists |
| T1.2.3 | Write projects table | TDD schema | migration file | `supabase db push` succeeds |
| T1.2.4 | Write features table | TDD schema | migration file | table exists |
| T1.2.5 | Write memory_entries table | TDD schema | migration file | pgvector works |
| T1.2.6 | Write spend_log table | TDD schema | migration file | table exists |
| T1.2.7 | Write timebox_entries table | TDD schema | migration file | table exists |
| T1.2.8 | Enable RLS policies | tables | RLS rules | policies active |

### 1.3 Environment Configuration

| Task ID | Task | Input | Output | Validation |
|---------|------|-------|--------|------------|
| T1.3.1 | Create .env.local template | TDD env vars | .env.example | file exists |
| T1.3.2 | Configure Vercel env vars | Supabase keys | Vercel settings | deploy works |
| T1.3.3 | Add GitHub secrets | API keys | GitHub settings | CI can access |

---

## Phase 2: Tools Layer (GOTCHA: Tools)

### 2.1 Port Deterministic Tools

| Task ID | Task | Input | Output | Validation |
|---------|------|-------|--------|------------|
| T2.1.1 | Create tools/ directory | - | tools/ folder | folder exists |
| T2.1.2 | Port router.py | hex-rag-dss version | tools/router.py | `python router.py --task "test"` works |
| T2.1.3 | Port budget_assessor.py | hex-rag-dss version | tools/budget_assessor.py | `python budget_assessor.py --status` works |
| T2.1.4 | Port timebox.py | hex-rag-dss version | tools/timebox.py | `python timebox.py --stats` works |
| T2.1.5 | Port sentinel.py | hex-rag-dss version | tools/sentinel.py | `python sentinel.py --check-runaway` works |
| T2.1.6 | Port qodana_runner.py | hex-rag-dss version | tools/qodana_runner.py | `python qodana_runner.py --check-install` works |
| T2.1.7 | Port pr_sweeper.py | hex-rag-dss version | tools/pr_sweeper.py | `python pr_sweeper.py --classify --comment "test"` works |
| T2.1.8 | Port memory/ module | hex-rag-dss version | tools/memory/ | imports work |
| T2.1.9 | Port orchestrator.py | hex-rag-dss version | tools/orchestrator.py | `python orchestrator.py --status` works |

### 2.2 Adapt Tools to Supabase

| Task ID | Task | Input | Output | Validation |
|---------|------|-------|--------|------------|
| T2.2.1 | Create supabase_client.py | Supabase URL + key | tools/lib/supabase_client.py | can query |
| T2.2.2 | Update budget_assessor for Supabase | SQLite queries | Supabase queries | data persists |
| T2.2.3 | Update timebox for Supabase | SQLite queries | Supabase queries | data persists |
| T2.2.4 | Update memory for Supabase | SQLite queries | Supabase + pgvector | vector search works |

### 2.3 Create API Routes for Tools

| Task ID | Task | Input | Output | Validation |
|---------|------|-------|--------|------------|
| T2.3.1 | Create /api/tools/router | router.py | API route | POST returns model |
| T2.3.2 | Create /api/tools/budget | budget_assessor.py | API route | GET returns status |
| T2.3.3 | Create /api/tools/timebox | timebox.py | API route | POST starts timebox |
| T2.3.4 | Create /api/tools/memory | memory/ | API route | POST searches memory |
| T2.3.5 | Create /api/tasks/execute | orchestrator.py | API route | POST runs ATLAS-VM |

---

## Phase 3: UI Layer (GOTCHA: Checkpoints)

### 3.1 Layout and Navigation

| Task ID | Task | Input | Output | Validation |
|---------|------|-------|--------|------------|
| T3.1.1 | Create app layout | MUI theme | src/app/layout.tsx | renders |
| T3.1.2 | Create sidebar navigation | MUI Drawer | components/Sidebar.tsx | navigation works |
| T3.1.3 | Create top bar | MUI AppBar | components/TopBar.tsx | shows project name |

### 3.2 Dashboard View

| Task ID | Task | Input | Output | Validation |
|---------|------|-------|--------|------------|
| T3.2.1 | Create dashboard page | - | src/app/dashboard/page.tsx | renders |
| T3.2.2 | Create project selector | projects API | components/ProjectSelector.tsx | can switch projects |
| T3.2.3 | Create budget widget | budget API | components/BudgetWidget.tsx | shows spend |
| T3.2.4 | Create feature list | features API | components/FeatureList.tsx | shows features |
| T3.2.5 | Create quick actions | - | components/QuickActions.tsx | buttons work |

### 3.3 Execution View

| Task ID | Task | Input | Output | Validation |
|---------|------|-------|--------|------------|
| T3.3.1 | Create execution page | - | src/app/execute/page.tsx | renders |
| T3.3.2 | Create task input form | - | components/TaskInput.tsx | can submit |
| T3.3.3 | Create ATLAS-VM stepper | execution API | components/AtlasStepper.tsx | shows steps |
| T3.3.4 | Create step detail view | step results | components/StepDetail.tsx | shows output |
| T3.3.5 | Create execution log | - | components/ExecutionLog.tsx | streams logs |

### 3.4 Settings View

| Task ID | Task | Input | Output | Validation |
|---------|------|-------|--------|------------|
| T3.4.1 | Create settings page | - | src/app/settings/page.tsx | renders |
| T3.4.2 | Create API keys form | - | components/ApiKeysForm.tsx | can save keys |
| T3.4.3 | Create budget limits form | - | components/BudgetLimitsForm.tsx | can set limits |
| T3.4.4 | Create model config view | models.yaml | components/ModelConfig.tsx | shows matrix |

---

## Phase 4: Integration (GOTCHA: Handoff/Audit)

### 4.1 Auth Flow

| Task ID | Task | Input | Output | Validation |
|---------|------|-------|--------|------------|
| T4.1.1 | Create auth pages | Supabase Auth | src/app/(auth)/ | can sign in |
| T4.1.2 | Create auth middleware | - | middleware.ts | protects routes |
| T4.1.3 | Create auth context | - | lib/auth-context.tsx | user available |

### 4.2 State Management

| Task ID | Task | Input | Output | Validation |
|---------|------|-------|--------|------------|
| T4.2.1 | Create project store | TDD spec | stores/projectStore.ts | state works |
| T4.2.2 | Create execution store | TDD spec | stores/executionStore.ts | state works |
| T4.2.3 | Create budget store | TDD spec | stores/budgetStore.ts | state works |

### 4.3 E2E Testing

| Task ID | Task | Input | Output | Validation |
|---------|------|-------|--------|------------|
| T4.3.1 | Configure Playwright | - | playwright.config.ts | can run |
| T4.3.2 | Write auth flow tests | - | tests/e2e/auth.spec.ts | passes |
| T4.3.3 | Write project CRUD tests | - | tests/e2e/projects.spec.ts | passes |
| T4.3.4 | Write execution tests | - | tests/e2e/execution.spec.ts | passes |

### 4.4 CI/CD

| Task ID | Task | Input | Output | Validation |
|---------|------|-------|--------|------------|
| T4.4.1 | Create GitHub Actions workflow | TDD spec | .github/workflows/ci.yml | runs on push |
| T4.4.2 | Configure Vercel project | - | Vercel dashboard | auto-deploys |

---

## Phase 5: MCP Server (Post-MVP)

| Task ID | Task | Input | Output | Validation |
|---------|------|-------|--------|------------|
| T5.1 | Create MCP server scaffold | - | mcp/server.py | starts |
| T5.2 | Implement create_feature tool | - | mcp/tools/create_feature.py | works |
| T5.3 | Implement execute_task tool | - | mcp/tools/execute_task.py | works |
| T5.4 | Implement check_budget tool | - | mcp/tools/check_budget.py | works |
| T5.5 | Implement search_memory tool | - | mcp/tools/search_memory.py | works |

---

## Execution Prompt Template

For any LLM executing a task from this WBS:

```
You are implementing hex-ade, an Autonomous Development Environment.

**Documents Available:**
- PRD: docs/01-product/01-prd.md
- HDS: docs/02-design/01-hds.md
- TDD: docs/03-technical/01-tdd.md
- WBS: docs/04-planning/01-wbs.md (this document)

**Current Task:**
- Task ID: [TASK_ID]
- Task: [TASK_DESCRIPTION]
- Input: [INPUT]
- Expected Output: [OUTPUT]
- Validation: [VALIDATION_COMMAND]

**Instructions:**
1. Read the relevant sections from PRD/HDS/TDD
2. Implement ONLY this task
3. Validate using the validation command
4. Report completion with validation output

**Constraints:**
- Do not skip validation
- Do not modify other files unless required
- Follow existing patterns in codebase
```

---

## Progress Tracking

| Phase | Tasks | Completed | Status |
|-------|-------|-----------|--------|
| 1. Foundation | 18 | 0 | Not Started |
| 2. Tools | 14 | 0 | Not Started |
| 3. UI | 14 | 0 | Not Started |
| 4. Integration | 10 | 0 | Not Started |
| 5. MCP | 5 | 0 | Not Started |
| **Total** | **61** | **0** | **0%** |
