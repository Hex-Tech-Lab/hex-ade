# GC-S1: Migrate Backend from Render to Fly.io
**Date**: 2026-02-06 19:30 UTC  
**Duration**: 1-2 hours  
**Owner**: Gemini Flash 2.0  
**Status**: Ready Now

---

## **MISSION**

Move hex-ade backend from Render (unreliable 15-min cutoff) to Fly.io (stable, persistent storage).

---

## **CURRENT STATE**

- **Running on**: Render (hex-ade-api.onrender.com)
- **Port**: 8888
- **Database**: Supabase PostgreSQL (external, stays unchanged)
- **Status**: Working but session kills every 15 minutes

---

## **STEPS (In Order)**

### **Step 1: Create Fly.io App** (10 minutes)

```bash
# Login to Fly.io (assumes CLI already installed)
flyctl auth login

# Create new app (in project root)
cd /home/kellyb_dev/projects/hex-ade
flyctl launch --name hex-ade-backend
# When prompted:
# - Region: iad (Virginia, close to Supabase Frankfurt)
# - Use existing Dockerfile? YES
# - Copy fly.toml from existing config? YES
```

If prompted about Postgres: **NO** (using Supabase external)

### **Step 2: Configure Fly.io** (10 minutes)

Edit `fly.toml`:

```toml
[build]
dockerfile = "server/Dockerfile"

[env]
LOG_LEVEL = "info"
DATABASE_URL = "postgresql://..."  # From Supabase
SUPABASE_URL = "https://..."
SUPABASE_SERVICE_KEY = "..."
SUPABASE_ANON_KEY = "..."
OPENROUTER_API_KEY = "..."

[[services]]
internal_port = 8888
protocol = "tcp"

[[services.ports]]
port = 443
handlers = ["tls"]

[[services.ports]]
port = 80
handlers = ["http"]
http_options = { compress = "gzip" }
```

### **Step 3: Set Secrets** (5 minutes)

```bash
# These won't appear in fly.toml (security)
flyctl secrets set -a hex-ade-backend \
  DATABASE_URL="postgresql://..." \
  SUPABASE_SERVICE_KEY="..." \
  OPENROUTER_API_KEY="..."
```

### **Step 4: Deploy** (5 minutes)

```bash
flyctl deploy --remote-only
# Wait for build + deploy (~3-5 minutes)
# Verify: flyctl status
```

### **Step 5: Test Backend** (5 minutes)

```bash
# Get Fly app URL
flyctl info

# Test REST API
curl -X GET https://hex-ade-backend.fly.dev/health

# Test WebSocket
python3 << 'EOF'
import asyncio
import websockets

async def test():
    try:
        async with websockets.connect('wss://hex-ade-backend.fly.dev/ws/projects/test-project') as ws:
            print('✅ WebSocket works!')
    except Exception as e:
        print(f'❌ WebSocket failed: {e}')

asyncio.run(test())
EOF
```

### **Step 6: Update Frontend Config** (5 minutes)

**File**: `apps/web/src/hooks/useWebSocket.ts`

Change:
```typescript
// OLD
const wsHost = host === 'localhost' || host === '127.0.0.1'
  ? 'ws://localhost:8888'
  : 'wss://ade-api.getmytestdrive.com';

// NEW
const wsHost = host === 'localhost' || host === '127.0.0.1'
  ? 'ws://localhost:8888'
  : 'wss://hex-ade-backend.fly.dev';
```

Also update REST API endpoint if using ade-api subdomain.

### **Step 7: Test End-to-End** (10 minutes)

```bash
# Start frontend locally
cd apps/web && pnpm dev

# Open browser: http://localhost:3000
# Try to create a project
# Verify WebSocket connects to Fly.io
# Check browser DevTools → Network → WS
```

### **Step 8: Verify Persistence** (5 minutes)

```bash
# Restart Fly app (simulates deployment)
flyctl restart -a hex-ade-backend

# Verify data still exists
curl https://hex-ade-backend.fly.dev/api/projects

# Verify no 15-minute cutoff (run for 20 minutes)
```

---

## **WHAT YOU HANDLE (NOT GC)**

- ✅ DNS migration (Namesheep CNAME for hex-ade-backend.fly.dev → Fly.io)
- ✅ Keep Render app running until DNS switches over

---

## **SUCCESS CRITERIA**

✅ App deployed to Fly.io  
✅ REST API responds at `/health`  
✅ WebSocket connects to `/ws/projects/{name}`  
✅ Frontend loads from Fly.io backend  
✅ Data persists across restarts  
✅ No 15-minute cutoff  
✅ Session lasts >1 hour continuously

---

## **ROLLBACK (If Needed)**

If Fly.io deployment fails:
1. Revert frontend to use Render endpoint
2. Keep Render app running
3. Try Fly.io deploy again
4. No data loss (Supabase is external)

---

## **TIMELINE**

- Fly CLI installed: ✅ (assumed)
- Server/Dockerfile exists: ✅ (yes)
- fly.toml exists: ✅ (yes, in repo)
- Total time: **1-2 hours** including testing

---

## **REPORT BACK**

When done, tell me:
1. ✅ App name on Fly.io: `hex-ade-backend`
2. ✅ App URL: `https://hex-ade-backend.fly.dev`
3. ✅ Health check passes: yes/no
4. ✅ WebSocket works: yes/no
5. ✅ E2E test passes: yes/no

Then you handle DNS migration to Fly.io.

---

**Ready to execute?**
