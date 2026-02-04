# hex-ade Handover Summary
**Date**: 2026-02-04
**Source**: Transferred from hex-rag-dss session (ses_4200) - Project context transfer
**Purpose**: Complete context coverage for hex-ade with zero setup questions

---

## Executive Summary
This document captures all strategic decisions, technical requirements, agent orchestration rules, and next steps from the hex-rag-dss planning session. Work is now consolidated in **hex-ade** (the correct project).

---

## Project Identity & Core Constraints

### Project Name
**hex-ade**: Autonomous Development Environment using GOTCHA (5-phase) + ATLAS-VM (7-step) frameworks

### Stack (FROZEN - Non-negotiable)
- **Frontend**: Next.js 15 + MUI 6.4.3 + MUI X (MIT version)
- **Backend**: Supabase (REST API for initial work; SQL deferred)
- **Package Manager**: pnpm ONLY (never npm/yarn)
- **TypeScript**: Strict mode enabled
- **Deployment**: Vercel (prefer eu-central-1/Frankfurt)
- **Repository**: Public GitHub (required for free-tier review tools)

---

## Agent Orchestration Rules

### OC (OpenCode Agent) Identity & Instructions
**Identity**: OC is a 0.1% world-class expert full-stack developer and system architect
**LLM**: Grok Code Fast 1 (GKF1) baseline

### CORE RULES (OC MANDATORY)
```
- Assume 0.1% expert in ANY domain/subdomain on demand
- Multi-modal expertise combined until task concluded
- Coding style: Follow CONTRIBUTING.md standards
- Act as thought partner: push back when trajectory misaligns
- Ask max 1 clarifying question if <95% confident
- NO appeasement; challenge illogical paths immediately
- Think step-by-step
- Critique your own response
```

### COMMUNICATION STYLE (OC MANDATORY)
```
- TOC structure: sections (##) + bullets (-)
- 7-15 words/bullet (max 25 for complex concepts)
- Direct, non-verbose, expert-level assumptions
- Expand ONLY if: explanation needed, user missing point, handicap anticipated
```

### QUALITY DISCIPLINE (OC MANDATORY)
```
- Check objective alignment every iteration
- Flag: futility, off-track work, troubleshooting loops, time waste
- Recommend correctives: brief, swift, precise
- First-time resolution mindset: think/plan/check/validate
- Verify First. Verify 10x → Plan 10x → Execute 1x
- Validate MORE → Execute LESS
- Verify → Trust → Act
```

---

## Critical Protocols

### GIT SYNC PROTOCOL (START EVERY TASK)
```bash
git fetch origin
git checkout main
git pull origin main
git branch -r | head -20
ls -la src/components/ src/app/
```

**Key Rules**:
- GitHub = single source of truth
- Isolated sandboxes require explicit sync
- ALWAYS verify repo state before starting work
- One agent per feature (no overlap)
- Every session ends: `git checkout -b [agent]/[feature] → commit → push → PR`

### NEVER RECREATE PROJECT (CRITICAL)
- hex-ade is ESTABLISHED Next.js project (1000+ files)
- If src/ directory exists with components → DO NOT run create-next-app
- If package.json exists → DO NOT initialize new project
- If tsconfig.json exists → DO NOT overwrite configs
- VERIFY before creating: Check for existing components
- If files missing → STOP and ask user, don't assume empty repo

### VERIFICATION MANDATE
```
- Run commands, don't estimate (wc -l, git log, curl)
- Verify with tools before claiming metrics
- Check git status before/after changes
- Query Supabase directly, don't trust claims
- Never assume. Never accept reports. Run quick check, Verify, Expand coverage.
```

---

## Workflow Enforcement (MANDATORY)

### PR Automation (AFTER EVERY CODE COMMIT)
```
1. Create PR immediately (gh or curl)
2. Run pnpm run pr:scrape <PR#>
3. Apply 3-bucket classification
4. Merge if BUCKET 1, report if BUCKET 2/3
```

**Review Tools**: CodeRabbit, Sourcery, Sonar, Snyk, Sentry (auto-run on PRs)

### Documentation Sync Protocol (AFTER COMPLETING WORK)
Update in this order:
```
1. docs/PERFORMANCE_LOG.md (mandatory timestamp format)
2. Agent-specific MD file (CLAUDE.md for CC, OC instructions, etc.)
3. COMMIT changes with timestamp reference
```

### Mandatory Timestamp Format (docs/PERFORMANCE_LOG.md)
```
## YYYY-MM-DD HHMM TZ - [AGENT] - [Task Name]
**Timebox**: X minutes (planned)
**Start**: YYYY-MM-DD HHMM TZ
**End**: YYYY-MM-DD HHMM TZ
**Actual Duration**: X minutes
**Variance**: +/-X minutes (+/-X%)
**Agent**: [PPLX/CC/BB/CCW/GC]
**Outcome**: SUCCESS/PARTIAL/BLOCKED
```

---

## MCP Servers Configuration

### Global MCP Config Location
```
~/.config/opencode/opencode.json
```

### Configured Servers (13 total)
1. **github** - Docker-based repo/issue/PR access
2. **git** - Local git operations
3. **supabase** - Supabase REST API (NOT SQL initially)
4. **context7** - MUI 6.4.3 docs access (CRITICAL for components)
5. **sentry** - Error tracking
6. **filesystem** - Local filesystem access (/home/kellyb_dev/projects)
7. **sequentialthinking** - Reasoning chains
8. **memory** - Session memory persistence
9. **playwright** - Browser automation
10. **codegen** - Code generation
11. **vercel** - Deployment management
12. **testsprite** - Testing automation
13. **brave-search** - Web search capability

**Priority**: MCP servers FIRST for autonomous environment interaction. CLI/API as fallback.

---

## MUI Component Strategy

### MUI Treasury Integration
- Source: MUI Treasury (mui-treasury.com) for pre-built layout patterns
- Complex inputs: Use MUI Treasury + MUI X data tables
- Specialized components: "SecondBrain" patterns from treasury

### Atomic Design Structure (MANDATORY)
```
src/components/
├── atoms/          (basic: buttons, inputs, labels)
├── molecules/      (combined: form groups, cards, headers)
├── organisms/      (complex: layouts, data tables, modals)
└── theme.ts        (Single Source of Truth for global styles)
```

### Theme Configuration
- **theme.ts** = Single Source of Truth for all global styles
- All AI-generated components respect design tokens (no manual CSS overrides)
- Enable context7 MCP for latest MUI 6.4.3 syntax (prevents deprecated v4/v5 usage)

---

## Project Initialization Progress

### Completed Steps
✅ Step 1: MCP Environment Configuration (Confirmed)
✅ Step 2: GitHub Repository Creation (Confirmed with MCP priority)
✅ Step 3: MCP Global Config File Creation (COMPLETED)
   - File: /home/kellyb_dev/.config/opencode/opencode.json
   - All 13 servers configured
   - JSON validated and written successfully

### Next Steps (Execution Phase)
- [ ] **Step 4**: Project Initialization
  - Clone hex-ade repo to local environment
  - Initialize Next.js 15 with MUI 6.4.3 + MUI X (MIT)
  - Install: `pnpm add @mui/material @emotion/react @emotion/styled @mui/x-data-grid`
  - Create atomic design folder structure

- [ ] **Step 5**: Supabase & Vercel Linking
  - Create Supabase project
  - Create Vercel project
  - Link both to GitHub

- [ ] **Step 6**: Database Schema
  - Run migrations
  - Set up YouTube OAuth flow

- [ ] **Step 7**: Core Features Implementation
  - YouTube OAuth authentication
  - Processing pipeline
  - RAG/Vector search foundation

- [ ] **Step 8**: UI/Decision Workflows
  - Screens from PRD
  - Vector search interface
  - Decision logging

- [ ] **Step 9**: Review Tool Integration & Testing
  - Enable CodeRabbit, Sourcery, Snyk, Sentry
  - Run end-to-end tests with sample data
  - Iterate on review feedback

---

## Key Decisions Made

### GitHub Repo Privacy
- **Decision**: Public repo (non-negotiable)
- **Reason**: Enable free-tier review tools (CodeRabbit, Sourcery, Snyk, Sentry)
- **Bootstrap Constraint**: Zero dollars in pocket

### Project Isolation
- **Decision**: Work EXCLUSIVELY on hex-ade
- **Exception**: Only grab PR scraper/classifier from hex-test-drive-man (later, via GitHub access)
- **Reason**: Prevent context pollution and project confusion

### MCP Priority
- **Decision**: Use MCP servers for all environment interactions
- **Fallback**: CLI/API if MCP unavailable
- **Special**: Supabase uses REST API (SQL deferred)

### Supabase Approach
- **Initial**: Repository pattern + REST API (MVP 1.5+)
- **Future**: Drizzle ORM (after MVP foundation)
- **SQL Direct**: Not used initially (use REST)

---

## Session Context Bridge

### Original Planning Session
- Session ID: ses_4200 (from hex-rag-dss project folder)
- Participants: User + OC (Grok Code architect)
- Duration: Multiple rounds of requirements clarification and step-by-step planning
- Outcome: Complete technical architecture and MCP configuration for hex-ade

### Transition Context
- Original session accidentally started in hex-test-drive-man folder
- This summary transfers all context to correct project: hex-ade
- No re-planning needed; all decisions finalized and documented
- Ready for immediate execution phase

---

## Quick Reference: MCP Server Setup Command

```bash
# Verify MCP config exists
cat ~/.config/opencode/opencode.json

# Restart OpenCode to activate MCP servers
# (exact command depends on OpenCode implementation)

# Verify servers loaded
/mcp  # If command becomes available after restart
```

---

## Immediate Next Action

**Execute Step 4: Project Initialization**

Prerequisites:
- ✅ MCP servers configured at ~/.config/opencode/opencode.json
- ✅ GitHub repo exists (public, hex-ade)
- ✅ User authenticated with GitHub via MCP

Action:
```bash
cd /home/kellyb_dev/projects/hex-ade
git fetch origin
git checkout main
git pull origin main

# Verify existing project structure
ls -la src/ package.json tsconfig.json

# If all exist: proceed to Step 5
# If missing: clarify with user before initializing
```

---

## Files to Review in hex-ade
- `.flagpost/memory.md` - Project memory
- `docs/01-product/01-prd.md` - Product requirements
- `docs/02-design/01-hds.md` - Hardware/design specs
- `docs/03-technical/01-tdd.md` - Technical design
- `docs/04-planning/01-wbs.md` - Work breakdown structure

---

## Status
- **Project**: hex-ade (Autonomous Development Environment)
- **Phase**: Ready for execution (post-planning)
- **Blocker**: None
- **Context**: 100% coverage; zero setup questions required
- **Last Updated**: 2026-02-04 11:15 UTC

---

**End of Handover Summary**
