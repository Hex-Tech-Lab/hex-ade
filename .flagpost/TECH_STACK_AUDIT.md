# 📋 Tech Stack Audit & Database Setup Plan

**Date:** 2026-02-04
**Status:** PRE-DATABASE SETUP
**Framework:** GOTCHA + ATLAS-VM

---

## 1. Current Tech Stack Analysis

### 1.1 Frontend (apps/web/)

| Technology | Version | Status | TDD Aligned |
|------------|---------|--------|------------|
| Next.js | 16.1.6 | ✅ | ✅ (15.x LTS) |
| React | 19.2.3 | ✅ | ✅ (18.x) |
| TypeScript | ^5 | ✅ | ✅ (5.x) |
| MUI | 7.3.7 | ✅ | ✅ (5.x) |
| Tailwind CSS | ^4 | ✅ | ✅ (3.x) |
| Zustand | 5.0.11 | ✅ | ✅ (4.x) |
| React Query | 5.90.20 | ✅ | ✅ (data fetching) |
| ESLint | ^9 | ✅ | ✅ |

**Frontend Status:** ✅ ALIGNED (minor version bumps acceptable)

### 1.2 Backend (server/)

| Technology | Version | Status | TDD Aligned |
|------------|---------|--------|------------|
| Python | 3.11+ | ✅ | ✅ |
| FastAPI | 0.115.0 | ✅ | ✅ |
| Uvicorn | 0.32.0 | ✅ | ✅ |
| SQLAlchemy | 2.0.0+ | ✅ | ✅ |
| WebSockets | 13.0 | ✅ | ✅ |
| APScheduler | 3.10.0 | ✅ | ✅ |
| Ruff | 0.8.0 | ✅ | ✅ (linting) |
| MyPy | 1.13.0 | ✅ | ✅ (type checking) |
| Pytest | 8.0.0 | ✅ | ✅ (testing) |

**Backend Status:** ✅ ALIGNED

### 1.3 Database

| Technology | Status | Decision | Action |
|------------|--------|----------|--------|
| Supabase | ✅ Planned | Use | Create instance in Frankfurt |
| SQLAlchemy (Python) | ✅ In use | Keep | Use for Python backend |
| **Drizzle ORM** | ❌ Missing | **ADD** | For Next.js API routes |
| Database Schema | ❌ Missing | **CREATE** | Define with migrations |
| RLS (Row Level Security) | ❌ Missing | **SETUP** | Configure access control |

---

## 2. Database Technology Decision

### Current State
- **Python Backend:** Uses SQLAlchemy for ORM
- **Next.js Frontend:** Uses direct API calls (no database ORM yet)
- **Database:** Supabase planned but not set up

### Recommended Approach

**Option A: SQLAlchemy only (current path)**
- Python backend handles all database operations
- Next.js only makes HTTP calls to Python API
- Pros: Single ORM, cleaner separation
- Cons: All data flow through Python layer

**Option B: SQLAlchemy + Drizzle (best practice)**
- Python backend: SQLAlchemy for business logic
- Next.js: Drizzle for API routes & direct queries
- Pros: Type-safe queries in TypeScript, flexible
- Cons: Two ORMs to maintain

### Recommendation: **Option B (SQLAlchemy + Drizzle)**

**Rationale:**
1. Modern Next.js 15 pattern
2. Type safety in TypeScript
3. Direct database access for API routes
4. Consistent with industry best practices
5. Matches "other project" approach (user mentioned Drizzle there)

---

## 3. Database Schema Plan

### 3.1 Core Tables

**projects**
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  path VARCHAR(1024) NOT NULL,
  has_spec BOOLEAN DEFAULT FALSE,
  default_concurrency INT DEFAULT 3,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  CONSTRAINT concurrency_range CHECK (default_concurrency BETWEEN 1 AND 5)
);
```

**features**
```sql
CREATE TABLE features (
  id BIGSERIAL PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'FUNCTIONAL',
  priority INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  passes BOOLEAN DEFAULT FALSE,
  in_progress BOOLEAN DEFAULT FALSE,
  steps JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT valid_status CHECK (status IN ('pending', 'in_progress', 'complete', 'blocked')),
  CONSTRAINT valid_category CHECK (category IN ('FUNCTIONAL', 'UI', 'API', 'DB', 'DOCS', 'TEST', 'DEVOPS'))
);
```

**tasks** (execution history)
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  feature_id BIGINT REFERENCES features(id) ON DELETE SET NULL,
  task_description TEXT NOT NULL,
  complexity VARCHAR(50),
  role VARCHAR(50),
  bias VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  result JSONB,
  duration_seconds INT,
  created_at TIMESTAMP DEFAULT NOW(),
  executed_at TIMESTAMP
);
```

**agent_logs** (real-time updates)
```sql
CREATE TABLE agent_logs (
  id BIGSERIAL PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  agent_name VARCHAR(255),
  log_level VARCHAR(20),
  message TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_project_created (project_id, created_at DESC)
);
```

### 3.2 RLS Policies

```sql
-- Users can only see their own projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Similar policies for features, tasks, agent_logs
```

---

## 4. Implementation Plan for GC

### Phase 1: Supabase Setup (30 min)
- [ ] Create Supabase project (Frankfurt region)
- [ ] Name: hex-ade
- [ ] Enable Row Level Security
- [ ] Generate API keys
- [ ] Store in environment variables

### Phase 2: Database Schema (45 min)
- [ ] Create migrations directory: `supabase/migrations/`
- [ ] Create initial schema (projects, features, tasks, agent_logs)
- [ ] Add RLS policies
- [ ] Test with dummy data

### Phase 3: SQLAlchemy Integration (1 hour)
- [ ] Add Supabase connection string to .env
- [ ] Update `server/api/database.py` to connect to Supabase
- [ ] Test database operations
- [ ] Verify migrations applied

### Phase 4: Drizzle Setup (Next.js) (45 min)
- [ ] Add Drizzle to apps/web/package.json
- [ ] Create `apps/web/src/db/schema.ts` (Drizzle definitions)
- [ ] Create `apps/web/src/db/client.ts` (Supabase client)
- [ ] Add environment variables
- [ ] Test connection

### Phase 5: Quality Checks (30 min)
- [ ] Run schema validation
- [ ] Test RLS policies
- [ ] Verify backend connections
- [ ] Verify frontend connections
- [ ] Log to memory.md

**Total Time Estimate:** 3-3.5 hours

---

## 5. Environment Variables Needed

### Backend (.env)
```
DATABASE_URL=postgresql://[user]:[password]@[host]:5432/[database]
SUPABASE_URL=https://[project-id].supabase.co
SUPABASE_ANON_KEY=eyJhb...
SUPABASE_SERVICE_KEY=eyJhb...
```

### Frontend (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
```

---

## 6. Drizzle Package Addition

```bash
npm install -D drizzle-kit
npm install drizzle-orm @supabase/supabase-js
```

Update `apps/web/package.json`:
```json
{
  "dependencies": {
    "drizzle-orm": "^0.30.x",
    "@supabase/supabase-js": "^2.x"
  },
  "devDependencies": {
    "drizzle-kit": "^0.20.x"
  }
}
```

---

## 7. Quality Gate Checklist

**Database Setup Success Criteria:**
- [ ] Supabase instance created in Frankfurt
- [ ] All tables created with proper constraints
- [ ] RLS policies enabled and tested
- [ ] SQLAlchemy connections working
- [ ] Drizzle schema defined and validated
- [ ] Environment variables set
- [ ] Build passes: `pnpm build`
- [ ] No type errors in TypeScript
- [ ] Logged to memory.md
- [ ] Status.json updated

---

## 8. Timeline

**While OC finishes Checkpoint 3 (Frontend Integration):**
- GC executes database setup in parallel
- Estimated completion: Same time as OC (1-2 hours)
- Then both proceed to Checkpoint 4 (E2E Testing with real database)

---

## 9. GitHub & Quality Review Setup

### Code Review Tools Integration

**For PRs:**
- ✅ GitHub Actions (CI/CD)
- ✅ Qodana (code quality)
- ✅ Code Rabbit (AI review)
- ✅ Sourcery (Python optimization)
- ✅ PR Scraper (context collection)

**Configuration:**
```yaml
# .github/workflows/quality.yml
name: Quality Checks

on: [pull_request, push]

jobs:
  qodana:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: JetBrains/qodana-action@main
        with:
          cache-default-branch-only: true
          fail-exit-code: 1

  code-rabbit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: coderabbit-ai/pr-review@latest

  sourcery:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: sourcery-ai/sourcery-github-action@main
```

---

## Status

**Tech Stack:** ✅ ALIGNED (minor bumps acceptable)
**Database:** ⏳ READY FOR SETUP
**Quality Checks:** ⏳ READY FOR INTEGRATION

**Next Step:** Assign database setup to GC while OC finishes Checkpoint 3.
