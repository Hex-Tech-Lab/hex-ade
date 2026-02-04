# Render Backend Root Cause Analysis

**Status:** ROOT CAUSE IDENTIFIED & SOLUTION READY
**Date:** 2026-02-04
**Impact:** CRITICAL - Backend completely unavailable

---

## The Problem (In Plain English)

Your Render backend crashes with "Exited with status 1" because the application cannot find the database connection information. Here's why:

1. **Local Development:** Your `server/.env` file contains `DATABASE_URL`
2. **Render Production:** Render doesn't automatically read local `.env` files
3. **What Happens:** App starts, looks for `DATABASE_URL`, finds nothing
4. **Fallback:** Code defaults to SQLite (local file-based database)
5. **Crash:** Render's container has a read-only filesystem → SQLite initialization fails → App crashes

---

## Technical Root Cause

### File: `server/api/database.py` (Line 180-181)

```python
DATABASE_URL = os.getenv("DATABASE_URL")  # ← Returns None on Render
# ...
engine = create_engine(
    DATABASE_URL or "sqlite:///./hex_ade.db",  # ← Falls back to SQLite when DATABASE_URL is None
    **engine_kwargs
)
```

### File: `render.yaml` (Lines 12-19)

```yaml
envVars:
  - key: DATABASE_URL
    sync: false      # ← Declares variable but NO VALUE SET
  - key: SUPABASE_URL
    sync: false      # ← Declares variable but NO VALUE SET
  - key: SUPABASE_SERVICE_KEY
    sync: false      # ← Declares variable but NO VALUE SET
  - key: SUPABASE_ANON_KEY
    sync: false      # ← Declares variable but NO VALUE SET
```

**The Issue:** `sync: false` means "don't sync from GitHub/environment" but we never SET the values manually on Render.

---

## The Fix

### Step 1: Get the Values
From `server/.env`:
```
DATABASE_URL=postgresql://postgres.jyqwyoqzbwbohleachxs:fNflZlGmUBMEO2zukqjNZw856ROpMV0c@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require
SUPABASE_URL=https://jyqwyoqzbwbohleachxs.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5cXd5b3F6Yndib2hsZWFjaHhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIwMjk0MSwiZXhwIjoyMDg1Nzc4OTQxfQ.KoM7jDygKm5wNY7mNYpfxjwlBUwsugm3bxlZzZx-C6M
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5cXd5b3F6Yndib2hsZWFjaHhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMDI5NDEsImV4cCI6MjA4NTc3ODk0MX0.rVhvhoFHEhwkMzTiRycIZfIwrdq7u2qcdxjwd4o0Ao4
```

### Step 2: Set on Render Dashboard
1. Open https://dashboard.render.com/
2. Select service: **hex-ade-api**
3. Go to **Settings** tab
4. Scroll to **Environment**
5. Click **Add Environment Variable** (or edit existing)
6. For each variable:
   - **Key:** DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_KEY, SUPABASE_ANON_KEY
   - **Value:** Copy from above
7. **Save**
8. Service will auto-redeploy (~2 minutes)

**OR Step 3 (Alternative): Update render.yaml** (if not using dashboard)
```yaml
envVars:
  - key: PYTHON_VERSION
    value: "3.11"
  - key: DATABASE_URL
    value: "postgresql://postgres.jyqwyoqzbwbohleachxs:fNflZlGmUBMEO2zukqjNZw856ROpMV0c@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require"
  - key: SUPABASE_URL
    value: "https://jyqwyoqzbwbohleachxs.supabase.co"
  - key: SUPABASE_SERVICE_KEY
    value: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  - key: SUPABASE_ANON_KEY
    value: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**⚠️ SECURITY WARNING:** Don't commit secrets to git. Use Render dashboard instead.

---

## Verification

After setting environment variables, test:

```bash
# Test 1: Health check (from any terminal)
curl -I https://hex-ade-api.onrender.com/health
# Expected: HTTP 200

# Test 2: Get projects (from frontend or terminal)
curl https://hex-ade-api.onrender.com/projects
# Expected: JSON with projects list

# Test 3: Frontend loading (open in browser)
https://ade.getmytestdrive.com
# Expected: Dashboard loads with real data (not spinner)
```

---

## Why This Happened

**Root Cause:** Configuration error, NOT infrastructure
- Render.yaml was prepared but environment variables were never populated
- Local `.env` works for development but isn't available in production
- Standard DevOps practice: separate secrets management from code

**Prevention:** For future deployments:
- Always verify environment variables are set on hosting platform
- Use `echo $DATABASE_URL` on Render to confirm variables exist
- Test health endpoint immediately after deployment

---

## Impact Timeline

- **Before fix:** Backend returns no data → Frontend stuck in loading → OC can't test
- **After fix:** Backend responds → Frontend gets real data → Frontend can be fully tested
- **Time to fix:** ~5 minutes (set env vars) + ~2 minutes (Render redeploy) = **7 minutes total**

---

## Related Files

- `server/api/database.py` - Database initialization logic
- `render.yaml` - Render deployment configuration
- `server/.env` - Local environment variables (dev only)
- `apps/web/src/lib/api.ts` - Frontend API calls

---

**Status:** Ready for GC to execute fix
**Assigned to:** GC (use Render MCP or dashboard to set env vars)
**Urgency:** CRITICAL - Blocking all backend functionality
