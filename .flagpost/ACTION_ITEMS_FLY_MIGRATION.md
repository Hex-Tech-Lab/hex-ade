# Action Items: Render → Fly.io Migration

**Date**: 2026-02-06 19:30 UTC  
**Status**: Ready to Execute

---

## **Item 1: GC-S1 Task (1-2 hours)**

**What**: Migrate backend from Render to Fly.io  
**Where**: `.flagpost/PROMPT_GC_MIGRATE_RENDER_TO_FLY.md`  
**Owner**: GC-S1 (Gemini Flash)  
**When**: Start now (parallel with OC-S1 E2E tests)  
**Deliverable**: hex-ade-backend running on Fly.io

---

## **Item 2: You (Manual DNS Update, 5 minutes)**

**What**: Update Namesheep DNS CNAME  
**From**: `hex-ade-backend.onrender.com`  
**To**: `hex-ade-backend.fly.dev`  
**Records to update**:
```
ade-api.getmytestdrive.com  CNAME  hex-ade-backend.fly.dev
hex-ade-backend.fly.dev     CNAME  fly-ade-backend.fly.dev  (Fly auto-assign)
```

**When**: After GC completes Fly.io deploy (wait for health check to pass)

---

## **Item 3 (Optional): Add Namesheep DNS Skill**

**What**: Automate DNS updates via Namesheep API  
**Why**: Won't need manual UI clicks for future migrations  
**Effort**: 30 minutes (if Namesheep has public API)  
**Prerequisites**:
- Namesheep API documentation URL
- Your API key (as env var)

**If interested**:
> Provide Namesheep API endpoint + docs, I'll create a skill that GC can use to update DNS programmatically.

---

## **EXECUTION ORDER**

```
1. You: Review PROMPT_GC_MIGRATE_RENDER_TO_FLY.md
2. GC-S1: Execute Fly.io migration (flyctl launch, deploy, test)
3. GC-S1: Report: "✅ Fly.io deployed, health check passes"
4. You: Update Namesheep CNAME to point to Fly.io
5. Test: Verify frontend still works with new backend URL
6. Cleanup: Keep Render running for 24h as fallback, then delete
```

---

## **RISK MITIGATION**

- **Database**: Supabase (external) - unaffected by Render/Fly switch
- **Data**: All persists (not temporary)
- **Rollback**: Revert DNS CNAME to Render if needed
- **No downtime**: Can run both in parallel during migration

---

**GC: Ready to execute the Fly.io migration?**  
**You: Confirm Namesheep DNS access + decide on API skill**
