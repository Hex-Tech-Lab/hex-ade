# SQLite → Postgres Migration (Feb 2026)

## What Changed

Features are now stored in Supabase PostgreSQL instead of per-project SQLite files.

### Before
- Each project: `project_dir/.autocoder/features.db` (SQLite)
- File-based locking issues
- Limited to one concurrent write
- Required file system persistence

### After
- Single Postgres instance: Supabase
- All projects share Features table (filtered by project_id)
- Unlimited concurrent writes
- Connection pooling via PgBouncer
- Automatic backups and PITR

## Backward Compatibility

- `get_features_db_path()` marked deprecated
- Old `.autocoder/features.db` files are ignored for new operations
- All Feature reads/writes now go to Postgres

## Configuration

Set `DATABASE_URL` to Supabase connection string:
```
postgresql://[user]:[password]@[host]:[port]/[database]?sslmode=require
```

## Performance Notes

- Query performance: O(1) from Postgres indexes
- Concurrent writes: Unlimited (ACID guaranteed)
- Connection limit: 5 per instance + 10 overflow (PgBouncer config)
- Pool recycle: 3600 seconds (Postgres connection lifecycle)

## Troubleshooting

**sslmode errors**: Check DATABASE_URL is set and valid. Ensure it includes `sslmode=require`.
**Connection pool exhausted**: Reduce instance count or increase PgBouncer limits.
**Slow queries**: Check indexes with `\d+ features` in psql.
