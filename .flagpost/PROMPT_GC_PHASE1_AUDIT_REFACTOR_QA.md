# GC: Phase 1 Complete Audit + Refactor + QA (10x Task)

## CRITICAL CONTEXT
- OC S1 & S2 are rate-limited (temporary suspension)
- You are SOLO on all remaining Phase 1 work
- Your Codebase Investigator agent is FULLY AVAILABLE
- Responsibility: Code quality, security, WebSocket correctness, merge-readiness

## BLOCKING ISSUES (Found in Pre-Flight Audit)
1. SpecCreationChat.tsx uses REST to non-existent endpoints ❌
2. ExpandProjectChat.tsx uses fetch() instead of WebSocket hook ❌
3. No code quality scans (Qodana/Cubic) run yet
4. PR not prepared with audit findings

---

## TASK 1: Install & Configure CLI Tools (30 min)

### 1a. Install Qodana CLI
```bash
# Install globally
npm install -g @jetbrains/qodana

# Verify installation
qodana --version

# Initialize Qodana config in project root
cd /home/kellyb_dev/projects/hex-ade
qodana init
```

### 1b. Install Cubic CLI
```bash
# Install globally
pnpm add -g @cubic-dev-ai/cli

# Verify installation
cubic --version

# Configure for project
cubic config set project hex-ade
```

**Success Criteria**:
- ✅ Both CLIs installed and versioned
- ✅ Project configurations created
- ✅ Ready to run scans

---

## TASK 2: Refactor WebSocket Components (90 min)

### 2a. Create useSpecChat.ts Hook
**Location**: `apps/web/src/hooks/useSpecChat.ts`

**Pattern**: Mirror `useExpandChat.ts` but for spec creation

**Requirements**:
- Endpoint: `wss://ade-api.getmytestdrive.com/ws/spec/{projectName}`
- Message types: `start`, `message`, `answer`, `error`
- Support image attachments (Base64 encoded)
- Reconnection with exponential backoff
- Auto-cleanup on component unmount

**Implementation**:
```typescript
export interface SpecMessage {
  type: 'start' | 'message' | 'answer' | 'error';
  content?: string;
  images?: string[]; // Base64 encoded
  error?: string;
}

export const useSpecChat = (projectName: string) => {
  const [messages, setMessages] = useState<SpecMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Implement: connect, send, disconnect
  // Follow useExpandChat pattern exactly
};
```

**Test Locally**:
- ✅ WebSocket connects to /ws/spec/{projectName}
- ✅ Messages flow bidirectionally
- ✅ Reconnection works after disconnect
- ✅ Images encode/decode correctly

### 2b. Refactor SpecCreationChat.tsx
**File**: `apps/web/src/components/SpecCreationChat.tsx`

**Changes**:
1. Remove all `fetch()` calls to `/api/spec/create`
2. Replace with `useSpecChat(projectName)` hook
3. Update `handleSend()` to use hook's send method
4. Add message streaming UI (typing indicator)
5. Handle `answer` message type from backend

**Before**:
```typescript
const handleSend = async (message: string) => {
  const response = await fetch('/api/spec/create', { ... });
  // REST call
}
```

**After**:
```typescript
const { messages, send, isConnected } = useSpecChat(projectName);

const handleSend = (message: string) => {
  send({ type: 'message', content: message });
}
```

**Test**:
- ✅ Component renders without errors
- ✅ WebSocket hook initializes
- ✅ Send button triggers WebSocket message
- ✅ Claude responses stream in real-time

### 2c. Fix ExpandProjectChat.tsx
**File**: `apps/web/src/components/ExpandProjectChat.tsx`

**Changes**:
1. Review current `handleSend` implementation
2. Ensure it uses `useExpandChat` hook (not fetch)
3. Verify endpoint matches backend: `/ws/expand/{projectName}`
4. Remove any REST fallbacks

**Verification**:
- ✅ Uses `useExpandChat` hook exclusively
- ✅ No fetch() calls remain
- ✅ WebSocket endpoint correct
- ✅ Message flow matches backend protocol

**Success Criteria** (Task 2 Complete):
- ✅ useSpecChat.ts created and working
- ✅ SpecCreationChat refactored to WebSocket
- ✅ ExpandProjectChat verified WebSocket-only
- ✅ Both components pass TypeScript compilation
- ✅ No console errors on browser

---

## TASK 3: Run Qodana Code Quality Scan (45 min)

### 3a. Execute Qodana
```bash
cd /home/kellyb_dev/projects/hex-ade
qodana scan --linter=jetbrains --baseline=<baseline-if-exists>
```

### 3b. Analyze Results
- Generate HTML report: `apps/web/.qodana/results/report.html`
- Categorize issues:
  - 🔴 Critical (MUST FIX)
  - 🟠 High (SHOULD FIX)
  - 🟡 Medium (NICE TO FIX)
  - 🟢 Low (INFO)

### 3c. Fix Critical + High Issues
**Priority Order**:
1. Type errors (TypeScript)
2. Unused variables
3. Dead code
4. Security issues
5. Performance anti-patterns

**Document Each Fix**:
- Issue: [Description]
- Root Cause: [Why it happened]
- Fix: [What changed]
- Verification: [How tested]

**Success Criteria**:
- ✅ Zero critical issues
- ✅ Zero high priority issues
- ✅ Medium/Low issues documented
- ✅ Report saved to `.flagpost/QODANA_SCAN_RESULTS.md`

---

## TASK 4: Run Cubic Security Review (45 min)

### 4a. Execute Cubic
```bash
cd /home/kellyb_dev/projects/hex-ade
cubic review --base main --max-issues 24
```

**Parameters**:
- `--base main`: Compare against main branch
- `--max-issues 24`: Limit to 24 findings (per user requirement)
- Filter: P0/P1 security issues ONLY

### 4b. Analyze Security Findings
**Categories**:
- 🔴 P0 - Critical (exploit/data breach risk)
- 🟠 P1 - High (authentication/authorization flaw)
- 🟡 P2 - Medium (defense bypass)
- 🟢 P3+ - Low (info disclosure)

### 4c. Fix P0/P1 Issues
**Required Fixes**:
- Authentication bypass vulnerabilities
- SQL/Command injection
- XSS vulnerabilities
- CORS misconfigurations
- Secrets exposure
- Deserialization attacks

**Document Each Fix**:
- Vulnerability: [CVE if applicable]
- Risk: [Impact if exploited]
- Fix: [Code change]
- Verification: [How tested]

**Success Criteria**:
- ✅ Zero P0 issues
- ✅ Zero P1 issues
- ✅ Remaining issues documented
- ✅ Report saved to `.flagpost/CUBIC_SECURITY_RESULTS.md`

---

## TASK 5: Full Audit Report (30 min)

### 5a. Create Comprehensive Audit Summary
**File**: `.flagpost/PHASE1_COMPLETE_AUDIT.md`

**Contents**:
```markdown
# Phase 1 Complete Audit Report

## Executive Summary
- Components: [X] refactored, [Y] optimized, [Z] documented
- Code Quality: Qodana score [X/100]
- Security: [X] P0 issues, [Y] P1 issues, [Z] fixed
- Test Coverage: [X]%
- Ready for Merge: YES/NO

## Qodana Findings
[Detailed breakdown by category]

## Cubic Security Findings
[Detailed breakdown by severity]

## WebSocket Refactor Summary
- SpecCreationChat: ✅ Refactored
- ExpandProjectChat: ✅ Verified
- useSpecChat: ✅ Created
- DependencyGraph: [Status]

## Performance Analysis
- Bundle size: [X] KB
- Initial load: [X] ms
- WebSocket latency: [X] ms

## Recommendations
1. [Priority 1]
2. [Priority 2]
3. [Priority 3]

## Sign-Off
- GC: [Date/Time]
- Status: READY FOR MERGE
```

### 5b. Update Memory
**File**: `/home/kellyb_dev/.claude/projects/-home-kellyb-dev-projects-hex-ade/memory/MEMORY.md`

Add section:
```markdown
## Phase 1 Audit Complete (2026-02-05)

✅ Refactoring:
- useSpecChat hook created
- SpecCreationChat: REST → WebSocket
- ExpandProjectChat: fetch → WebSocket

✅ Code Quality:
- Qodana: [X] critical, [Y] high fixed
- Cubic: [X] P0, [Y] P1 fixed

📋 Artifacts:
- PHASE1_COMPLETE_AUDIT.md
- QODANA_SCAN_RESULTS.md
- CUBIC_SECURITY_RESULTS.md
```

---

## TASK 6: Stage for PR (30 min)

### 6a. Commit Changes
```bash
cd /home/kellyb_dev/projects/hex-ade

# Stage refactored components
git add apps/web/src/components/SpecCreationChat.tsx
git add apps/web/src/components/ExpandProjectChat.tsx
git add apps/web/src/hooks/useSpecChat.ts

# Stage audit artifacts
git add .flagpost/PHASE1_COMPLETE_AUDIT.md
git add .flagpost/QODANA_SCAN_RESULTS.md
git add .flagpost/CUBIC_SECURITY_RESULTS.md

# Commit
git commit -m "refactor(websocket): Fix SpecChat/ExpandChat WebSocket integration + Phase 1 audit

- Create useSpecChat hook for real-time spec creation
- Refactor SpecCreationChat from REST to WebSocket
- Fix ExpandProjectChat WebSocket implementation
- Run Qodana: [X] critical issues fixed
- Run Cubic: [X] security issues fixed
- Add comprehensive Phase 1 audit report
- All components ready for production

Resolves: Phase 1 WebSocket architecture alignment"
```

### 6b. Verify Compilation
```bash
cd apps/web
pnpm lint
pnpm type-check
```

**Must Pass**:
- ✅ TypeScript compilation
- ✅ ESLint (no errors)
- ✅ No unused variables

---

## SUCCESS CRITERIA (All Required)

- ✅ Qodana & Cubic CLIs installed
- ✅ useSpecChat.ts created and tested
- ✅ SpecCreationChat refactored to WebSocket
- ✅ ExpandProjectChat WebSocket-only verified
- ✅ Qodana scan: 0 critical, 0 high issues
- ✅ Cubic scan: 0 P0, 0 P1 issues
- ✅ Phase 1 audit report written
- ✅ Memory updated with completion status
- ✅ Changes staged and committed
- ✅ TypeScript/ESLint pass with 0 errors
- ✅ Ready for PR review

---

## DELIVERABLES (Ready for User Review)

1. **Code Changes**:
   - useSpecChat.ts (new hook)
   - SpecCreationChat.tsx (refactored)
   - ExpandProjectChat.tsx (verified)

2. **Audit Reports**:
   - PHASE1_COMPLETE_AUDIT.md
   - QODANA_SCAN_RESULTS.md
   - CUBIC_SECURITY_RESULTS.md

3. **Commit Ready**:
   - Staged changes
   - Commit message prepared
   - All tests passing

4. **PR Description** (prepared for user):
   - Summary of changes
   - Audit findings
   - Risk assessment
   - Merge checklist

---

## TIMELINE
- Task 1 (CLI Install): 30 min
- Task 2 (Refactor): 90 min
- Task 3 (Qodana): 45 min
- Task 4 (Cubic): 45 min
- Task 5 (Audit Report): 30 min
- Task 6 (Stage PR): 30 min
**Total: ~4 hours**

---

## NOTES
- Use Codebase Investigator agent for detailed analysis
- All commands run in `/home/kellyb_dev/projects/hex-ade`
- Report all findings transparently
- Zero tolerance for P0/P1 security issues
- OC will handle WebSocket testing after refactor is complete
