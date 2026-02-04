# GC: Final Linting Cleanup (Quick Pass)

## OBJECTIVE
Fix remaining 10 lint warnings and create final Phase 1 commit.

## CURRENT STATE
- Warnings: 10 remaining (down from 24)
- Build: ✅ Clean (TypeScript passes)
- Components: ✅ All integrated
- Ready for: Final commit + Phase 1 merge

## TASK 1: Identify Remaining 10 Warnings (10 min)

```bash
cd /home/kellyb_dev/projects/hex-ade/apps/web
pnpm lint 2>&1 | grep "warning"
```

## TASK 2: Fix Each Warning (30 min)

Typical fixes:
- Remove unused imports
- Remove unused variables
- Fix type issues
- Remove console.log statements

```bash
# Auto-fix what can be auto-fixed
pnpm lint -- --fix
```

## TASK 3: Manual Fixes (15 min)

For warnings that can't auto-fix:
- Edit files directly
- Remove unused code
- Verify compilation

## TASK 4: Final Verification (5 min)

```bash
pnpm lint
# Expected: ✖ 0 problems (0 errors, 0 warnings)
```

## TASK 5: Commit Phase 1 Complete (10 min)

```bash
git add apps/web/src/**
git commit -m "chore(lint): Final cleanup - Phase 1 ready for merge

All 10 remaining linting warnings resolved.
WebSocket infrastructure complete and tested.
Ready for Phase 1 merge."

git log --oneline -1
```

## SUCCESS CRITERIA
- ✅ Zero lint warnings
- ✅ Build clean
- ✅ Commit created
- ✅ Ready for Phase 1 merge decision

**ETA: 1-2 hours**
