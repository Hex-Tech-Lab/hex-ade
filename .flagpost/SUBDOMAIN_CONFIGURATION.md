# ade-api.getmytestdrive.com Subdomain Configuration

## Setup Summary
- Configured: 2026-02-04
- Domain: ade-api.getmytestdrive.com
- Points to: hex-ade-api.onrender.com
- SSL: Auto-provisioned by Render
- Status: PROVISIONING ⏳ (Awaiting DNS/SSL)

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
- [ ] curl https://ade-api.getmytestdrive.com/health
- [ ] curl https://ade-api.getmytestdrive.com/api/projects
- [ ] WebSocket: wss://ade-api.getmytestdrive.com/ws/projects/{name}

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
