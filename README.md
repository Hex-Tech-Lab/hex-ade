# hex-ade

**Hexagonal Autonomous Development Environment**

A deterministic AI-assisted software development platform that enforces structured workflows (GOTCHA + ATLAS-VM) to produce consistent, high-quality software outputs.

## Core Principle

> "Get the probabilistic nature of LLMs out of the equation except where needed. Deterministic approach as the governing and compliance overarching tenant."

## Documentation

- [PRD](docs/01-product/01-prd.md) - Product Requirements
- [HDS](docs/02-design/01-hds.md) - High-Level Design
- [TDD](docs/03-technical/01-tdd.md) - Technical Design
- [WBS](docs/04-planning/01-wbs.md) - Work Breakdown Structure

## Tech Stack

- **Frontend**: Next.js 15, MUI, Tailwind CSS
- **Backend**: Supabase (Postgres + pgvector + Auth)
- **Tools**: Deterministic Python scripts
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run tests
pnpm test:unit
pnpm test:e2e
```

## Frameworks

### GOTCHA (5 Phases)
1. **G**oals - Define objectives
2. **O**rchestration - Plan execution
3. **T**ools - Select tooling
4. **C**heckpoints - Validate
5. **H**andoff/**A**udit - Deliver

### ATLAS-VM (7 Steps)
1. AUDIT - Sentinel gate check
2. TIMEBOX - Start time budget
3. LOAD - Memory context
4. ASSEMBLE - Model selection + execution
5. SCAN - Static analysis
6. VALIDATE - Review classification
7. MEMORY - Persist learnings

