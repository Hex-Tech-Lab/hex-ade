# 🚀 Supabase Deployment Manual

This guide provides step-by-step instructions for manually creating and configuring the Supabase instance for **hex-ade**.

## 1. Create Supabase Project

1. Log in to [Supabase Dashboard](https://supabase.com/dashboard).
2. Click **New Project**.
3. Select your Organization.
4. **Project Settings**:
   - **Name**: `hex-ade`
   - **Database Password**: [Your Secure Password]
   - **Region**: `Frankfurt (eu-central-1)`
   - **Plan**: `Free` (or appropriate tier)
5. Click **Create new project**.

## 2. Retrieve Connection Strings

Once the project is provisioned (approx. 2-5 minutes):

1. Go to **Project Settings** > **API**.
2. Copy the **Project URL** (`https://[project-id].supabase.co`).
3. Copy the **anon public** key.
4. Copy the **service_role secret** key.
5. Go to **Project Settings** > **Database**.
6. Copy the **Transaction Connection String** (under Connection Pooling, Port 6543):
   - Format: `postgresql://postgres:[password]@[host]:6543/postgres`

## 3. Configure Environment Variables

Update your `.env.local` (frontend) and `.env` (backend) with the retrieved values:

```bash
# Backend (.env)
DATABASE_URL=postgresql://postgres:[password]@[host]:6543/postgres
SUPABASE_URL=https://[project-id].supabase.co
SUPABASE_SERVICE_KEY=[service-role-key]

# Frontend (apps/web/.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
DATABASE_URL=postgresql://postgres:[password]@[host]:6543/postgres
```

## 4. Execute Migrations

You can apply the schema using one of these methods:

### Method A: SQL Editor (Quickest)
1. Go to **SQL Editor** in the Supabase Dashboard.
2. Click **New query**.
3. Paste the content of `supabase/migrations/001_initial_schema.sql`.
4. Click **Run**.

### Method B: Supabase CLI
```bash
supabase login
supabase link --project-ref [project-id]
supabase db push
```

## 5. Verify RLS Policies

Ensure that Row Level Security is active for all tables:
1. Go to **Authentication** > **Policies**.
2. Verify that `projects`, `features`, `tasks`, and `agent_logs` have the policies defined in the migration file.

## 6. Troubleshooting

- **Connection Refused**: Ensure you are using the pooled port `6543` if connecting from serverless environments.
- **SSL Error**: Ensure `sslmode=require` is appended to the `DATABASE_URL`.
- **Migration Failure**: Check if the `auth.users` reference exists (it should by default in Supabase).
