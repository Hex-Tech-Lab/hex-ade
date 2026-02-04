# 🚀 GC: IMMEDIATE PARALLEL DEPLOYMENT TASKS

**Issued:** 2026-02-04T18:30:00Z
**Authority:** Full execution approval - proceed immediately
**Framework:** ATLAS-VM (Parallel dual-task execution)
**Timeline:** 75-120 minutes total (can run in parallel with coordination points)

---

## TASK 1: Create Supabase Instance (Frankfurt)
**Duration:** 30-45 minutes
**Blocking:** Task 2 (Render needs Supabase credentials)

**Execute:** Read and follow EXACTLY
```
.flagpost/PROMPT_GC_SUPABASE_SETUP.md
```

**Deliverables Expected:**
- ✅ Supabase project "hex-ade" created in Frankfurt (eu-frankfurt)
- ✅ Credentials stored in: server/.env, apps/web/.env.local, .env.production
- ✅ Migration executed (all 4 tables created with RLS)
- ✅ Backend connection verified locally
- ✅ .flagpost/SUPABASE_SETUP_COMPLETE.md created
- ✅ Completion logged to .flagpost/memory.md

**Pass Criteria:**
- Database URL: `postgresql://postgres:*@[project-id].supabase.co:5432/postgres?sslmode=require`
- All 4 tables exist: projects, features, tasks, agent_logs
- Backend can connect and query data
- POST /api/projects works (creates data that persists)

**CRITICAL:** Once you generate the Supabase credentials (DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_KEY, SUPABASE_ANON_KEY), immediately provide them in a secure format so we can proceed with Task 2.

---

## TASK 2: Deploy Backend to Render (Frankfurt)
**Duration:** 45-60 minutes
**Depends On:** Task 1 credentials

**Execute:** Read and follow EXACTLY
```
.flagpost/PROMPT_GC_RENDER_DEPLOYMENT.md
```

**You will need from Task 1:**
- DATABASE_URL
- SUPABASE_URL
- SUPABASE_SERVICE_KEY
- SUPABASE_ANON_KEY

**Deliverables Expected:**
- ✅ Render web service "hex-ade-api" created in Frankfurt region
- ✅ GitHub repository linked (Hex-Tech-Lab/hex-ade, branch: main)
- ✅ All 4 Supabase environment variables configured
- ✅ Python 3.11 runtime verified
- ✅ Auto-deploy enabled on main branch
- ✅ Service health check passes (/health endpoint)
- ✅ All 7 API endpoints tested on production URL
- ✅ .flagpost/RENDER_DEPLOYMENT_COMPLETE.md created
- ✅ Completion logged to .flagpost/memory.md

**Production URL:** https://hex-ade-api.onrender.com

**Pass Criteria:**
```bash
# Health check should return
curl https://hex-ade-api.onrender.com/health
{"status":"healthy","uptime":...}

# GET projects should work
curl https://hex-ade-api.onrender.com/api/projects
{"status":"success","data":{"projects":[...]}}
```

---

## COORDINATION POINT: Data Exchange

**When Task 1 Complete:**
Provide me with:
```
PROJECT_ID=[from supabase output]
DATABASE_URL=[from supabase output]
SUPABASE_URL=https://[PROJECT_ID].supabase.co
SUPABASE_SERVICE_KEY=[from supabase output]
SUPABASE_ANON_KEY=[from supabase output]
```

I will use this to:
1. Verify credentials are correct
2. Pre-stage the Render environment configuration
3. Signal you to proceed with Task 2

---

## EXECUTION SEQUENCE

```
START
├─ Task 1: Supabase Setup (30-45 min)
│  ├─ Create instance in Frankfurt
│  ├─ Run migrations
│  ├─ Verify backend connection
│  └─ Report credentials → WAIT for my verification
│
├─ [COORDINATION POINT - my verification]
│
└─ Task 2: Render Deployment (45-60 min)
   ├─ Create web service in Frankfurt
   ├─ Configure Supabase environment variables
   ├─ Link GitHub and enable auto-deploy
   ├─ Test all endpoints on production
   └─ Verify data persistence

TOTAL: ~75-120 minutes (accounting for verification coordination)
```

---

## MONITORING DURING EXECUTION

**I will be running in parallel:**
- ✅ Full preflight verification of all components
- ✅ Checking your progress on both tasks
- ✅ Verifying credentials and environment setup
- ✅ Testing endpoints as they come online
- ✅ Monitoring for build errors
- ✅ Validating data flow end-to-end

You will see updates from me as verification progresses.

---

## CRITICAL REMINDERS

1. **Region:** BOTH services MUST be Frankfurt (eu-frankfurt)
   - Supabase: eu-frankfurt ✅
   - Render: frankfurt ✅

2. **Credentials:** Store securely in the exact locations specified:
   - server/.env
   - apps/web/.env.local
   - .env.production

3. **GitHub Link:** The render.yaml file already exists in the repo root

4. **Auto-Deploy:** MUST be enabled so that future git pushes automatically deploy

5. **Health Check:** Verify `/health` endpoint works before declaring success

---

## SUCCESS CRITERIA (Final)

Both tasks complete when:
- ✅ Supabase instance created and verified
- ✅ All 4 database tables exist with RLS enabled
- ✅ Render service deployed and responding on production URL
- ✅ All 7 API endpoints verified on production
- ✅ Data persists from production API to production database
- ✅ Auto-deploy configured and tested
- ✅ Both completion reports created

---

## YOU ARE CLEARED FOR IMMEDIATE EXECUTION

This is the critical path to production.

**Go!**
