# ✅ CHECKPOINT 1 APPROVED → MOVING TO CHECKPOINT 2

**Date:** 2026-02-04
**Approval:** Auditor (Claude) - 100% endpoint alignment verified
**Status:** API CONTRACT APPROVED - PROCEED TO IMPLEMENTATION

---

## 🎯 CHECKPOINT 2: Backend Verification + Frontend Wiring

### For GC (Backend):

**Task:** Verify production readiness of endpoints

```bash
# 1. Verify each endpoint is working
curl http://localhost:8000/health
curl http://localhost:8000/api/projects
curl -X POST http://localhost:8000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"test","path":"/tmp/test","concurrency":3}'

# 2. Confirm response schemas match API_CONTRACT.md
# 3. Test error cases (invalid input, missing project, etc.)
# 4. Update .flagpost/status.json when verified
```

**Success Criteria:**
- [ ] All 7 endpoints tested and working
- [ ] Response schemas match contract
- [ ] Error codes documented and working
- [ ] Logged to memory.md
- [ ] Updated status.json to VERIFIED

---

### For OC (Frontend):

**Task:** Wire components to real APIs

**Step 1:** Create API client library
```bash
touch apps/web/src/lib/api.ts
```

**Step 2:** Add environment variable
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Step 3:** Implement API client
```typescript
// apps/web/src/lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

// Specific endpoints
export const getProjects = () => apiCall('/api/projects');
export const createProject = (data: any) =>
  apiCall('/api/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
export const deleteProject = (name: string) =>
  apiCall(`/api/projects/${name}`, { method: 'DELETE' });
export const getProjectStats = (name: string) =>
  apiCall(`/api/projects/${name}/stats`);
export const getProjectFeatures = (name: string) =>
  apiCall(`/api/projects/${name}/features`);
```

**Step 4:** Wire Dashboard page
```typescript
// apps/web/src/app/page.tsx
import { getProjects, getProjectStats, getProjectFeatures } from '@/lib/api';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [stats, setStats] = useState(null);
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getProjects();
        setProjects(data.data.projects);
      } catch (err) {
        console.error('Failed to load projects:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    (async () => {
      try {
        const [statsData, featuresData] = await Promise.all([
          getProjectStats(selectedProject),
          getProjectFeatures(selectedProject),
        ]);
        setStats(statsData.data);
        setFeatures(featuresData.data.features);
      } catch (err) {
        console.error('Failed to load project data:', err);
      }
    })();
  }, [selectedProject]);

  if (loading) return <CircularProgress />;

  return (
    <div>
      <ProjectSelector
        projects={projects}
        onSelect={setSelectedProject}
      />
      {selectedProject && (
        <>
          <MetricsBar stats={stats} />
          <KanbanBoard features={features} />
        </>
      )}
    </div>
  );
}
```

**Step 5:** Wire Projects page
```typescript
// Similar pattern - fetch from getProjects(), handle delete with deleteProject()
```

**Step 6:** Wire New Project page
```typescript
// Use createProject() in form submission handler
```

**Step 7:** Test and verify
```bash
cd apps/web
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

**Success Criteria:**
- [ ] API client created
- [ ] All pages wired to APIs
- [ ] Loading states show while fetching
- [ ] Error states handled
- [ ] Build passes with 0 errors
- [ ] Logged to memory.md
- [ ] Updated status.json to COMPLETED

---

## 🔄 Dependency Chain

```
GC: Verify endpoints are production-ready ↓
OC: Create API client library
     ↓
OC: Wire Dashboard page → Test
OC: Wire Projects page → Test
OC: Wire New Project page → Test
     ↓
Both: Run full pnpm build test
     ↓
CHECKPOINT 3: E2E Testing
```

---

## 📊 Timeline Estimate

- GC verification: 30-45 min
- OC API client: 15-30 min
- OC wiring (3 pages): 1-1.5 hours
- Testing & build: 30-45 min
- **Total: 2.5-3.5 hours**

---

## 📝 Progress Tracking

**GC:** Update status.json with verification results
```json
{
  "gc": {
    "task": "Backend Endpoint Verification",
    "status": "in_progress",
    "endpoints_verified": "0/7"
  }
}
```

**OC:** Update status.json with wiring progress
```json
{
  "oc": {
    "task": "Frontend API Wiring",
    "status": "in_progress",
    "pages_wired": "0/3"
  }
}
```

---

## 🎯 Success Checklist

**GC:**
- [ ] All 7 endpoints tested
- [ ] Schemas verified
- [ ] Status updated

**OC:**
- [ ] API client created
- [ ] 3 pages wired
- [ ] Build passes (0 errors)
- [ ] Status updated

**Both:**
- [ ] Memory logged
- [ ] Ready for E2E testing

---

**Start:** NOW
**Approval:** ✅ OFFICIAL (API contract approved)
**Authority:** Auditor (Claude Code)

Go ahead and execute Checkpoint 2!
