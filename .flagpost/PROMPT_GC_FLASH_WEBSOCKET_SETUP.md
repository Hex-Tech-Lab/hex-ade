# GC Flash: WebSocket Infrastructure Setup (OPTION B)
**Date**: 2026-02-06  
**Agent**: Gemini Flash 2.0  
**Duration**: 2-3 hours  
**Priority**: CRITICAL (unblocks all chat/spec features)  

---

## Mission
Configure `ade-api.getmytestdrive.com` subdomain to enable WebSocket connections from Vercel frontend to Render backend. Current blocker: Vercel's rewrite feature doesn't support WebSocket protocol upgrades.

## Current State
- **Frontend**: Deployed at https://ade.getmytestdrive.com (Vercel)
- **Backend**: Deployed at https://hex-ade-api.onrender.com (Render)
- **Database**: Supabase PostgreSQL (Frankfurt)
- **Issue**: WebSocket connections fail because Vercel rewrites don't support upgrade protocol

## Success Criteria
- [ ] DNS record created: `ade-api.getmytestdrive.com` → Render backend IP
- [ ] CORS configured on backend for WebSocket origin
- [ ] Frontend updated to use subdomain for WebSocket connections
- [ ] WebSocket handshake succeeds (test with browser DevTools)
- [ ] Chat/spec features functional end-to-end
- [ ] Zero 403/401 errors in browser console

---

## Tasks (Sequential)

### Task 1: DNS Configuration
**Goal**: Point `ade-api.getmytestdrive.com` to Render backend

1. Identify Render backend public URL: `https://hex-ade-api.onrender.com`
2. Create DNS CNAME record:
   ```
   Name: ade-api
   Type: CNAME
   Value: hex-ade-api.onrender.com
   TTL: 3600 (1 hour)
   ```
3. Verify DNS propagation (allow 5-10 minutes)
   ```bash
   nslookup ade-api.getmytestdrive.com
   # Should resolve to hex-ade-api.onrender.com
   ```

**Files to Update**:
- None (DNS is external)

**Verification**:
```bash
curl -I https://ade-api.getmytestdrive.com/health
# Should return: HTTP/1.1 200 OK
```

---

### Task 2: Backend CORS Configuration
**Goal**: Allow WebSocket connections from Vercel frontend

1. Open `server/main.py`
2. Update CORS middleware to support WebSocket origin:
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=[
           "https://ade.getmytestdrive.com",
           "https://ade-api.getmytestdrive.com",
           "http://localhost:3000",
           "http://127.0.0.1:3000",
       ],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
       expose_headers=["*"],
   )
   ```
3. Deploy to Render (auto-deploys on push)

**Files to Update**:
- `server/main.py` (CORS section)

**Verification**:
```bash
curl -I -H "Origin: https://ade.getmytestdrive.com" \
  https://ade-api.getmytestdrive.com/health
# Should return: Access-Control-Allow-Origin: https://ade.getmytestdrive.com
```

---

### Task 3: Frontend WebSocket Configuration
**Goal**: Update frontend to use WebSocket subdomain directly

1. Open `apps/web/src/hooks/useWebSocket.ts`
2. Update WebSocket URL construction:
   ```typescript
   const getWebSocketUrl = (endpoint: string): string => {
     const host = typeof window !== 'undefined' 
       ? window.location.hostname 
       : 'ade.getmytestdrive.com';
     
     const wsHost = host === 'localhost' || host === '127.0.0.1'
       ? 'ws://localhost:8888'
       : 'wss://ade-api.getmytestdrive.com';
     
     return `${wsHost}${endpoint}`;
   };
   ```
3. Deploy to Vercel (auto-deploys on push)

**Files to Update**:
- `apps/web/src/hooks/useWebSocket.ts`
- `apps/web/next.config.ts` (remove WebSocket rewrite - not needed)

**Verification**:
- Open https://ade.getmytestdrive.com
- Open DevTools → Network → WS
- Trigger a chat message
- Should see WebSocket connection to `wss://ade-api.getmytestdrive.com/ws/...`

---

### Task 4: End-to-End WebSocket Test
**Goal**: Verify full chat workflow

1. Navigate to https://ade.getmytestdrive.com
2. Create or select a project
3. Try to send a chat message
4. Observe:
   - No 403/401 errors in console
   - WebSocket connection established
   - Message sent and received
   - Spec/assistant features responsive

**Files to Update**:
- None (verification only)

**Verification**:
- Chat responds with AI message
- No CORS errors in console
- Connection persists across messages

---

### Task 5: Documentation & Monitoring
**Goal**: Document the configuration for future reference

1. Update `.flagpost/DEPLOYMENT_STATUS_FINAL.md`:
   ```markdown
   ### WebSocket Configuration ✅
   - Subdomain: ade-api.getmytestdrive.com (CNAME to Render)
   - CORS: Configured for Vercel origin
   - Protocol: WSS (TLS encrypted)
   - Status: Live and tested
   ```

2. Monitor Render logs for any WebSocket errors:
   ```bash
   # In Render dashboard: hex-ade-api service → Logs
   # Filter for: "websocket", "connection", "upgrade"
   # Should see: "Client connected to WebSocket", "Message received"
   ```

**Files to Update**:
- `.flagpost/DEPLOYMENT_STATUS_FINAL.md`

---

## Parallel Execution Notes
- **OC** will be building UI components simultaneously
- **CC** will be starting E2E test infrastructure
- **No blocking dependencies** between Option A and B
- All three teams can push independently and merge later

---

## Rollback Plan
If WebSocket subdomain causes issues:
1. Temporarily revert frontend to use Vercel rewrites (slower but works)
2. Keep DNS/CORS for future use
3. Debug WebSocket protocol negotiation
4. Check Render service status/logs

---

## Environment Variables
No new environment variables needed. All URLs are domain-based.

---

## Expected Timeline
- DNS propagation: 5-10 minutes
- Backend CORS update: 2-3 minutes (Render redeploy)
- Frontend WebSocket update: 2-3 minutes (Vercel redeploy)
- E2E testing: 15-30 minutes
- **Total**: 30-60 minutes active work

---

## Success Metrics
| Metric | Target | Status |
|--------|--------|--------|
| WebSocket connection | Established | 🔄 In Progress |
| Chat message delivery | <500ms | 🔄 In Progress |
| Zero CORS errors | 0 | 🔄 In Progress |
| Spec chat functional | Yes | 🔄 In Progress |
| Assistant panel responsive | Yes | 🔄 In Progress |

---

## Questions? Blockers?
- If DNS doesn't resolve: Check getmytestdrive.com registrar DNS settings
- If CORS still fails: Enable preflight with OPTIONS handler
- If WebSocket still drops: Check Render logs for `Upgrade` header handling
- If frontend won't deploy: Check Vercel build logs for TypeScript errors

**Report status updates to OC team for coordination.**
