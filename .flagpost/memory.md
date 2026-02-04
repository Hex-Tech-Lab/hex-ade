# Shared Memory Log

## Purpose
Both agents (GC, OC) write learnings, decisions, and context here.
Auditor (Opus) reads and coordinates.

## Format
```
## [TIMESTAMP] [AGENT]
**Phase**: GOTCHA phase
**Step**: ATLAS-VM step
**Action**: What was done
**Learning**: Key insight
**Decision**: Any decision made
**Next**: What comes next
```

---

<!-- Memory entries below -->
