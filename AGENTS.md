# AGENTS.md - hex-ade Coding Agent Guidelines

## Build Commands

### Web Application (Frontend)

```bash
# Development
pnpm dev                    # Start Next.js dev server (port 5173)
pnpm --filter web dev       # Alternative: specific filter

# Build
pnpm build                  # Build for production

# Linting & Type Checking
pnpm lint                   # Run ESLint
pnpm type-check             # TypeScript type checking

# Testing
pnpm test:unit              # Run Vitest unit tests
pnpm test:e2e               # Run Playwright E2E tests
```

### Python Server & Agents (Backend)

```bash
# Navigate to server directory
cd server

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI Server
python main.py
# OR using uvicorn directly
uvicorn server.main:app --reload --port 8888

# Run the Autonomous Agent CLI Launcher
python start.py

# Run the Agent Demo directly (CLI mode)
python autonomous_agent_demo.py --project-dir <path_to_project>

# Testing
cd server && python -m pytest                    # Run all Python tests
cd server && python -m pytest tests/test_file.py   # Run single test file
cd server && python -m pytest -k test_name        # Run single test by name

# Code Quality (Python)
cd server && ruff check .                         # Python linting
cd server && ruff check --fix .                   # Auto-fix Python issues
cd server && mypy .                               # Python type checking
```

## Code Style Guidelines

### TypeScript/JavaScript (Frontend)

**Imports**
- Use absolute imports with `@/` prefix for project files
- Group imports: React → libraries → `@/` → relative
- Use type imports: `import type { Foo } from "./types"`

**Formatting**
- Use Prettier defaults (no config file found)
- 2 spaces indentation
- Semicolons required
- Single quotes preferred

**Types**
- Strict TypeScript mode
- Explicit return types on exported functions
- Use `interface` for object shapes, `type` for unions/complex types
- Zod schemas for API validation

**Naming Conventions**
- `PascalCase`: Components, types, interfaces
- `camelCase`: variables, functions, methods
- `UPPER_CASE`: constants, environment variables
- `kebab-case`: file names, CSS classes

### Python (Backend & Tools)

**Imports**
- Standard library → third-party → local imports
- Use absolute imports with explicit module paths
- Lazy imports allowed to avoid circular dependencies

**Formatting**
- Ruff for linting and formatting
- Black-compatible style
- Line length: 88 characters (Black default)
- Double quotes for strings

**Docstrings**
- Triple double quotes `"""`
- Module-level docstrings required
- Function docstrings for public APIs

**Type Hints**
- Required for all function parameters and returns
- Use `from __future__ import annotations` for forward refs
- Use `typing` module: `Optional`, `Union`, `Callable`

**Naming Conventions**
- `PascalCase`: Classes, Pydantic models
- `snake_case`: functions, variables, modules
- `SCREAMING_SNAKE_CASE`: constants
- `kebab-case`: not used in Python

**Error Handling**
- Raise specific exceptions with descriptive messages
- Use FastAPI's `HTTPException` for API errors
- Always clean up resources in `finally` blocks or context managers
- Use `assert` only for internal invariants, not validation

**Logging**
- Use module-level logger: `logger = logging.getLogger(__name__)`
- Log levels: DEBUG (details), INFO (operations), WARNING (issues), ERROR (failures)

## Project Structure

```
hex-ade/
├── apps/web/              # Next.js 15 frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   ├── lib/           # Utilities, hooks, Supabase client
│   │   └── stores/        # Zustand stores
│   └── tests/             # Vitest + Playwright tests
├── server/                # Python FastAPI backend & agents
│   ├── agents/            # Core agent logic
│   │   ├── agent.py       # Main agent implementation
│   │   ├── orchestrator.py # ATLAS-VM workflow orchestrator
│   │   ├── client.py      # Claude SDK client
│   │   ├── prompts.py     # Prompt templates
│   │   └── registry.py    # Project registry
│   ├── api/               # API endpoints and database layer
│   ├── routers/           # FastAPI route handlers
│   ├── services/          # Business logic services
│   ├── mcp/               # Model Context Protocol tools
│   ├── main.py            # FastAPI app entry
│   ├── start.py           # CLI launcher
│   └── schemas.py         # Pydantic models
├── tools/                 # Deterministic Python tools
│   └── memory/            # Memory persistence tools
├── docs/                  # Documentation (PRD, HDS, TDD, WBS)
├── supabase/              # Database migrations
└── mcp/                   # Project-specific MCP tools
```

## Key Architectural Patterns

### Frontend (Next.js + MUI + Tailwind)
- **App Router**: Use `page.tsx` for routes
- **Components**: MUI components styled with Tailwind utilities
- **State**: Zustand for global state, React hooks for local
- **API**: Supabase client for database, fetch for custom endpoints

### Backend (FastAPI)
- **Routers**: Organized by domain (projects, features, agents)
- **Schemas**: Pydantic models for request/response validation
- **Services**: Business logic separated from route handlers
- **Database**: Supabase (Postgres) via SQLAlchemy

### Tools (Deterministic Python)
- **Router**: `router.py` - Role-based model selection
- **Orchestrator**: `orchestrator.py` - ATLAS-VM workflow
- **Memory**: `tools/memory/` - Context persistence
- All tools are deterministic (no LLM calls except via router)
- **Core Principle**: Favor deterministic scripts over probabilistic LLM generation for governance and compliance

## Framework Reference

### GOTCHA (5 Phases)
1. **G**oals - Define clear objectives
2. **O**rchestration - Plan execution sequence
3. **T**ools - Select appropriate tooling
4. **C**heckpoints - Validate at each step
5. **HA** - Handoff/Audit - Final review

### ATLAS-VM (7 Steps)
1. AUDIT - sentinel.py - Kill switch check
2. TIMEBOX - timebox.py - Start time budget
3. LOAD - memory/ - Load context
4. ASSEMBLE - router.py - Model selection + execution
5. SCAN - qodana_runner.py - Static analysis
6. VALIDATE - pr_sweeper.py - Review classification
7. MEMORY - memory/ - Persist learnings

## Testing Requirements

**Unit Tests**
- Target: 80%+ coverage for API routes, 90%+ for stores/utils
- Vitest for TypeScript, pytest for Python
- Mock external services (Supabase, LLM APIs)

**E2E Tests**
- Playwright for critical user flows
- Run on every PR: Auth, Project CRUD, Feature CRUD
- Phase-level triggers after each GOTCHA phase

## Environment Variables

Required in `.env.local` (frontend) and `.env` (backend):
- `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
- `OPENROUTER_API_KEY` / `CEREBRAS_API_KEY`
- `GITHUB_PAT` (for PR sweeper)

## Dependencies

**Frontend**
- Next.js 15, React 18, TypeScript 5
- MUI 5, Tailwind CSS 3
- Zustand 4, Supabase client

**Backend**
- Python 3.11+, FastAPI, Uvicorn
- SQLAlchemy 2.0, Pydantic
- pytest, ruff, mypy

## Code Review Checklist

- [ ] TypeScript types are explicit
- [ ] Python functions have type hints
- [ ] Error handling includes user-friendly messages
- [ ] No `console.log` in production code (use logger)
- [ ] No hardcoded secrets or API keys
- [ ] Tests added/updated for new functionality
- [ ] Documentation updated (if needed)
