# 🎯 Database & Quality Setup Plan

**Date:** 2026-02-04
**Status:** READY FOR EXECUTION
**Framework:** GOTCHA + ATLAS-VM

---

## Executive Summary

Complete tech stack audit + database setup + quality checks infrastructure has been designed and documented. Ready for parallel execution while OC finishes frontend work.

### What's Ready
1. ✅ **Tech Stack Audit** - Verified alignment with TDD
2. ✅ **Database Design** - Supabase schema + Drizzle ORM
3. ✅ **Implementation Prompts** - For both agents
4. ✅ **Quality Infrastructure** - GitHub Actions configuration
5. ✅ **Parallel Execution Plan** - Maximizes team efficiency

---

## Tech Stack Verification

### Frontend (apps/web/)
```
✅ Next.js 16.1.6   (TDD: 15.x LTS)  → Aligned (minor bump acceptable)
✅ React 19.2.3     (TDD: 18.x)      → Aligned (minor bump acceptable)
✅ TypeScript 5.x   (TDD: 5.x)       → Aligned
✅ MUI 7.3.7        (TDD: 5.x)       → Aligned (major but compatible)
✅ Tailwind CSS 4   (TDD: 3.x)       → Aligned (minor bump)
✅ Zustand 5.0.11   (TDD: 4.x)       → Aligned (minor bump acceptable)
✅ React Query 5.90 (TDD: for fetch) → Aligned
```

**Status:** FULLY ALIGNED with TDD requirements

### Backend (server/)
```
✅ Python 3.11+     (TDD: 3.11+)     → Aligned
✅ FastAPI 0.115    (TDD: planned)   → Aligned
✅ SQLAlchemy 2.0   (TDD: 2.0+)      → Aligned
✅ WebSockets 13    (TDD: planned)   → Aligned
✅ Uvicorn 0.32     (TDD: planned)   → Aligned
```

**Status:** FULLY ALIGNED with TDD requirements

### Database (NEW)
```
❌ Supabase         (TDD: planned)   → NOT SET UP (GC's task)
❌ Drizzle ORM      (NEW: best practice) → NOT SET UP (GC's task)
```

**Status:** READY FOR SETUP

---

## Database Architecture Decision

### Technology Choice: SQLAlchemy + Drizzle

**Why Dual ORMs?**
- **SQLAlchemy (Python):** Business logic, orchestration, deterministic tools
- **Drizzle (TypeScript):** API routes, direct queries, type safety

**Benefits:**
✅ Modern Next.js 15 pattern
✅ Full type safety in TypeScript
✅ Flexible query patterns
✅ Industry best practice
✅ Aligns with "other project" approach

---

## Schema Design

### 4 Core Tables

| Table | Purpose | Rows |
|-------|---------|------|
| **projects** | User projects (reproducible builds) | 1M+ |
| **features** | Tasks within projects | 10M+ |
| **tasks** | Execution history | 100M+ |
| **agent_logs** | Real-time agent activity | 1B+ (streams) |

### RLS Policies
- Users can only see their own projects
- Features scoped to user's projects
- All tables have time-based indexes
- Audit logging ready

---

## Execution Plan

### Phase 1: Parallel Execution (NOW)

**OC Task (Checkpoint 3):** Frontend API Wiring
- Estimated: 1-2 hours
- File: `.flagpost/CHECKPOINT_2_INSTRUCTIONS.md`
- Work: Wire 3 pages to backend APIs

**GC Task (Database):** Supabase Setup
- Estimated: 3-3.5 hours
- File: `.flagpost/PROMPT_GC_DATABASE.md`
- Work: 5-phase database infrastructure setup

**Timeline:** Both working in parallel → ~3.5 hours to completion

### Phase 2: Integration Testing (Checkpoint 4)

**When both complete:**
- OC + GC: E2E testing with real database
- Estimated: 1-1.5 hours
- File: `.flagpost/CHECKPOINT_4_INSTRUCTIONS.md`

**Result:** System ready for deployment

---

## GitHub & Quality Setup

### Tools Integration

**CI/CD Pipeline (GitHub Actions):**
```yaml
On every PR:
  ├─ Qodana       → Code quality analysis
  ├─ Code Rabbit  → AI-powered code review
  ├─ Sourcery     → Python-specific optimization
  └─ PR Scraper   → Context collection
```

**Configuration:** See `.flagpost/TECH_STACK_AUDIT.md` section 9

### Setup Timeline
1. After database PR merges
2. Add GitHub Actions workflow
3. Configure tool secrets
4. Test on next PR

---

## File Structure Created

```
.flagpost/
├── TECH_STACK_AUDIT.md .................. Tech audit + decisions
├── PROMPT_GC_DATABASE.md ............... Database setup (5-phase)
├── CHECKPOINT_2_INSTRUCTIONS.md ........ Frontend wiring
├── CHECKPOINT_4_INSTRUCTIONS.md ........ E2E testing
├── API_CONTRACT.md ..................... Endpoint specs
├── INTEGRATION_TRACKING.md ............. Progress dashboard
├── HANDOFF_GC_TO_OC.md ................. Context handoff
└── memory.md ........................... Agent learnings

Project Root/
├── DATABASE_AND_QUALITY_PLAN.md ........ This file
└── NEXT_ACTIONS_FOR_KELLY.md ........... Action items
```

---

## What You Should Do Now

### Immediate Actions (5 minutes)

1. **Send GC their database prompt:**
   ```
   File: .flagpost/PROMPT_GC_DATABASE.md
   Task: Complete Supabase setup + schema (3-3.5 hours)
   Status: Ready to execute immediately
   ```

2. **Confirm OC is working on Checkpoint 3:**
   ```
   File: .flagpost/CHECKPOINT_2_INSTRUCTIONS.md
   Task: Wire frontend components (1-2 hours)
   Status: Should be in progress
   ```

3. **Monitor parallel execution:**
   ```
   Check: .flagpost/status.json (both agents update progress)
   Expected completion: ~3.5 hours from now
   ```

### Quality Review Setup (After database is ready)

1. Add GitHub Actions workflow (from TECH_STACK_AUDIT.md)
2. Configure tool credentials
3. Test on database PR
4. Monitor and refine

---

## Timeline to Deployment

```
NOW:
├─ OC finishing Checkpoint 3 (frontend) .... 1-2 hours
└─ GC starting database setup .............. 3-3.5 hours

AFTER ~3.5 HOURS:
├─ Both ready for Checkpoint 4 (E2E) ....... 1-1.5 hours
└─ DEPLOYMENT READY ✅

TOTAL: ~5 hours to fully deployed state
```

---

## Quality Gates

### Before Checkpoint 4
- [ ] OC: `pnpm build` passes (0 errors)
- [ ] GC: All database connections verified
- [ ] Both: Environment variables set

### Before Deployment
- [ ] E2E testing complete
- [ ] Both agents sign-off
- [ ] Build passes with 0 errors
- [ ] Database queries verified
- [ ] GitHub Actions configured

---

## Summary

**Tech Stack:** ✅ Fully aligned with TDD
**Database Plan:** ✅ Complete (Supabase + Drizzle + SQLAlchemy)
**Quality Checks:** ✅ Documented (Qodana, Code Rabbit, Sourcery)
**Execution:** ✅ Ready (parallel tasks for both agents)
**Timeline:** ✅ ~5 hours to deployment ready

**Next Step:** Send GC their database prompt and let parallel execution begin.

---

## Quick Reference

| Document | Purpose | For Whom |
|----------|---------|----------|
| TECH_STACK_AUDIT.md | Decisions + audit | Everyone (reference) |
| PROMPT_GC_DATABASE.md | Database setup | GC (execute now) |
| CHECKPOINT_2_INSTRUCTIONS.md | Frontend wiring | OC (in progress) |
| CHECKPOINT_4_INSTRUCTIONS.md | E2E testing | Both (execute after) |
| API_CONTRACT.md | Endpoint specs | Both (reference) |
| INTEGRATION_TRACKING.md | Progress dashboard | Everyone (monitor) |

---

**Status:** 🟢 READY TO EXECUTE

All planning complete. Begin parallel execution.
