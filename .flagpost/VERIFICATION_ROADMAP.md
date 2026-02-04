# 🔍 VERIFICATION ROADMAP - Parallel to GC Tasks

**Auditor:** Claude Code
**Timeline:** Concurrent with GC TASK 1 & 2
**Authority:** Independent verification
**Framework:** ATLAS-VM Step 6 (SCAN & VALIDATE)

---

## PHASE 0: PRE-EXECUTION VERIFICATION (NOW)

### Environment & Dependencies Check
- [ ] Verify all source files in place
  - [ ] server/main.py has all 7 endpoints
  - [ ] server/requirements.txt has psycopg2-binary
  - [ ] apps/web/package.json has @supabase/supabase-js + drizzle
  - [ ] supabase/migrations/001_initial_schema.sql has 4 tables
  - [ ] render.yaml exists and has correct start command
  - [ ] apps/web/.env.local example exists for reference

### Architecture Verification
- [ ] API contract alignment (7/7 endpoints match)
- [ ] Response schema consistency (all use status/data/meta wrapper)
- [ ] Database schema completeness (4 tables with correct columns)
- [ ] Environment variable list complete (15+ expected variables)

### Build Status
- [ ] No TypeScript errors in frontend
- [ ] No Python linting issues in backend
- [ ] No missing dependencies in package.json
- [ ] No missing dependencies in requirements.txt

---

## PHASE 1: GC TASK 1 EXECUTION - SUPABASE SETUP (30-45 min)

### While GC creates Supabase instance:

#### Step 1a: Verify Instance Creation in Progress
- [ ] Confirm Frankfurt region selection
- [ ] Confirm project name "hex-ade"
- [ ] Confirm credentials being generated (ANON_KEY, SERVICE_KEY, etc.)

#### Step 1b: Pre-Validate Credential Format
Once GC provides credentials, verify:
- [ ] DATABASE_URL format: `postgresql://postgres:PASSWORD@HOST:5432/postgres?sslmode=require`
- [ ] SUPABASE_URL format: `https://PROJECT_ID.supabase.co`
- [ ] SUPABASE_SERVICE_KEY length (typically 200+ chars, Base64)
- [ ] SUPABASE_ANON_KEY length (typically 150+ chars, Base64)

#### Step 1c: File Placement Verification
Confirm GC stored credentials in:
- [ ] server/.env (contains DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_KEY, SUPABASE_ANON_KEY)
- [ ] apps/web/.env.local (contains NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
- [ ] .env.production (contains NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)

#### Step 1d: Migration Verification
Verify migration ran successfully:
- [ ] 4 tables exist: projects, features, tasks, agent_logs
- [ ] All columns present in each table
- [ ] Primary keys created
- [ ] Indexes created (on name, status, etc.)
- [ ] RLS policies enabled on all tables
- [ ] Constraints in place (NOT NULL, UNIQUE, FOREIGN KEY)

#### Step 1e: Data Insertion Test
- [ ] Test data can be inserted into projects table
- [ ] Test data can be inserted into other tables
- [ ] Test data can be queried back
- [ ] Timestamps working correctly

#### Step 1f: Backend Connection Verification
- [ ] Backend starts with DATABASE_URL from server/.env
- [ ] GET /api/projects returns the test data
- [ ] POST /api/projects creates new data
- [ ] Data persists across requests

**Expected Completion Signal:** GC provides "SUPABASE_SETUP_COMPLETE.md" + credentials

---

## PHASE 2: GC TASK 2 EXECUTION - RENDER DEPLOYMENT (45-60 min)

### Parallel verification while GC deploys to Render:

#### Step 2a: Render Service Creation
- [ ] Service created via Render API/Dashboard
- [ ] Service name: hex-ade-api
- [ ] Region: frankfurt ✅ (CORRECTED)
- [ ] Plan: starter
- [ ] Python 3.11 runtime selected

#### Step 2b: GitHub Integration
- [ ] Repository linked: Hex-Tech-Lab/hex-ade
- [ ] Branch: main selected
- [ ] Auto-deploy enabled
- [ ] Webhook configured (Render → GitHub)

#### Step 2c: Build Command Verification
- [ ] Build command: `pip install -r server/requirements.txt`
- [ ] Start command: `cd server && uvicorn main:app --host 0.0.0.0 --port $PORT`
- [ ] Health check: `/health` endpoint

#### Step 2d: Environment Variables Configuration
Verify all 4 Supabase credentials set in Render:
- [ ] DATABASE_URL (from Task 1)
- [ ] SUPABASE_URL (from Task 1)
- [ ] SUPABASE_SERVICE_KEY (from Task 1)
- [ ] SUPABASE_ANON_KEY (from Task 1)
- [ ] PYTHON_VERSION=3.11

#### Step 2e: Deployment Logs Monitoring
- [ ] Build starts (pip install begins)
- [ ] All dependencies download successfully
- [ ] No build failures
- [ ] Uvicorn starts listening on assigned port
- [ ] Application startup complete message

#### Step 2f: Service Health Check (CRITICAL)
```bash
curl https://hex-ade-api.onrender.com/health
# Must return: {"status":"healthy","uptime":...}
```

#### Step 2g: Production Endpoint Testing
Test all 7 endpoints on production URL:
- [ ] GET /api/projects → {"status":"success","data":{"projects":[...]}}
- [ ] POST /api/projects → Creates project, returns 201
- [ ] GET /api/projects/{name} → Returns specific project
- [ ] GET /api/projects/{name}/stats → Returns stats
- [ ] GET /api/projects/{name}/features → Returns features array
- [ ] DELETE /api/projects/{name} → Deletes and returns 204 or success
- [ ] WS /ws/projects/{name} → WebSocket connection establishes

#### Step 2h: Data Persistence Test
- [ ] Create project via POST on production Render service
- [ ] Query same project via GET on production Render service
- [ ] Verify data is in production Supabase database
- [ ] Create feature via Render, verify in Supabase

**Expected Completion Signal:** GC provides "RENDER_DEPLOYMENT_COMPLETE.md" with service URL

---

## PHASE 3: CROSS-VERIFICATION (Comprehensive End-to-End)

### Once both GC tasks complete:

#### Step 3a: Three-Tier Architecture Validation
- [ ] Frontend URLs configured to point to Render production
- [ ] Render backend URLs configured to point to Supabase Frankfurt
- [ ] Supabase credentials match between services
- [ ] No hardcoded localhost URLs remaining

#### Step 3b: Data Flow Testing
```
Vercel Frontend → Render Backend → Supabase Database → Back through chain
```
- [ ] Create project through frontend UI (if available)
- [ ] Verify it appears in Render API response
- [ ] Verify it persists in Supabase database
- [ ] Verify it displays back in frontend

#### Step 3c: Error Handling Verification
- [ ] Invalid project name returns proper error
- [ ] Missing required fields return proper error
- [ ] Database connection error handled gracefully
- [ ] All responses follow standard wrapper format

#### Step 3d: Region Consistency Audit
- [ ] ✅ Supabase: Frankfurt (eu-frankfurt)
- [ ] ✅ Render: Frankfurt (frankfurt)
- [ ] ✅ Vercel: Auto-deploys to global edge network (optimal routing to Frankfurt backend)
- [ ] ✅ DNS: ade.getmytestdrive.com points to Vercel (separate task, not critical now)

---

## VERIFICATION OUTPUTS

### I will produce:
1. **VERIFICATION_RESULTS.md** - Complete audit findings
2. **QUALITY_GATES_PASSED.md** - Confirmation of all checks
3. **PRODUCTION_READINESS_REPORT.md** - Final sign-off
4. **Live endpoint tests** - Showing production URLs responding correctly

### Format:
```
✅ VERIFIED - Description of what passed
⚠️  INVESTIGATION NEEDED - Description of concern
❌ FAILED - Description of blocker
```

---

## TIMELINE

```
T+0:00    GC receives GC_IMMEDIATE_TASKS.md
T+0:30    GC completes Task 1 (Supabase), provides credentials
T+0:35    I verify Supabase setup, signal Task 2 ready
T+1:30    GC completes Task 2 (Render), provides service URL
T+1:45    I complete comprehensive verification
T+2:00    PRODUCTION READINESS CONFIRMED
```

---

## CRITICAL VERIFICATION CHECKS (Fail-Blockers)

These MUST pass or deployment cannot proceed:

1. **Database Connectivity:** Backend can query Supabase ✅ or ❌
2. **All 7 Endpoints:** Each endpoint responds on production ✅ or ❌
3. **Data Persistence:** Create → Query → Verify cycle works ✅ or ❌
4. **Environment Variables:** All credentials correctly set ✅ or ❌
5. **Region Consistency:** Frankfurt on both services ✅ or ❌
6. **Health Check:** /health endpoint responding ✅ or ❌
7. **Auto-Deploy:** GitHub → Render pipeline working ✅ or ❌

---

## I AM READY

Waiting for GC to provide credentials at Task 1 completion.

Will proceed with verification immediately upon receiving them.
