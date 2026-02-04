# hex-ade Context

## Project Overview
**hex-ade** (Hexagonal Autonomous Development Environment) is a deterministic AI-assisted software development platform. It enforces structured workflows (GOTCHA + ATLAS-VM) to produce consistent, high-quality software outputs, minimizing the probabilistic nature of LLMs where possible.

### Key Frameworks
- **GOTCHA (5 Phases)**: Goals, Orchestration, Tools, Checkpoints, Handoff/Audit.
- **ATLAS-VM (7 Steps)**: Audit, Timebox, Load, Assemble, Scan, Validate, Memory.

## Current State: Backend Port (Feb 4, 2026)
The Autonomous Coder backend has been ported to `hex-ade/server/`.
- **Core Logic**: Moved to `server/agents/` (`agent.py`, `orchestrator.py`, `client.py`, `prompts.py`, `registry.py`).
- **API Layer**: Moved to `server/api/` (`database.py`, `dependency_resolver.py`, etc.).
- **Server Root**: `server/main.py` (FastAPI), `server/start.py` (CLI), `server/autonomous_agent_demo.py`.
- **Services/Routers**: `server/services/` and `server/routers/` populated.
- **Imports**: Updated to use relative imports where necessary to support the new package structure.

## Tech Stack
- **Frontend**: Next.js 15, Material UI (MUI), Tailwind CSS (Located in `apps/web/`).
- **Backend**: Supabase (Postgres + pgvector + Auth).
- **Server/Agent**: Python 3.11+, FastAPI, SQLAlchemy, Claude Agent SDK (Located in `server/`).
- **Package Manager**: pnpm (Monorepo structure).

## Building and Running

### Prerequisites
- Node.js & pnpm
- Python 3.11+
- Supabase CLI

### Web Application
The web application is managed via pnpm from the root directory.

```bash
# Install dependencies
pnpm install

# Run development server (Web App)
pnpm dev
# OR specific filter
pnpm --filter web dev

# Build
pnpm build

# Lint
pnpm lint
```

### Python Server & Agents
The Python backend and autonomous agents are located in the `server/` directory.

```bash
# Navigate to server directory
cd server

# Install Python dependencies
pip install -r requirements.txt

# Run the FastAPI Server
python main.py
# OR using uvicorn directly
uvicorn server.main:app --reload --port 8888

# Run the Autonomous Agent CLI Launcher
python start.py

# Run the Agent Demo directly (CLI mode)
python autonomous_agent_demo.py --project-dir <path_to_project>
```

### Tests
```bash
# Unit Tests
pnpm test:unit

# E2E Tests
pnpm test:e2e
```

## Directory Structure
- `apps/web/`: Frontend application (Next.js).
- `server/`: Python backend and autonomous agent logic.
  - `agents/`: Core agent logic (`agent.py`, `orchestrator.py`, `client.py`).
  - `api/`: API endpoints and database models.
  - `mcp/`: Model Context Protocol tools.
  - `routers/`: FastAPI routers.
  - `services/`: Business logic services.
- `docs/`: Project documentation (PRD, HDS, TDD, WBS).
- `supabase/`: Supabase migrations and configuration.
- `mcp/`: Project-specific MCP tools.

## Development Conventions
- **Deterministic Approach**: Favor deterministic scripts over probabilistic LLM generation for governance.
- **Documentation**: Adhere to the PRD, HDS, TDD, and WBS documents in `docs/`.
- **Task Execution**: Follow the WBS for task execution sequence.