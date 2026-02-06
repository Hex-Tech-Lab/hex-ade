# Phase 1 API Contract Verification

## REST Endpoints
| Feature | Method | Endpoint | Backend Router | Status |
|---------|--------|----------|----------------|--------|
| List Projects | GET | `/api/projects` | routers/projects.py | ✅ Verified |
| Get Project | GET | `/api/projects/{name}` | routers/projects.py | ✅ Verified |
| List Features | GET | `/api/projects/{name}/features` | routers/features.py | ✅ Verified |
| Agent Status | GET | `/api/projects/{name}/agent/status` | routers/agent.py | ✅ Verified |
| Start Agent | POST | `/api/projects/{name}/agent/start` | routers/agent.py | ✅ Verified |
| Pause Agent | POST | `/api/projects/{name}/agent/pause` | routers/agent.py | ✅ Verified |
| Stop Agent | POST | `/api/projects/{name}/agent/stop` | routers/agent.py | ✅ Verified |

## Schema Alignment (Backend Pydantic vs Frontend TypeScript)
- **Project**: `ProjectSummary` (Pydantic) ↔ `ProjectSummary` (TS) ✅
- **Feature**: `FeatureResponse` (Pydantic) ↔ `Feature` (TS) ✅
- **Agent**: `AgentStatus` (Pydantic) ↔ `AgentStatusResponse` (TS) ✅

## Orchestration Details
- All project-scoped endpoints correctly follow the `/api/projects/{project_name}/...` pattern.
- The `useFeatures` hook in the frontend correctly parses the grouped response (`pending`, `in_progress`, `done`).

## Security Note
- Endpoints require a valid `project_name` which exists in the local SQLite/Supabase database.
- Agent control endpoints properly interface with the `Orchestrator` service via the `Registry`.