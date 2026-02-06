# GC: Phase 1 Deep Audit + Live Tools + PR Review (Governing Task)

## OBJECTIVE
Perform a comprehensive code quality audit of Phase 1 (WebSocket Infrastructure) using automated tools (Qodana, Cubic) and manual architectural review. Finalize the PR for merge approval by ensuring all quality gates are met and documented.

## CURRENT STATE
- Phase 1 Implementation: ✅ Complete (Integrated in page.tsx)
- Infrastructure: ✅ Verified (Protocol, Endpoints, Hooks)
- Verification Reports: ✅ Generated (.flagpost/PHASE1_*)
- Next Step: Deep validation and PR finalization.

---

## TASK 1: Live Quality Scan - Qodana (30 min)

### 1a. Initialize Qodana Scan
```bash
# Ensure Qodana is installed or pull the latest image
docker pull jetbrains/qodana-js:latest
```

### 1b. Execute Project-Wide Scan
```bash
cd /home/kellyb_dev/projects/hex-ade
docker run --rm -v "$(pwd):/data" -v "$(pwd)/.qodana:/tmp/results" jetbrains/qodana-js:latest
```

### 1c. Audit Critical Findings
Document all high-severity issues found in `.flagpost/QODANA_RESULTS.md`. Focus on:
- Complexity hot spots in `useProjectWebSocket.ts`.
- Potential memory leaks in event listeners.
- Unreachable code in legacy components.

**Success Criteria**:
- ✅ Qodana report generated.
- ✅ Critical findings documented and prioritized.

---

## TASK 2: Architecture Integrity - Cubic AI Wiki (20 min)

### 2a. Generate Architectural Map
Use the `list_wikis` and `get_wiki_page` tools to compare current implementation against the design docs.

### 2b. Verify Dependency Integrity
Check the `DependencyGraph.tsx` logic against the actual project structure. Ensure the SVG layout correctly represents the feature hierarchy.

### 2c. Document Discrepancies
Create: `.flagpost/CUBIC_RESULTS.md`
- List any deviations from the PRD/HDS.
- Verify that the "High Density 2026" aesthetic is consistently applied.

**Success Criteria**:
- ✅ Implementation aligns with design specifications.
- ✅ All architectural deviations documented.

---

## TASK 3: PR Review & Final Polish (30 min)

### 3a. Comprehensive PR Description Review
Review `.flagpost/PHASE1_PR_DESCRIPTION.md` for accuracy. Ensure all new components and hooks are listed with their primary responsibilities.

### 3b. Final Verification Checklist
Execute the following to confirm state:
```bash
# Check for any remaining 'any' types in critical paths
grep -r ": any" apps/web/src/hooks/ | grep -v "test"

# Verify all WebSocket URLs use wss:// in production
grep -r "wss://" apps/web/src/hooks/
```

### 3c. Prepare Merge Sign-off
Create the final sign-off artifact: `.flagpost/DEPLOYMENT_STATUS_FINAL.md`.

**Success Criteria**:
- ✅ PR description is 100% accurate.
- ✅ Zero critical security or type leaks found.
- ✅ Final sign-off ready for User approval.

---

## TASK 4: Update Long-Term Memory (10 min)

### 4a. Synchronize MEMORY.md
Add the results of the Qodana and Cubic scans to the project memory.

### 4b. Final Handoff Preparation
Summarize the session findings and prepare the environment for Phase 2 initialization.

**Success Criteria**:
- ✅ Memory reflects high-fidelity audit results.
- ✅ Next Actions clearly defined for Phase 2.

---

## SUCCESS CRITERIA (ALL REQUIRED)

- ✅ Qodana report processed and documented.
- ✅ Cubic architecture audit complete.
- ✅ PR description verified and polished.
- ✅ Final deployment status report generated.
- ✅ Zero high-severity quality blockers remaining.

---

**Status**: 🚀 READY FOR GOVERNANCE EXECUTION