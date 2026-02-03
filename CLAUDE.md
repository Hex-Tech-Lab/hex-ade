# hex-ade Claude Code Instructions

## Project Overview
hex-ade is an Autonomous Development Environment using GOTCHA (5-phase) + ATLAS-VM (7-step) frameworks.

## Key Documents
- PRD: `docs/01-product/01-prd.md`
- HDS: `docs/02-design/01-hds.md`
- TDD: `docs/03-technical/01-tdd.md`
- WBS: `docs/04-planning/01-wbs.md`

## Core Principle
Deterministic Python tools govern all operations. LLM probabilistic nature only where needed.

## Task Execution
1. Find current task in WBS
2. Read relevant PRD/HDS/TDD sections
3. Implement ONLY that task
4. Validate using WBS validation command
5. Report completion

## Stack
- Frontend: Next.js 15 + MUI + Tailwind
- Backend: Supabase
- Tools: Python 3.11+
- Deploy: Vercel

## Commands
```bash
pnpm dev          # Development
pnpm lint         # Lint
pnpm test:unit    # Unit tests
pnpm test:e2e     # E2E tests
```
