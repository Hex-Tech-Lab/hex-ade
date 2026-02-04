# GC: Database Setup & Supabase Integration

**Status:** PARALLEL TASK (while OC finishes frontend wiring)
**Assignment:** GC (Backend Agent)
**Timeline:** 3-3.5 hours
**Framework:** GOTCHA + ATLAS-VM

---

## Task Overview

While OC finishes wiring frontend components, you'll set up the complete database infrastructure:

1. **Supabase Setup** - Create instance in Frankfurt region
2. **Database Schema** - Create all tables with constraints
3. **RLS Policies** - Configure row-level security
4. **SQLAlchemy Integration** - Connect Python backend to Supabase
5. **Drizzle Setup** - Add TypeScript ORM for Next.js
6. **Quality Checks** - Validate all connections

---

## ATLAS-VM Sequence

### Step 1: AUDIT
```bash
# Check current database setup
ls -la server/api/
grep -i "database\|sqlalchemy\|supabase" server/requirements.txt
grep -i "database" server/.env.example || echo "No .env example"
```

Verify: SQLAlchemy is installed ✓

### Step 2: TIMEBOX
Estimate: 3-3.5 hours
Complexity: Moderate
Phases: 5 (Supabase, Schema, SQLAlchemy, Drizzle, QA)

### Step 3: LOAD (Context)
```bash
# Review tech stack decision
cat .flagpost/TECH_STACK_AUDIT.md | head -50

# Check frontend dependencies
cd apps/web && cat package.json | grep -A5 "dependencies" | head -10
```

Current Tech Stack:
- Backend: SQLAlchemy 2.0+ ✓
- Frontend: Zustand, React Query ✓
- Database: **NOT YET SET UP** ← Your task
- ORM: SQLAlchemy for Python + Drizzle for TypeScript

### Step 4: ASSEMBLE (Execute)

#### Task 4.1: Create Supabase Instance

**You will receive credentials after this step completes.**

Supabase setup includes:
- Project name: `hex-ade`
- Region: Frankfurt (eu-central-1)
- Database: PostgreSQL 15+
- Auth enabled (for future)
- RLS enabled

**Credentials needed in .env:**
```
SUPABASE_URL=https://[project-id].supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
DATABASE_URL=postgresql://postgres:[password]@[host]:6543/postgres
```

---

#### Task 4.2: Create Database Schema

Create file: `supabase/migrations/001_initial_schema.sql`

```sql
-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  path VARCHAR(1024) NOT NULL,
  has_spec BOOLEAN DEFAULT FALSE,
  default_concurrency INT DEFAULT 3,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  CONSTRAINT concurrency_range CHECK (default_concurrency BETWEEN 1 AND 5)
);

-- Features table
CREATE TABLE IF NOT EXISTS features (
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

-- Tasks table (execution history)
CREATE TABLE IF NOT EXISTS tasks (
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

-- Agent logs table
CREATE TABLE IF NOT EXISTS agent_logs (
  id BIGSERIAL PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  agent_name VARCHAR(255),
  log_level VARCHAR(20),
  message TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_features_project ON features(project_id);
CREATE INDEX IF NOT EXISTS idx_features_status ON features(status);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_project ON agent_logs(project_id, created_at DESC);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;
```

#### Task 4.3: Configure RLS Policies

```sql
-- Projects policies
CREATE POLICY "Projects are viewable by creator"
  ON projects FOR SELECT
  USING (created_by = auth.uid() OR created_by IS NULL);

CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (created_by = auth.uid());

-- Similar policies for features, tasks, agent_logs
-- (See TECH_STACK_AUDIT.md for details)
```

#### Task 4.4: Update SQLAlchemy Connection

Edit `server/api/database.py`:

```python
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Get database URL from Supabase
DATABASE_URL = os.getenv("DATABASE_URL")
# Replace postgres:// with postgresql:// if needed
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Add ?sslmode=require for production
if "sslmode" not in DATABASE_URL:
    DATABASE_URL += "?sslmode=require"

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

#### Task 4.5: Add Drizzle ORM (Next.js)

```bash
# 1. Add dependencies
cd apps/web
pnpm add drizzle-orm @supabase/supabase-js
pnpm add -D drizzle-kit typescript

# 2. Create schema file: src/db/schema.ts
```

```typescript
// apps/web/src/db/schema.ts
import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  bigserial,
  check,
} from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  path: varchar("path", { length: 1024 }).notNull(),
  hasSpec: boolean("has_spec").default(false),
  defaultConcurrency: integer("default_concurrency").default(3),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: uuid("created_by"),
});

export const features = pgTable("features", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).default("FUNCTIONAL"),
  priority: integer("priority").default(0),
  status: varchar("status", { length: 50 }).default("pending"),
  passes: boolean("passes").default(false),
  inProgress: boolean("in_progress").default(false),
  steps: jsonb("steps").default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Similar for tasks, agent_logs...
```

```typescript
// apps/web/src/db/client.ts
import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// For server-side operations
const queryClient = postgres(process.env.DATABASE_URL!);
export const db = drizzle(queryClient, { schema });
```

#### Task 4.6: Test Connections

```bash
# Test Python backend connection
cd server
python -c "
from sqlalchemy import create_engine
import os
db_url = os.getenv('DATABASE_URL')
if db_url.startswith('postgres://'):
    db_url = db_url.replace('postgres://', 'postgresql://', 1)
engine = create_engine(db_url)
with engine.connect() as conn:
    result = conn.execute('SELECT 1')
    print('✓ SQLAlchemy connection OK')
"

# Test TypeScript compilation
cd apps/web
pnpm exec tsc --noEmit
echo "✓ TypeScript compilation OK"
```

### Step 5: SCAN (Quality Check)

```bash
# Validate schema
psql -d hex-ade -c "\dt"  # List tables
psql -d hex-ade -c "\l"   # List databases

# Check for errors
pnpm build 2>&1 | grep -i "error" && echo "❌ Errors found" || echo "✅ No build errors"

# Type check
pnpm exec tsc --noEmit
```

### Step 6: VALIDATE

Create `.flagpost/qa_database.md`:

```markdown
# Database QA Report

**Date:** [date]
**Agent:** GC

## Supabase Setup
- [ ] Instance created in Frankfurt
- [ ] Connection string verified
- [ ] Auth enabled

## Schema
- [ ] projects table created
- [ ] features table created
- [ ] tasks table created
- [ ] agent_logs table created
- [ ] All constraints applied
- [ ] All indexes created

## RLS Policies
- [ ] Projects policies applied
- [ ] Features policies applied
- [ ] Tasks policies applied
- [ ] Agent logs policies applied

## Integrations
- [ ] SQLAlchemy connects successfully
- [ ] Drizzle schema compiles
- [ ] Environment variables set
- [ ] No build errors

## Status: [PASS/FAIL]
```

### Step 7: MEMORY

Log to `.flagpost/memory.md`:

```markdown
## [TIMESTAMP] GC - DATABASE SETUP COMPLETE
**Phase:** INTEGRATION - Database Infrastructure
**Step:** 7 (MEMORY)
**Action:** Set up Supabase instance + schema + Drizzle ORM
**Deliverables:**
- Supabase project created (Frankfurt region)
- PostgreSQL schema with 4 tables
- RLS policies configured
- SQLAlchemy integration complete
- Drizzle ORM schema defined
- All connections tested
**Status:** COMPLETE
**Timeline:** 3-3.5 hours
**Next:** Await OC completion, then both proceed to E2E testing with real database
```

Update `.flagpost/status.json`:
```json
{
  "gc": {
    "status": "completed",
    "task": "Database Setup & Integration",
    "database_ready": true,
    "schema_verified": true,
    "orm_configured": true
  }
}
```

---

## Success Criteria

- [ ] Supabase instance created (Frankfurt)
- [ ] All 4 tables created with constraints
- [ ] RLS policies enabled
- [ ] SQLAlchemy connection tested
- [ ] Drizzle schema defined and compiles
- [ ] pnpm build succeeds
- [ ] No type errors
- [ ] Logged to memory.md
- [ ] Status updated

---

## Files to Create/Modify

```
supabase/migrations/
└── 001_initial_schema.sql          [CREATE]

server/
├── .env                            [UPDATE with Supabase creds]
└── api/database.py                 [UPDATE connection]

apps/web/
├── .env.local                      [UPDATE with Supabase keys]
├── src/db/
│   ├── schema.ts                   [CREATE]
│   └── client.ts                   [CREATE]
└── package.json                    [UPDATE with drizzle deps]

.flagpost/
├── qa_database.md                  [CREATE]
└── memory.md                        [APPEND completion]
```

---

## Timeline

- Supabase setup: 30 min
- Schema creation: 45 min
- SQLAlchemy integration: 1 hour
- Drizzle setup: 45 min
- QA & testing: 30 min
- **Total: 3-3.5 hours**

---

## Go Time!

You have everything you need. Start with Supabase setup, then work through each task in sequence.

**You will receive Supabase credentials separately.**

Ready? Let's build the database!
