# Supabase Database Setup

This directory contains SQL migration files for setting up the Shorts Spy database schema.

## Migration Files

1. **001_initial_schema.sql** - Creates all tables, indexes, and triggers
2. **002_rls_policies.sql** - Sets up Row Level Security (RLS) policies
3. **003_initial_user_subscription.sql** - Creates trigger for auto-creating free subscriptions

## How to Apply Migrations

### Option 1: Using Supabase Dashboard (Recommended for MVP)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of each migration file in order:
   - First run `001_initial_schema.sql`
   - Then run `002_rls_policies.sql`
   - Finally run `003_initial_user_subscription.sql`
4. Click **Run** to execute each migration

### Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Apply migrations
supabase db push
```

## Tables Created

### 1. `profiles`
Stores TikTok creator profile information.

### 2. `scrapes`
Tracks scraping jobs for each user.

### 3. `tiktok_videos`
Stores normalized TikTok video data with metrics.

### 4. `user_subscriptions`
Manages user subscription tiers (free/paid).

### 5. `rate_limits`
Tracks API usage limits per user.

## Row Level Security (RLS)

All tables have RLS enabled with policies that:
- Allow users to only see their own data
- Allow users to insert/update their own records
- Prevent users from accessing other users' data

## Verification

After applying migrations, verify the setup:

1. Check tables exist in Supabase Dashboard → Table Editor
2. Check RLS is enabled (should see a lock icon on each table)
3. Test creating a user - should auto-create a free subscription
4. Test querying tables with your user account

## Troubleshooting

### "relation does not exist" error
- Make sure you ran migrations in order (001, 002, 003)
- Check that you're connected to the correct Supabase project

### RLS blocking queries
- Verify RLS policies are correctly applied
- Check that you're authenticated when testing
- Review policy conditions in `002_rls_policies.sql`

### Trigger not working
- Verify `003_initial_user_subscription.sql` was executed
- Check that the function `handle_new_user()` exists
- Test by creating a new user in Authentication

