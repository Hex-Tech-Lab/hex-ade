# 🔗 API Contract - Frontend ↔ Backend Integration

**Date Created:** 2026-02-04
**Status:** ✅ VERIFIED - All endpoints implemented and matching schemas
**Framework:** GOTCHA INTEGRATION Phase

---

## Purpose

This document defines the API contract between:
- **Frontend:** OC (Kimi K2.5) - `apps/web/src/`
- **Backend:** GC (Gemini Flash) - `server/`

Both agents must agree on:
1. Endpoint paths and HTTP methods
2. Request/response schemas
3. Error handling formats
4. Authentication (if needed)

---

## Phase 1: Frontend Declares Needs ✅

### What OC Needs from Backend

**Pages that need APIs:**
- ✅ `/` (Dashboard) - Project selector needs real projects list, metrics need real data
- ✅ `/projects` - Full CRUD: List, view details, delete
- ✅ `/projects/new` - POST to create new project

---

### Detailed Component Requirements

#### Page: Dashboard (/)

**Component: ProjectSelector (Top Bar)**
- **Current:** `projects={[]}` (hardcoded empty array)
- **Data needed:** List of all projects with id, name, stats
- **Endpoint:** `GET /api/projects`
- **Frequency:** On page load, after project creation/deletion
- **Response format:** Array of ProjectSummary objects

**Component: MetricsBar (Top Bar)**
- **Current:** `stats={mockStats}` (hardcoded)
- **Data needed:** passing count, in_progress count, total count, percentage
- **Endpoint:** Derived from project features OR `GET /api/projects/:name/stats`
- **Frequency:** Real-time via WebSocket OR poll every 5 seconds

**Component: KanbanBoard (Main)**
- **Current:** `mockFeatures` array (40 fake features)
- **Data needed:** All features for selected project with status, priority, category
- **Endpoint:** `GET /api/projects/:name/features`
- **Frequency:** On project change, after agent operations

**Component: DebugPanel (Bottom)**
- **Current:** Empty logs array
- **Data needed:** Real-time agent logs, system logs
- **Endpoint:** WebSocket `/ws/projects/:name` (already exists!)
- **Status:** ✅ Already integrated

---

#### Page: Projects List (/projects)

**Component: ProjectsPage (Main)**
- **Current:** `mockProjects` array with 2 fake projects
- **Data needed:** All projects with full details
  - name, path, has_spec, stats (passing/in_progress/total/percentage)
  - default_concurrency, created_at, updated_at
- **Endpoints:**
  - `GET /api/projects` - List all projects
  - `DELETE /api/projects/:name` - Delete project (for trash icon)
- **Frequency:** On page load, after create/delete operations

---

#### Page: New Project (/projects/new)

**Component: NewProjectPage (Wizard)**
- **Current:** `handleCreate()` simulates API with setTimeout
- **Data needed:** POST endpoint to create project
- **Endpoint:** `POST /api/projects`
- **Request body:**
  ```json
  {
    "name": "string (required, unique)",
    "path": "string (required, absolute path)",
    "concurrency": "number (1-5, default: 3)"
  }
  ```
- **On success:** Redirect to `/?project={name}`

---

## Phase 2: Backend Declares Available Endpoints ✅

### What GC Can Provide

**Confirmed Production-Ready Endpoints:**
- ✅ `GET /health` - System health check (Root level)
- ✅ `GET /api/health` - System health check (API level)
- ✅ `GET /api/projects` - List all projects with summaries
- ✅ `POST /api/projects` - Create/Scaffold a new project
- ✅ `GET /api/projects/{name}` - Get detailed info for a single project
- ✅ `PATCH /api/projects/{name}/settings` - Update concurrency/settings
- ✅ `DELETE /api/projects/{name}` - Unregister or delete project files
- ✅ `GET /api/projects/{name}/features` - Get grouped features (pending/in_progress/done)
- ✅ `GET /api/projects/{name}/stats` - Get passing/total/percentage
- ✅ `GET /api/projects/{name}/agent/status` - Current agent execution state
- ✅ `WS /ws/projects/{name}` - Real-time logs and status updates

**Limitations & Notes:**
- **Auth:** Currently no authentication (local-only mode). All endpoints are open to localhost.
- **Filtering:** `GET /api/projects` does not currently support server-side sort/limit.
- **Stats:** `/api/projects/{name}/stats` returns raw counts; percentage is calculated client-side or server-side.

---

## Phase 3: Agreed Schemas

### Request/Response Format (STANDARD FOR ALL)

**Success Response (200/201):**
```json
{
  "status": "success",
  "data": {
    // Actual data here
  },
  "meta": {
    "timestamp": "ISO8601",
    "version": "1.0"
  }
}
```

**Error Response (400+):**
```json
{
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  },
  "meta": {
    "timestamp": "ISO8601"
  }
}
```

---

## Endpoint Details

### GET /api/projects
**Purpose:** Fetch all registered projects  
**Auth:** None  
**Response Data:**
```json
{
  "projects": [
    {
      "name": "string",
      "path": "string",
      "has_spec": "boolean",
      "stats": {
        "passing": "number",
        "in_progress": "number",
        "total": "number",
        "percentage": "number"
      },
      "default_concurrency": "number"
    }
  ]
}
```

---

### POST /api/projects
**Purpose:** Create new project  
**Request:**
```json
{
  "name": "string",
  "path": "string",
  "spec_method": "claude|manual"
}
```
**Response Data:** Same as single project in GET /api/projects

---

### GET /api/projects/{name}/features
**Purpose:** Fetch all features organized by status  
**Response Data:**
```json
{
  "pending": [ { "id": 1, "name": "...", ... } ],
  "in_progress": [ ... ],
  "done": [ ... ]
}
```

---

### GET /api/projects/{name}/stats
**Purpose:** Get project metrics  
**Response Data:**
```json
{
  "passing": "number",
  "in_progress": "number",
  "total": "number",
  "percentage": "number"
}
```

---

### GET /api/projects/{name}/agent/status
**Purpose:** Get agent lifecycle state  
**Response Data:**
```json
{
  "status": "stopped|running|paused|crashed",
  "pid": "number|null",
  "started_at": "ISO8601|null",
  "yolo_mode": "boolean",
  "model": "string|null",
  "max_concurrency": "number",
  "testing_agent_ratio": "number"
}
```

---

## Implementation Plan

### Phase 1: OC declares needs ✅ COMPLETE
- [x] Document all pages needing APIs
- [x] Document all components needing data
- [x] Specify data shapes needed

### Phase 2: GC declares available endpoints ✅ COMPLETE
- [x] GC reviews Phase 1
- [x] GC confirms which endpoints exist
- [x] GC adds any missing endpoints
- [x] GC fills in schema details

### Phase 3: Both agree on schemas ✅ COMPLETE
- [x] Review together
- [x] Resolve any discrepancies
- [x] Finalize error codes
- [x] Both sign off

### Phase 4: Implementation & Verification ✅ COMPLETE
- [x] GC implements standard response wrappers
- [x] GC implements global error handlers
- [x] GC verifies all 7 endpoints work and match schema

### Phase 5: Frontend Integration ⏳ IN PROGRESS
- [ ] OC updates frontend pages to use real APIs
- [ ] Test integration

---

## Integration Checklist

**For GC:**
1. Review "Phase 1" (what OC needs) above ✅
2. Confirm which endpoints you can provide ✅
3. Fill in "Endpoint Details" with your actual response schemas ✅
4. Comment on any limitations or changes needed ✅

**For OC:**
1. Review "Phase 2" (what's available) when GC fills it ✅
2. Check "Endpoint Details" for exact schemas ✅
3. Use schemas to wire components ⏳

**For Kelly (Auditor):**
1. Ensure both have filled in their sections ✅
2. Look for any gaps or mismatches ✅
3. Approve the contract before implementation starts ✅

---

## Status Tracking

| Field | Value | Updated |
|-------|-------|---------|
| **Created** | 2026-02-04 | ✅ |
| **OC Input (Phase 1)** | ✅ COMPLETE | 2026-02-04 |
| **GC Input (Phase 2)** | ✅ COMPLETE | 2026-02-04 |
| **Approved (Phase 3)** | ✅ COMPLETE | 2026-02-04 |
| **Backend Verified (Phase 4)** | ✅ COMPLETE | 2026-02-04 |
| **Implementation Start** | ✅ STARTED | 2026-02-04 |

---

## Next Action

**OC:** Backend is verified and matching the agreed standard schema. Please proceed with wiring the frontend components using the `/api` endpoints. Standard wrapper `{"status": "success", "data": ...}` is applied to all successful responses.

**Current Status:** Backend ready for integration.

