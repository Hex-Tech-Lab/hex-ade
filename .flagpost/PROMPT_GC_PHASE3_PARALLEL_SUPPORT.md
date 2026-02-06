# GC-S1: Phase 3 Parallel Support Tasks
**Date**: 2026-02-06 19:00 UTC  
**Agent**: Gemini Flash 2.0  
**Duration**: 3-4 hours  
**Status**: Ready Now (OC-S1 is blocked on WebSocket tests)

---

## **SITUATION**

OC-S1 is about to start WebSocket E2E testing. While they work on that, **you can unblock them and add value** in parallel.

**Available tasks** (pick one or more):

---

## **TASK A: Code Quality Audit (Recommended First)** ⭐

**Duration**: 1-2 hours  
**Impact**: High (prevents test failures)

### What to Do
1. **Scan server-side code for common issues**:
   ```bash
   cd server && ruff check . --statistics
   cd server && mypy . --ignore-missing-imports
   ```

2. **Check for WebSocket-specific issues**:
   - Find all WebSocket endpoints in `server/routers/`
   - Verify they follow "accept first" pattern (like we just fixed)
   - Check for missing error handlers
   - Verify JSON serialization for all message types

3. **Audit frontend WebSocket hooks**:
   ```bash
   cd apps/web && pnpm lint
   cd apps/web && pnpm type-check
   ```

4. **Report findings**:
   - Create `.flagpost/CODE_QUALITY_AUDIT_PHASE3.md`
   - List any issues found
   - Suggest fixes (but don't commit yet)

### Why This Helps
- Finds bugs before E2E tests hit them
- Saves OC-S1 debugging time
- Ensures clean code for production

### Success Criteria
✅ Ruff/mypy/ESLint all pass  
✅ No WebSocket-specific issues found  
✅ Code quality report written

---

## **TASK B: Backend Test Coverage** 

**Duration**: 1.5-2 hours  
**Impact**: Medium (validates backend)

### What to Do
1. **Run existing backend tests**:
   ```bash
   cd server && python -m pytest tests/ -v --tb=short
   ```

2. **Check coverage**:
   ```bash
   cd server && python -m pytest tests/ --cov=server --cov-report=html
   ```

3. **Identify gaps**:
   - Which endpoints aren't tested?
   - Which WebSocket handlers lack tests?
   - Which error cases aren't covered?

4. **Create report**:
   - List coverage % by module
   - List critical untested paths
   - Suggest new tests to write

### Why This Helps
- Ensures backend is reliable before OC tests it
- Finds bugs early in backend logic
- Prevents OC from chasing backend issues during E2E testing

### Success Criteria
✅ Existing tests pass  
✅ Coverage report generated  
✅ Gaps identified and documented

---

## **TASK C: Environment Configuration Validation**

**Duration**: 1 hour  
**Impact**: Medium (prevents flaky tests)

### What to Do
1. **Verify all required env vars are set**:
   ```bash
   cd server && grep -r "os.getenv\|os.environ" server/ | grep -v "test" | sort | uniq
   ```

2. **Check `.env` file completeness**:
   - List all vars used in code
   - Verify they're defined in `.env`
   - Check for typos or missing values

3. **Document requirements**:
   - What env vars are mandatory for backend?
   - What env vars are optional?
   - What are default values?

4. **Create env validation script**:
   ```bash
   # server/validate_env.py
   # Check all required vars present
   # Check values are valid
   # Report any missing vars
   ```

### Why This Helps
- Prevents "env var not set" errors during E2E tests
- Makes setup reproducible
- Helps new developers onboard

### Success Criteria
✅ All required vars documented  
✅ `.env` file validated  
✅ Validation script created

---

## **TASK D: Database Schema Audit**

**Duration**: 1.5 hours  
**Impact**: Low-Medium (validates data layer)

### What to Do
1. **Review current database schema**:
   ```bash
   # Check migrations in server/
   ls -la server/migrations/ 2>/dev/null || echo "No migrations found"
   
   # Check models in server/api/database.py
   grep "class.*Base" server/api/database.py
   ```

2. **Verify schema matches code**:
   - Do models match actual DB schema?
   - Are indexes present where needed?
   - Are foreign keys configured correctly?

3. **Check for issues**:
   - Missing indexes on frequently-queried columns?
   - Inefficient column types?
   - Missing constraints?

4. **Document findings**:
   - Create `.flagpost/DATABASE_SCHEMA_AUDIT.md`
   - List any issues
   - Suggest improvements

### Why This Helps
- Ensures database is performant
- Prevents N+1 query issues
- Validates data integrity

### Success Criteria
✅ Schema reviewed  
✅ Issues identified  
✅ Recommendations documented

---

## **TASK E: Documentation Completeness**

**Duration**: 1-1.5 hours  
**Impact**: Medium (helps future development)

### What to Do
1. **Audit existing documentation**:
   - Review `.flagpost/` directory
   - Review `docs/` directory
   - Check for outdated info

2. **Identify gaps**:
   - Are API endpoints documented?
   - Are WebSocket protocols documented?
   - Are error codes documented?
   - Is deployment process documented?

3. **Create missing docs**:
   - API endpoint reference (`.flagpost/API_REFERENCE.md`)
   - WebSocket message protocol (`.flagpost/WEBSOCKET_PROTOCOL.md`)
   - Error codes and handling (`.flagpost/ERROR_CODES.md`)

4. **Update outdated docs**:
   - Fix any stale URLs
   - Update version numbers
   - Add missing examples

### Why This Helps
- Makes codebase easier to understand
- Reduces onboarding time
- Helps OC-S1 understand backend better

### Success Criteria
✅ Documentation gaps identified  
✅ New docs created  
✅ Outdated docs updated

---

## **MY RECOMMENDATION**

**Do Tasks A + C in parallel** (2-3 hours total):
1. **Task A (Code Quality)**: Find bugs now, not during tests
2. **Task C (Environment)**: Ensure tests don't fail on config issues

Then if time allows:
3. **Task E (Documentation)**: Help OC-S1 understand WebSocket protocol better

**Order of impact**: A > C > E > B > D

---

## **HOW TO START**

Pick one task above and:
1. Create a working branch: `git checkout -b gc/phase3-parallel-{TASK}`
2. Execute the analysis
3. Document findings in appropriate `.flagpost/` file
4. Create PR with findings (don't commit code changes yet)
5. Report back with results

---

## **WHAT NOT TO DO**

❌ Don't commit code changes yet
❌ Don't run expensive operations (like full test suite) without asking
❌ Don't get stuck on one issue > 30 minutes (escalate to OC/CC)
❌ Don't modify production configs

---

## **SUCCESS = OC-S1 UNBLOCKED**

Your goal: Find and **document** issues so OC-S1 doesn't hit them during E2E testing.

Ready?
