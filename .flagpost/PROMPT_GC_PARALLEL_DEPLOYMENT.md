# GC 10x Prompt: Parallel Deployment & Infrastructure (EXECUTE IMMEDIATELY)

**Status**: Ready for autonomous execution
**Owner**: GC (Gemini Flash with MCP access)
**Duration**: 2-3 hours
**Use**: Render MCP + REST API for all infrastructure tasks

---

## TOC: Deployment Tasks

1. **Configure ade-api.getmytestdrive.com subdomain** using Render MCP
2. **Update CORS** in backend for new subdomain
3. **Verify DNS** and SSL certificate provisioning
4. **Test** subdomain connectivity end-to-end
5. **Update documentation** with new subdomain

---

## TASK 1: Configure Custom Domain via Render MCP (1 hour)

**Objective**: Point ade-api.getmytestdrive.com → hex-ade-api.onrender.com

**Steps**:

1. **Use Render MCP to get current service details**:
   ```
   Call: mcp__claude_ai_Render__render_list_services
   Get: hex-ade-api service ID, current domains
   ```

2. **Add custom domain programmatically**:
   ```
   Via Render REST API (use curl or MCP tool):
   PATCH https://api.render.com/v1/services/{serviceId}
   Body: {
     "customDomains": [
       {
         "name": "ade-api.getmytestdrive.com",
         "priority": 1
       }
     ]
   }
   ```

3. **Verify domain is added**:
   ```
   GET https://api.render.com/v1/services/{serviceId}
   Check: customDomains array includes "ade-api.getmytestdrive.com"
   ```

4. **Wait for SSL certificate** (auto-provisioned by Render, ~5 min)

**Success Criteria**:
- [ ] Render API shows custom domain configured
- [ ] Domain status in Render dashboard: "Active"
- [ ] SSL certificate provisioned (green checkmark)

**Files to Create/Update**: None (pure Render configuration)

---

## TASK 2: Update Backend CORS (30 minutes)

**Objective**: Allow requests from both ade.getmytestdrive.com and ade-api.getmytestdrive.com

**File**: `server/main.py`

**Current State** (lines ~50-60):
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ade.getmytestdrive.com",
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    ...
)
```

**Change To**:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ade.getmytestdrive.com",
        "https://ade-api.getmytestdrive.com",  # NEW: API subdomain
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Why**: Frontend on ade-api.getmytestdrive.com needs to call same-origin WebSocket and API endpoints.

**Files**:
- [ ] Update `server/main.py` (add line in allow_origins)

---

## TASK 3: Update Backend WebSocket URL Handling (30 minutes)

**Objective**: Ensure WebSocket connections accept requests from ade-api subdomain

**File**: `server/websocket.py` (if uses origin validation)

**Check**:
1. Open `server/websocket.py`
2. Search for: "origin" or "allowed_origin"
3. If found: Add ade-api.getmytestdrive.com to whitelist
4. If not found: No changes needed (Starlette handles CORS)

**Expected**: FastAPI/Starlette should automatically use updated CORS config

**Files**:
- [ ] Check `server/websocket.py` (update if necessary)

---

## TASK 4: Test Subdomain Connectivity (30 minutes)

**Objective**: Verify ade-api.getmytestdrive.com is live and accessible

**Tests** (run from command line or curl):

1. **Health Check**:
   ```bash
   curl https://ade-api.getmytestdrive.com/health
   Expected: {"status":"healthy"}
   ```

2. **API Endpoint**:
   ```bash
   curl https://ade-api.getmytestdrive.com/api/projects
   Expected: {"status":"success","data":{"projects":[]},...}
   ```

3. **WebSocket Upgrade** (requires tool/script):
   ```bash
   # Test WebSocket connection (using wscat or similar)
   wss://ade-api.getmytestdrive.com/ws/projects/hex-ade
   Expected: Connection successful, no CORS error
   ```

**Success Criteria**:
- [ ] Health endpoint returns 200
- [ ] API endpoint returns 200 with valid JSON
- [ ] WebSocket connects without CORS errors
- [ ] Response time < 500ms from all locations

**Document Results** in `.flagpost/DEPLOYMENT_VERIFICATION.md`

---

## TASK 5: Update Documentation (30 minutes)

**Objective**: Document the subdomain configuration for future reference

**Create File**: `.flagpost/SUBDOMAIN_CONFIGURATION.md`

**Content**:
```markdown
# ade-api.getmytestdrive.com Subdomain Configuration

## Setup Summary
- Configured: 2026-02-04
- Domain: ade-api.getmytestdrive.com
- Points to: hex-ade-api.onrender.com
- SSL: Auto-provisioned by Render
- Status: ACTIVE ✓

## Why Separate Subdomain?
- WebSocket connections can't be proxied through Vercel rewrites
- Dedicated API subdomain solves: browser same-origin policy
- Frontend (ade.getmytestdrive.com) calls (ade-api.getmytestdrive.com)
- Both are same root domain: getmytestdrive.com

## Configuration Details

### Render Service
- Service: hex-ade-api
- Custom Domain: ade-api.getmytestdrive.com
- Priority: 1
- Status: Active
- Certificate: Auto-provisioned ✓

### CORS Whitelist
Added to `server/main.py`:
- https://ade-api.getmytestdrive.com

### API Endpoint
- Base URL: https://ade-api.getmytestdrive.com
- Health: /health
- API: /api/...
- WebSocket: /ws/...

## Testing
✓ curl https://ade-api.getmytestdrive.com/health
✓ curl https://ade-api.getmytestdrive.com/api/projects
✓ WebSocket: wss://ade-api.getmytestdrive.com/ws/projects/{name}

## Future: Multi-Environment
When adding staging/production:
- staging-api.getmytestdrive.com → staging backend
- prod-api.getmytestdrive.com → production backend
- Pattern: {environment}-api.getmytestdrive.com

## Automation Note
This was configured via Render REST API programmatically.
For full automation, consider:
1. Terraform for infrastructure-as-code
2. GitHub Actions to trigger deployment
3. Environment variable management
```

**Files**:
- [ ] Create `.flagpost/SUBDOMAIN_CONFIGURATION.md`

---

## TASK 6: Verify WebSocket Works with Frontend (15 minutes)

**Objective**: Confirm frontend can upgrade WebSocket connection to new subdomain

**After OC updates frontend** (they'll update `apps/web/src/lib/api.ts`):

1. **Frontend WebSocket URLs will be**:
   ```typescript
   wss://ade-api.getmytestdrive.com/ws/projects/{name}
   wss://ade-api.getmytestdrive.com/ws/spec/{name}
   wss://ade-api.getmytestdrive.com/ws/expand/{name}
   wss://ade-api.getmytestdrive.com/ws/assistant/{project}/{conv}
   ```

2. **Test connection**:
   - Open frontend at https://ade.getmytestdrive.com
   - Open browser DevTools → Network → WS
   - Create new project (triggers spec WebSocket)
   - Verify connection to `wss://ade-api.getmytestdrive.com/ws/spec/{name}`
   - No CORS errors in console
   - Spec creation chat works end-to-end

**Success Criteria**:
- [ ] WebSocket connects without CORS errors
- [ ] Messages flow bidirectionally
- [ ] No "Failed to fetch" or 403 errors

**Document Results**: Add to `.flagpost/SUBDOMAIN_CONFIGURATION.md`

---

## Execution Checklist

### Pre-Execution
- [ ] Verify Render MCP credentials are active
- [ ] Have Render API token ready (or use MCP)
- [ ] Verify DNS provider access (if manual DNS needed)

### Execution Order (CRITICAL)
1. Task 1: Configure domain (first, must wait for SSL)
2. Task 2: Update CORS (can start immediately)
3. Task 3: Check WebSocket handling (quick check)
4. Task 4: Test connectivity (after Task 1 completes)
5. Task 5: Update documentation (final step)
6. Task 6: Verify with frontend (when OC is ready)

### Key Commands
```bash
# If using MCP
# Verify service: render_list_services
# Verify domain: Get service details, check customDomains array

# If using direct Render API
RENDER_API_TOKEN="{your_token}"
curl -H "Authorization: Bearer $RENDER_API_TOKEN" \
  https://api.render.com/v1/services/{serviceId}

# Test HTTPS endpoint
curl https://ade-api.getmytestdrive.com/health

# Test WebSocket (requires wscat or similar)
wscat -c wss://ade-api.getmytestdrive.com/health
```

---

## Success Metrics

**Deployment Complete When**:
- ✅ Domain resolves: `nslookup ade-api.getmytestdrive.com`
- ✅ Health check 200: `curl https://ade-api.getmytestdrive.com/health`
- ✅ API responds 200: `curl https://ade-api.getmytestdrive.com/api/projects`
- ✅ WebSocket connects: Browser DevTools shows wss:// connection
- ✅ CORS allows: No 403 Forbidden errors in console
- ✅ Documentation complete: `.flagpost/SUBDOMAIN_CONFIGURATION.md` exists

---

## Deliverables

**Files Created**:
1. `.flagpost/SUBDOMAIN_CONFIGURATION.md` - Configuration docs
2. `.flagpost/DEPLOYMENT_VERIFICATION.md` - Test results

**Files Modified**:
1. `server/main.py` - Updated CORS allow_origins

**Status Updates**:
1. Commit with message: "chore: configure ade-api subdomain for WebSocket support"
2. Push to main branch
3. Update `.flagpost/status.json` with deployment status

---

## Estimated Time: 2-3 hours total

- Task 1: 1 hour (including SSL provisioning wait)
- Task 2: 30 min
- Task 3: 30 min
- Task 4: 30 min
- Task 5: 30 min
- Task 6: 15 min (async, depends on OC)

---

## Questions for GC

If you encounter issues:
1. **Domain not resolving?** → DNS propagation (up to 24h, usually 5-10min)
2. **SSL not provisioning?** → Render needs CNAME in place first
3. **CORS still failing?** → Check if frontend is on new subdomain
4. **WebSocket 403?** → Likely CORS issue, verify all_origins includes ade-api

---

**Ready to execute? Start with Task 1 immediately. Tasks 2-3 can run in parallel.**
