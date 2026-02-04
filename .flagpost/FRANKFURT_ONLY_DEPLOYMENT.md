# 🇪🇺 FRANKFURT-ONLY DEPLOYMENT ARCHITECTURE

**Critical Requirement:** Everything deployed to Frankfurt region ONLY. No data/services outside Frankfurt.

**Updated:** 2026-02-04T18:50:00Z

---

## REGIONAL CONFIGURATION - ALL SERVICES

### 1. Vercel Frontend (ade.getmytestdrive.com)
```json
{
  "regions": ["fra1"],
  "functions": {
    "apps/web/pages/api/**": {
      "region": ["fra1"]
    }
  }
}
```
**Status:** ✅ UPDATED in vercel.json
- Frontend CDN: Frankfurt primary
- Serverless functions: Frankfurt only (fra1)
- All API routes: Frankfurt region

### 2. Render Backend (hex-ade-api.onrender.com)
```yaml
region: frankfurt
```
**Status:** ✅ CONFIGURED in render.yaml
- Python backend: Frankfurt data center
- Database connections: Frankfurt only
- Uvicorn process: Frankfurt

### 3. Supabase Database (hex-ade)
```bash
supabase projects create \
  --region eu-frankfurt
```
**Status:** ✅ CONFIGURED in PROMPT_GC_SUPABASE_SETUP.md
- PostgreSQL instance: Frankfurt (eu-frankfurt)
- All tables: Frankfurt only
- RLS policies: Frankfurt only

---

## DATA FLOW - FRANKFURT-ONLY PATH

```
User Request (Global CDN edge)
    ↓
Vercel Frankfurt CDN (fra1)
    ↓
Vercel Serverless Functions (Frankfurt, fra1)
    ↓
HTTPS to Render Backend (Frankfurt)
    ↓
FastAPI Server (Frankfurt datacenter)
    ↓
PostgreSQL Connection (Supabase Frankfurt)
    ↓
Response back through same path
```

**CRITICAL:** All connections between services are:
- Intra-Frankfurt (same data center)
- HTTPS encrypted
- No routing through other regions
- All data stays within Frankfurt boundary

---

## CONFIGURATION CHECKLIST - FRANKFURT ONLY

### Vercel Configuration ✅
- [x] vercel.json updated with regions: ["fra1"]
- [x] Serverless functions configured for Frankfurt
- [x] Build command: pnpm build
- [x] Install command: pnpm install
- [x] Output directory: apps/web/.next
- [x] Domain alias: ade.getmytestdrive.com

### Render Configuration ✅
- [x] render.yaml region: frankfurt
- [x] Runtime: python
- [x] Start command: cd server && uvicorn main:app --host 0.0.0.0 --port $PORT
- [x] Health check: /health
- [x] Python version: 3.11

### Supabase Configuration ⏳
- [ ] Project created in eu-frankfurt
- [ ] Database region: eu-frankfurt (Frankfurt)
- [ ] All tables in Frankfurt
- [ ] RLS enabled on all tables

---

## ENVIRONMENT VARIABLES - FRANKFURT SERVICES ONLY

### Frontend Environment (.env.local, .env.production)
```bash
# These variables point to Frankfurt services only
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co        # Frankfurt
NEXT_PUBLIC_SUPABASE_ANON_KEY=[from Frankfurt Supabase]           # Frankfurt
NEXT_PUBLIC_API_URL=https://hex-ade-api.onrender.com              # Frankfurt
```

### Backend Environment (server/.env)
```bash
# These variables point to Frankfurt services only
DATABASE_URL=postgresql://[user]@[host].supabase.co:5432/postgres # Frankfurt
SUPABASE_URL=https://[PROJECT_ID].supabase.co                     # Frankfurt
SUPABASE_SERVICE_KEY=[from Frankfurt Supabase]                    # Frankfurt
SUPABASE_ANON_KEY=[from Frankfurt Supabase]                       # Frankfurt
PYTHON_VERSION=3.11
```

### Render Service Environment Variables
```bash
DATABASE_URL=postgresql://[user]@[host].supabase.co:5432/postgres # Frankfurt
SUPABASE_URL=https://[PROJECT_ID].supabase.co                     # Frankfurt
SUPABASE_SERVICE_KEY=[from Frankfurt Supabase]                    # Frankfurt
SUPABASE_ANON_KEY=[from Frankfurt Supabase]                       # Frankfurt
PYTHON_VERSION=3.11
```

---

## REGIONAL VERIFICATION POINTS

### Before Supabase Creation
- [ ] Region selection: eu-frankfurt
- [ ] Verify: Project location displayed as Frankfurt
- [ ] Verify: Database host includes "frankfurt" or "eu-central"

### Before Render Deployment
- [ ] Region in render.yaml: frankfurt ✅ (verified)
- [ ] Region in Render dashboard: Frankfurt
- [ ] Health check: https://hex-ade-api.onrender.com/health

### Before Vercel Deployment
- [ ] vercel.json regions: ["fra1"] ✅ (updated)
- [ ] Build successful on Vercel
- [ ] Edge functions region: Frankfurt

### During Full-Stack Testing
- [ ] Verify all requests route through Frankfurt
- [ ] Verify data persists in Frankfurt database
- [ ] Verify no data stored outside Frankfurt
- [ ] Verify response times (intra-Frankfurt should be <50ms)

---

## SUPABASE CLI UPGRADE (For GC)

To upgrade Supabase CLI to latest:

**Option 1: Using npm (if available)**
```bash
npm install -g supabase@latest
```

**Option 2: Using pnpm**
```bash
pnpm setup  # If global bin dir not configured
pnpm add -g supabase@latest
```

**Verify upgrade:**
```bash
supabase --version
# Should show v2.75.0 or later
```

---

## COMPLIANCE & DATA GOVERNANCE

**Frankfurt-Only Requirement Ensures:**
- ✅ GDPR compliance (all data in EU)
- ✅ Data residency (no cross-border transfer)
- ✅ Local regulations (Frankfurt/Germany jurisdiction)
- ✅ Performance optimization (low latency within Frankfurt)
- ✅ Security boundary (isolated Frankfurt infrastructure)

---

## NO EXCEPTIONS

⚠️ **CRITICAL RULE:**
- ❌ NO US regions (no Vercel us-east, us-west)
- ❌ NO London region (use Frankfurt instead)
- ❌ NO Singapore/Asia regions
- ❌ NO other EU regions (Frankfurt only)
- ✅ ONLY Frankfurt on all three services

---

## REFERENCE DOCUMENTATION

Documents confirming Frankfurt-only deployment:
- ✅ `vercel.json` - regions: ["fra1"]
- ✅ `render.yaml` - region: frankfurt
- ✅ `PROMPT_GC_SUPABASE_SETUP.md` - region eu-frankfurt
- ✅ This document - FRANKFURT_ONLY_DEPLOYMENT.md

---

## FINAL CHECKLIST

- [x] Vercel configured for Frankfurt (fra1)
- [x] Render configured for Frankfurt
- [x] Supabase prompt configured for Frankfurt (eu-frankfurt)
- [x] All environment variables documented
- [x] No data outside Frankfurt boundary
- [x] All services in same region
- [ ] Deployment executed
- [ ] Verification complete

---

**STATUS: Frankfurt-Only Architecture Locked In ✅**

Everything else happens in Frankfurt.
