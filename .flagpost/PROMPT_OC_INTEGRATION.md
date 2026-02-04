# OC Integration Phase Prompt

**Agent:** OC (Kimi K2.5)
**Role:** Frontend Integration & API Wiring
**Workspace:** `/home/kellyb_dev/projects/hex-ade`
**Phase:** INTEGRATION (GOTCHA Phase 4)
**Timeline:** Starting 2026-02-04

---

## HANDOFF FROM GC

GC has completed backend QA and deployment prep. Backend is production-ready.

**Read:** `.flagpost/HANDOFF_GC_TO_OC.md` for context.

---

## YOUR TASK: Frontend → Backend Integration

### GOTCHA Phase: INTEGRATION
### ATLAS-VM Sequence:

#### Step 1: LOAD (Context)
```bash
# Check current state
cd /home/kellyb_dev/projects/hex-ade/apps/web
pnpm build 2>&1 | tail -20

# Review pages that need integration
ls -la src/app/
ls -la src/components/

# Check current API usage
grep -r "fetch\|axios\|api" src/ --include="*.ts" --include="*.tsx" | head -20
```

#### Step 2: AUDIT
Verify frontend readiness:
```bash
# Build must pass
pnpm build

# Linting must pass
pnpm lint

# Type checking must pass
pnpm exec tsc --noEmit
```

If any failures, fix before proceeding.

#### Step 3: ASSEMBLE (Execute)

**Task 3.1: Define API Contract**

Create file: `.flagpost/API_CONTRACT.md`

Document all endpoints OC will use:
```markdown
# API Contract for Frontend

## Endpoints Needed

### 1. GET /api/projects
**Purpose:** Fetch all projects for current user
**Request:** GET /api/projects
**Response:**
```json
{
  "projects": [
    {
      "id": "string",
      "name": "string",
      "status": "pending|in_progress|complete",
      "created_at": "ISO8601",
      "tasks_count": "number"
    }
  ]
}
```

### 2. POST /api/projects
**Purpose:** Create new project
**Request:** POST /api/projects
**Body:**
```json
{
  "name": "string",
  "description": "string"
}
```

### 3. GET /api/tasks?project_id=X
**Purpose:** Fetch tasks for a project
**Response:**
```json
{
  "tasks": [
    {
      "id": "string",
      "title": "string",
      "status": "pending|in_progress|complete",
      "project_id": "string"
    }
  ]
}
```

(Continue documenting all endpoints your components need)
```

**Task 3.2: Create API Client**

Create: `apps/web/src/lib/api.ts`

```typescript
// Base API client
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Example wrappers
export function getProjects() {
  return apiCall('/api/projects');
}

export function createProject(data: { name: string; description: string }) {
  return apiCall('/api/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getTasks(projectId: string) {
  return apiCall(`/api/tasks?project_id=${projectId}`);
}
```

**Task 3.3: Wire Components to APIs**

For each page that needs API integration:

1. **Replace mock data** with real API calls
2. **Add loading state** while fetching
3. **Add error handling** for failed requests
4. **Add success feedback** when data loads

Example pattern:
```typescript
// Before: Mock data
const [projects] = useState([
  { id: '1', name: 'Project 1', status: 'pending' },
]);

// After: API integration
const [projects, setProjects] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  (async () => {
    try {
      setLoading(true);
      const data = await getProjects();
      setProjects(data.projects);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  })();
}, []);

// Show loading
if (loading) return <CircularProgress />;
if (error) return <Alert severity="error">{error}</Alert>;
```

**Pages to Integrate (Priority Order):**
1. `/` (Dashboard) - Needs projects list + metrics
2. `/projects` - Needs full projects list with CRUD
3. `/projects/new` - POST to create project

#### Step 4: SCAN (Quality Check)

```bash
cd /home/kellyb_dev/projects/hex-ade/apps/web

# Lint
pnpm lint 2>&1 | tee ../../.flagpost/lint_integration.log

# Type check
pnpm exec tsc --noEmit 2>&1 | tee ../../.flagpost/typecheck_integration.log

# Build
pnpm build 2>&1 | tee ../../.flagpost/build_integration.log

# Check for errors
echo "Lint errors: $(grep -c 'error' ../../.flagpost/lint_integration.log || echo 0)"
echo "Type errors: $(grep -c 'error' ../../.flagpost/typecheck_integration.log || echo 0)"
echo "Build errors: $(grep -c 'error' ../../.flagpost/build_integration.log || echo 0)"
```

**QUALITY GATE:** Build must have 0 errors before proceeding.

#### Step 5: VALIDATE

Create comprehensive test:
```bash
# Test API connectivity (if backend is running)
curl http://localhost:8000/health

# Test frontend builds
pnpm build
```

#### Step 6: MEMORY

Log to `.flagpost/memory.md`:

```markdown
## [TIMESTAMP] OC - INTEGRATION PHASE
**Phase:** INTEGRATION
**Step:** 6 (VALIDATE)
**Action:** Wired frontend components to backend APIs
**Files Modified:** [list]
**API Endpoints Used:** [list]
**Quality Gate:** [PASS/FAIL]
**Blockers:** [list or "none"]
**Learning:** [key insights]
**Next:** [what's next]
```

#### Step 7: REPORT

Update `.flagpost/status.json`:
```json
{
  "oc": {
    "status": "completed",
    "task": "API Integration",
    "phase": "INTEGRATION",
    "step": 7
  },
  "shared": {
    "quality_gate_passed": true,
    "last_lint": "PASS",
    "last_typecheck": "PASS",
    "current_phase": "INTEGRATION",
    "next_milestone": "E2E Testing"
  }
}
```

---

## SUCCESS CRITERIA

- [ ] API Contract documented
- [ ] API client created
- [ ] All pages wired to APIs
- [ ] Loading states work
- [ ] Error handling works
- [ ] pnpm build passes (0 errors)
- [ ] pnpm lint passes
- [ ] Memory logged
- [ ] Status updated

---

## BLOCKING PROTOCOL

If you need something from GC (e.g., specific endpoint details):

```bash
echo "## $(date -Iseconds) OC - MEDIUM
**Task**: API Integration
**Blocker**: Need clarification on [endpoint/schema]
**Needs**: GC to provide [specific details]
**Status**: open
" >> .flagpost/blockers.md
```

Then update status:
```bash
# This blocks further OC work
cat .flagpost/status.json | jq '.oc.blocking = true | .oc.waiting_for = "gc"' > /tmp/s.json && mv /tmp/s.json .flagpost/status.json
```

---

## ENVIRONMENT VARIABLES

Add to `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

For production (Vercel):
```
NEXT_PUBLIC_API_URL=https://api.getmytestdrive.com
```

---

## START HERE

1. Read `.flagpost/HANDOFF_GC_TO_OC.md`
2. Run Step 1: LOAD to understand current state
3. Run Step 2: AUDIT to verify readiness
4. Follow Steps 3-7 in order
5. Report status when complete

Good luck! Backend is ready. Time to wire it all together.
