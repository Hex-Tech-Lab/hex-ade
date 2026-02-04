# GC: Create Supabase Instance (Frankfurt) - Automated Setup

**Status:** PRIORITY TASK
**Authority:** Direct execution approval
**Timeline:** 30-45 minutes
**Framework:** ATLAS-VM Single-Phase

---

## Task Overview

Create Supabase PostgreSQL instance in Frankfurt region named `hex-ade` and run migrations to establish database schema.

---

## Prerequisites Check

```bash
# Verify Supabase CLI installed
supabase --version

# If not installed:
npm install -g supabase

# Verify credentials available
echo $SUPABASE_ACCESS_TOKEN
# Should output your Supabase access token
```

---

## Phase 1: Create Supabase Instance (Frankfurt)

### Step 1: Create Project via Supabase CLI

```bash
# Create new Supabase project
supabase projects create \
  --name hex-ade \
  --region eu-frankfurt \
  --db-password $(openssl rand -base64 32)

# This returns:
# {
#   "project_id": "[project-id]",
#   "name": "hex-ade",
#   "region": "eu-frankfurt",
#   "db_host": "[db-host].supabase.co",
#   "db_name": "postgres",
#   "db_user": "postgres",
#   "db_password": "[password]",
#   "anon_key": "[anon-key]",
#   "service_role_key": "[service-role-key]"
# }
```

### Step 2: Store Credentials

```bash
# Save credentials to .env files

# Store output from above command
PROJECT_ID="[from output]"
DB_HOST="[from output]"
DB_PASSWORD="[from output]"
ANON_KEY="[from output]"
SERVICE_ROLE_KEY="[from output]"

# Create DATABASE_URL
DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@${DB_HOST}:5432/postgres?sslmode=require"

# Store in server/.env
cat > server/.env << EOF
DATABASE_URL=$DATABASE_URL
SUPABASE_URL=https://${PROJECT_ID}.supabase.co
SUPABASE_SERVICE_KEY=$SERVICE_ROLE_KEY
SUPABASE_ANON_KEY=$ANON_KEY
EOF

# Store in apps/web/.env.local
cat > apps/web/.env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=https://${PROJECT_ID}.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY
EOF

# Store for Vercel deployment
cat > .env.production << EOF
NEXT_PUBLIC_SUPABASE_URL=https://${PROJECT_ID}.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY
EOF

echo "✅ Credentials stored"
```

### Step 3: Verify Connection

```bash
# Test database connection
psql "$DATABASE_URL" -c "SELECT version();"

# Should output PostgreSQL version if successful
```

---

## Phase 2: Run Migrations

### Step 1: Execute Initial Schema

```bash
# Run migration to create schema
psql "$DATABASE_URL" < supabase/migrations/001_initial_schema.sql

# Output should show:
# CREATE TABLE
# CREATE TABLE
# CREATE TABLE
# CREATE TABLE
# CREATE INDEX
# ... etc
```

### Step 2: Verify Schema Created

```bash
# List tables
psql "$DATABASE_URL" -c "\dt"

# Should show:
#           List of relations
# Schema |      Name       | Type  | Owner
# --------+-----------------+-------+----------
# public | projects        | table | postgres
# public | features        | table | postgres
# public | tasks           | table | postgres
# public | agent_logs      | table | postgres

# Verify RLS enabled
psql "$DATABASE_URL" -c "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public';"

# Should show all tables with rowsecurity=true
```

### Step 3: Verify Data Can Be Inserted

```bash
# Test insert
psql "$DATABASE_URL" -c "INSERT INTO projects (name, path) VALUES ('test', '/tmp/test');"

# Test read
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM projects;"

# Output should show: count = 1
```

---

## Phase 3: Verify Backend Connection

```bash
# Start backend
cd server
python -m uvicorn main:app --reload &

# Wait for startup
sleep 3

# Test GET /api/projects endpoint
curl http://localhost:8000/api/projects

# Should return:
# {"status":"success","data":{"projects":[{"name":"test","path":"/tmp/test",...}]}}

# Test POST endpoint
curl -X POST http://localhost:8000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"test-project-2","path":"/tmp/test2","concurrency":3}'

# Should return 201 with new project data

# Verify database was updated
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM projects;"

# Output should show: count = 2

# Kill backend
pkill -f "uvicorn main:app"
```

---

## Phase 4: Verification & Documentation

```bash
# Create verification report
cat > .flagpost/SUPABASE_SETUP_COMPLETE.md << 'EOF'
# Supabase Setup Completion Report

**Date:** $(date -Iseconds)
**Project:** hex-ade
**Region:** Frankfurt (eu-frankfurt)
**Status:** ✅ COMPLETE

## Verified Items
- [x] Supabase instance created in Frankfurt
- [x] Database credentials obtained
- [x] Connection string working
- [x] Initial schema migration executed
- [x] All 4 tables created
- [x] RLS policies applied
- [x] Indexes created
- [x] Data can be inserted/read
- [x] Backend connects successfully
- [x] API endpoints return correct data

## Credentials Location
- Server: server/.env
- Frontend: apps/web/.env.local
- Production: .env.production

## Next Steps
1. Run `pnpm dev` in apps/web/
2. Run `uvicorn main:app --reload` in server/
3. Test all API endpoints
4. Deploy to Vercel

## Timeline
- Setup: 30-45 minutes
- Ready for: Full stack testing
EOF

cat .flagpost/SUPABASE_SETUP_COMPLETE.md
```

---

## Success Checklist

- [ ] Supabase CLI installed
- [ ] Project created in Frankfurt region
- [ ] Database URL generated
- [ ] Credentials stored in .env files
- [ ] psql connection verified
- [ ] Migration executed successfully
- [ ] All 4 tables created
- [ ] RLS enabled on all tables
- [ ] Data inserted and queried successfully
- [ ] Backend connected and tested
- [ ] API endpoints return correct data
- [ ] Verification report created
- [ ] .flagpost/SUPABASE_SETUP_COMPLETE.md created
- [ ] Log completion to memory.md

---

## Log Completion

```bash
cat >> .flagpost/memory.md << 'EOF'
## $(date -Iseconds) GC - SUPABASE SETUP COMPLETE
**Phase:** INTEGRATION - Database Infrastructure
**Action:** Created Supabase instance in Frankfurt + ran migrations
**Deliverables:**
- Supabase project: hex-ade (Frankfurt region)
- PostgreSQL database with 4 tables
- RLS policies enabled
- Migration executed successfully
- Backend connection verified
- All endpoints tested
**Timeline:** 30-45 minutes
**Status:** COMPLETE
**Next:** Frontend/backend full E2E testing
EOF
```

---

## Update Status

```bash
# Update status.json
cat > .flagpost/status.json << 'EOF'
{
  "gc": {
    "status": "completed",
    "task": "Supabase Instance Creation",
    "database_ready": true,
    "frankfurt_region": true,
    "migrations_executed": true,
    "backend_verified": true
  },
  "oc": {
    "status": "working",
    "task": "Full Stack E2E Testing"
  },
  "shared": {
    "quality_gate_passed": true,
    "database_status": "READY",
    "current_phase": "E2E_TESTING",
    "supabase_instance": "hex-ade",
    "supabase_region": "Frankfurt (eu-frankfurt)",
    "next_milestone": "Full E2E Testing + Deployment"
  }
}
EOF
```

---

## Timeline

- Create instance: 5 min
- Store credentials: 5 min
- Run migrations: 5 min
- Verify data: 10 min
- Test backend: 10 min
- Documentation: 5 min
- **Total: 40 minutes**

---

## Important Notes

1. **Frankfurt Region:** Critical for GDPR compliance + performance
2. **Project Name:** Must be `hex-ade` (lowercase, hyphens only)
3. **Password:** Auto-generated by OpenSSL for security
4. **Credentials:** Stored in 3 places (server/.env, apps/web/.env.local, .env.production)
5. **RLS:** Must be enabled on all tables for security

---

## Authority

Full execution approval. Complete this task immediately.

**Go!**
