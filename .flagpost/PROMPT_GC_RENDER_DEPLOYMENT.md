# GC: Render.com Backend Deployment Setup

**Status:** PARALLEL TASK (Critical Path Item)
**Authority:** Direct execution approval
**Timeline:** 45-60 minutes
**Framework:** ATLAS-VM

---

## Overview

Deploy Python FastAPI backend to Render.com with full production configuration, environment variables, and Supabase database integration.

---

## Prerequisites

- Render.com account (provided credentials)
- Render MCP server access (ready to use)
- GitHub repository linked to Render
- Supabase instance created (from PROMPT_GC_SUPABASE_SETUP.md)

---

## Phase 1: Create Render Web Service

### Step 1: Use Render API to Create Service

```bash
# Set credentials
RENDER_API_KEY="[your-render-api-key]"

# Create web service via MCP
# This will create a new web service with the name "hex-ade-api"

curl -X POST https://api.render.com/v1/services \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "web_service",
    "name": "hex-ade-api",
    "repo": "https://github.com/Hex-Tech-Lab/hex-ade",
    "repoBranch": "main",
    "buildCommand": "pip install -r server/requirements.txt",
    "startCommand": "cd server && uvicorn main:app --host 0.0.0.0 --port $PORT",
    "envVars": [
      {
        "key": "PYTHON_VERSION",
        "value": "3.11"
      }
    ],
    "plan": "starter",
    "region": "frankfurt"
  }'

# Store the service ID from response
SERVICE_ID="[from response]"
```

### Step 2: Configure Environment Variables

```bash
# Set Supabase credentials in Render
curl -X POST https://api.render.com/v1/services/$SERVICE_ID/env-vars \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "envVars": [
      {
        "key": "DATABASE_URL",
        "value": "[from Supabase]"
      },
      {
        "key": "SUPABASE_URL",
        "value": "https://[project-id].supabase.co"
      },
      {
        "key": "SUPABASE_SERVICE_KEY",
        "value": "[service-role-key]"
      },
      {
        "key": "SUPABASE_ANON_KEY",
        "value": "[anon-key]"
      },
      {
        "key": "PYTHON_VERSION",
        "value": "3.11"
      }
    ]
  }'
```

### Step 3: Configure Build Settings

```bash
# Update build/start commands
curl -X PATCH https://api.render.com/v1/services/$SERVICE_ID \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "buildCommand": "pip install -r server/requirements.txt",
    "startCommand": "cd server && uvicorn main:app --host 0.0.0.0 --port $PORT",
    "dockerfile": null,
    "dockerfilePath": null
  }'
```

---

## Phase 2: Configure render.yaml (Already Created)

Verify `render.yaml` exists in project root:

```yaml
services:
  - type: web
    name: hex-ade-api
    runtime: python
    region: frankfurt
    plan: starter
    buildCommand: pip install -r server/requirements.txt
    startCommand: cd server && uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PYTHON_VERSION
        value: "3.11"
      - key: DATABASE_URL
        sync: false
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_SERVICE_KEY
        sync: false
      - key: SUPABASE_ANON_KEY
        sync: false
    healthCheckPath: /health
```

---

## Phase 3: Link GitHub Repository

### Step 1: Connect GitHub

```bash
# Via Render dashboard:
# 1. Go to dashboard.render.com
# 2. Click "New +"
# 3. Select "Web Service"
# 4. Connect GitHub repository: Hex-Tech-Lab/hex-ade
# 5. Select branch: main
```

### Step 2: Auto-Deploy Configuration

```bash
# Set auto-deploy on every push to main
# Settings → Auto-deploy: ON
```

---

## Phase 4: Deploy & Verify

### Step 1: Trigger Initial Deployment

```bash
# Push to GitHub (if not already pushed)
git push origin main

# Render will auto-deploy from render.yaml
# Check deployment status at: https://dashboard.render.com
```

### Step 2: Get Service URL

```bash
# Render will assign a URL like:
# https://hex-ade-api.onrender.com

# Verify health endpoint
curl https://hex-ade-api.onrender.com/health

# Should return:
# {"status":"healthy","uptime":...}
```

### Step 3: Verify All Endpoints

```bash
# Test all 7 endpoints on production Render instance

# Get projects (will be empty, no data in Supabase yet)
curl https://hex-ade-api.onrender.com/api/projects

# Should return:
# {"status":"success","data":{"projects":[]}}

# Test project creation
curl -X POST https://hex-ade-api.onrender.com/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"prod-test","path":"/tmp/prod-test","concurrency":3}'

# Should return: 201 with project data

# Verify data persists in Supabase
curl https://hex-ade-api.onrender.com/api/projects

# Should now show the created project
```

---

## Phase 5: Configure Frontend for Production

### Step 1: Update Frontend Environment

Edit `apps/web/.env.production`:

```
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
NEXT_PUBLIC_API_URL=https://hex-ade-api.onrender.com
```

### Step 2: Update Next.js API Routes (if any)

For any server-side API calls, use:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://hex-ade-api.onrender.com';

export async function getServerSideProps() {
  const res = await fetch(`${API_URL}/api/projects`);
  const data = await res.json();
  return { props: { projects: data.data.projects } };
}
```

---

## Phase 6: Monitoring & Logs

### Step 1: View Deployment Logs

```bash
# Via Render dashboard:
# Services → hex-ade-api → Logs

# Should show:
# INFO:     Uvicorn running on http://0.0.0.0:10000
# INFO:     Application startup complete
```

### Step 2: Monitor Performance

```bash
# Render provides:
# - CPU usage
# - Memory usage
# - Request rate
# - Error rate
# - Response time
```

### Step 3: Set Up Alerts

```bash
# Render dashboard → Alerts
# Configure for:
# - High CPU (>80%)
# - High Memory (>80%)
# - Service crashes
# - High error rate (>5%)
```

---

## Phase 7: Documentation & Verification

### Create Deployment Report

```bash
cat > .flagpost/RENDER_DEPLOYMENT_COMPLETE.md << 'EOF'
# Render Deployment Completion Report

**Date:** $(date -Iseconds)
**Service:** hex-ade-api
**Region:** Frankfurt
**Status:** ✅ LIVE

## Verified Items
- [x] Service created on Render
- [x] GitHub repository linked
- [x] Environment variables configured
- [x] Build command working
- [x] Start command working
- [x] Health endpoint responding
- [x] All 7 API endpoints verified
- [x] Database connection working
- [x] Data persistence verified
- [x] Production URL assigned

## Service Details
- **Service Name:** hex-ade-api
- **Region:** Oregon
- **Plan:** Starter
- **Python Version:** 3.11
- **URL:** https://hex-ade-api.onrender.com

## Environment Variables
- [x] DATABASE_URL: Connected to Supabase
- [x] SUPABASE_URL: Set
- [x] SUPABASE_SERVICE_KEY: Set
- [x] SUPABASE_ANON_KEY: Set

## Auto-Deploy
- [x] GitHub integration active
- [x] Auto-deploy on main branch push
- [x] Zero-downtime deployments enabled

## Monitoring
- [x] Logs accessible at dashboard
- [x] Health checks enabled
- [x] Performance metrics available
- [x] Alerts configured

## Next Steps
1. Frontend deployment to Vercel
2. Update frontend environment variables
3. Test full-stack integration
4. Monitor both services

## Timeline
- Setup: 45-60 minutes
- Ready for: Full production deployment
EOF

cat .flagpost/RENDER_DEPLOYMENT_COMPLETE.md
```

### Log Completion

```bash
cat >> .flagpost/memory.md << 'EOF'
## $(date -Iseconds) GC - RENDER DEPLOYMENT COMPLETE
**Phase:** DEPLOYMENT - Backend Infrastructure
**Action:** Created and deployed Python FastAPI backend to Render.com
**Deliverables:**
- Render web service "hex-ade-api" created
- GitHub repository linked for auto-deploy
- Environment variables configured (Supabase integration)
- All 7 endpoints verified on production
- Data persistence verified
- Monitoring and logging configured
**Service URL:** https://hex-ade-api.onrender.com
**Status:** LIVE & PRODUCTION READY
**Timeline:** 45-60 minutes
**Next:** Frontend deployment + full-stack testing
EOF
```

---

## Success Checklist

- [ ] Render account accessed
- [ ] Web service created via API/dashboard
- [ ] GitHub repository linked
- [ ] Environment variables set (DATABASE_URL + Supabase keys)
- [ ] Build command working
- [ ] Start command working
- [ ] Health endpoint responding (✅ /health)
- [ ] All 7 endpoints verified on production URL
- [ ] Data persists to Supabase
- [ ] Auto-deploy configured
- [ ] Logs accessible
- [ ] Monitoring configured
- [ ] Deployment report created
- [ ] Completion logged to memory.md

---

## Important Notes

1. **Region:** Frankfurt (EU, matches Supabase location)
2. **Plan:** Starter ($7/month, auto-scales)
3. **Auto-Deploy:** Enabled on main branch
4. **Health Check:** `/health` endpoint used for uptime monitoring
5. **Zero-Downtime:** Render handles graceful restarts
6. **Logs:** Viewable in real-time via dashboard

---

## Authority

Full execution approval. Complete this task immediately.

This is a critical path item for production deployment.

**Go!**
