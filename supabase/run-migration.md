# IELTS Migration Guide

## Step 1: Run the Migration

Go to **Supabase Dashboard** > **SQL Editor** and run:

```sql
-- Copy and paste the entire contents of:
-- supabase/migrations/005_add_ielts_plans.sql
```

## Step 2: Seed the Weekly Plan

After the migration succeeds, run:

```sql
-- Copy and paste the entire contents of:
-- supabase/seed-ielts-plan.sql
```

## Step 3: Verify

Check that tables were created:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE 'ielts%';
```

Check your plan:

```sql
SELECT * FROM ielts_plans;
SELECT * FROM ielts_sessions ORDER BY session_date DESC;
SELECT * FROM ielts_milestones;
```

## Troubleshooting

If you get "relation already exists" error, the migration was already run.

To reset and start fresh:

```sql
DROP TABLE IF EXISTS ielts_milestones;
DROP TABLE IF EXISTS ielts_sessions;
DROP TABLE IF EXISTS ielts_plans;
```

Then run migration again.
