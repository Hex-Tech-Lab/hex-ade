# hex-ade Product Requirements Document (PRD)
**Version**: 1.0
**Date**: 2026-02-03
**Status**: Draft

---

## 1. Executive Summary

**hex-ade** (Hexagonal Autonomous Development Environment) is a deterministic AI-assisted software development platform that enforces structured workflows (GOTCHA + ATLAS-VM) to produce consistent, high-quality software outputs.

### Core Principle
> "Get the probabilistic nature of LLMs out of the equation except where needed. Deterministic approach as the governing and compliance overarching tenant."

---

## 2. Problem Statement

Current AI-assisted development suffers from:
1. **Inconsistent outputs** - Same prompt yields different results
2. **Context window exhaustion** - Large JSON configs destroy context
3. **No quality gates** - Code ships without systematic validation
4. **Budget runaway** - No cost controls on API usage
5. **Session discontinuity** - Work lost between sessions

---

## 3. Solution Overview

A web-based development environment that:
1. Enforces **GOTCHA 5-phase** quality framework
2. Executes **ATLAS-VM 7-step** workflow per task
3. Uses **deterministic Python tools** for all operations
4. Tracks features in **Supabase** (not JSON files)
5. Persists memory and context across sessions
6. Provides **MCP server integration** for tool access

---

## 4. User Personas

### Primary: Solo Developer / Small Team Lead
- Needs consistent AI assistance
- Budget-conscious (tracks API spend)
- Values reproducibility over speed
- Wants "set and forget" automation

---

## 5. Functional Requirements

### 5.1 Core Features

| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| F01 | Project Management | P0 | Create, list, switch between projects |
| F02 | Document Package | P0 | PRD, HDS, TDD, WBS per project |
| F03 | Feature Tracking | P0 | SQLite/Supabase feature list (not JSON) |
| F04 | Task Execution | P0 | ATLAS-VM 7-step workflow |
| F05 | Quality Gates | P0 | GOTCHA 5-phase validation |
| F06 | Budget Control | P0 | Real-time spend tracking, kill switch |
| F07 | Time Boxing | P1 | Task duration estimates and alerts |
| F08 | Memory Persistence | P0 | Cross-session context retention |
| F09 | Model Router | P0 | Role-based model selection (9 roles) |
| F10 | Browser Testing | P1 | Phase-level + ad-hoc UI testing |
| F11 | MCP Integration | P1 | Tool server for external access |
| F12 | Auto-Continue | P2 | Resume on session timeout |

### 5.2 GOTCHA 5-Phase Framework

| Phase | Name | Purpose |
|-------|------|---------|
| G | Goals | Define clear objectives |
| O | Orchestration | Plan execution sequence |
| T | Tools | Select appropriate tooling |
| C | Checkpoints | Validate at each step |
| HA | Handoff/Audit | Final review and delivery |

### 5.3 ATLAS-VM 7-Step Workflow

| Step | Name | Tool |
|------|------|------|
| 1 | AUDIT | sentinel.py - Kill switch check |
| 2 | TIMEBOX | timebox.py - Start time budget |
| 3 | LOAD | memory/ - Load context |
| 4 | ASSEMBLE | router.py - Model selection + execution |
| 5 | SCAN | qodana_runner.py - Static analysis |
| 6 | VALIDATE | pr_sweeper.py - Review classification |
| 7 | MEMORY | memory/ - Persist learnings |

---

## 6. Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR01 | Response time | < 2s for UI interactions |
| NFR02 | Availability | 99% (Vercel SLA) |
| NFR03 | Data persistence | Zero data loss (Supabase) |
| NFR04 | Cost visibility | Real-time spend dashboard |
| NFR05 | Audit trail | All actions logged |

---

## 7. Technical Constraints

- **Frontend**: Next.js 15.x LTS, MUI + Tailwind
- **Backend**: Supabase (Postgres + pgvector + Auth)
- **Deployment**: Vercel
- **Tools**: Python 3.11+ deterministic scripts
- **Testing**: Vitest (unit), Playwright (E2E)

---

## 8. Out of Scope (v1.0)

- Multi-tenant SaaS
- Team collaboration features
- Custom model fine-tuning
- Mobile app

---

## 9. Success Metrics

| Metric | Target |
|--------|--------|
| Task completion consistency | > 95% same output for same input |
| Budget adherence | < 5% overage |
| Quality gate pass rate | > 90% first attempt |
| Session continuity | 100% context preserved |

---

## 10. Dependencies

- Supabase project provisioned
- Vercel account connected
- GitHub repository created
- API keys for model providers (OpenRouter, Cerebras)
