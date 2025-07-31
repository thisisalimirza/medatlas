# Supabase Migration Guide

This guide will help you migrate MedAtlas from SQLite + custom auth to Supabase.

## Prerequisites

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and API keys

## Migration Steps

### 1. Set up Supabase Project

1. **Create new project** in Supabase dashboard
2. **Copy your credentials** from Settings > API:
   - Project URL
   - `anon` `public` key  
   - `service_role` `secret` key

### 2. Update Environment Variables

Update your existing `.env.local` file by uncommenting and filling in the Supabase variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Existing Stripe config...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### 3. Run Database Migration

1. **Copy the SQL schema** from `supabase/migrations/001_initial_schema.sql`
2. **Run it in your Supabase SQL Editor** (Dashboard > SQL Editor)
3. **Verify tables were created** in Database > Tables

### 4. Migrate Data

Run the data migration script:

```bash
npm install better-sqlite3 # if not already installed
node scripts/migrate-to-supabase.js
```

This will migrate:
- ✅ All places data
- ⚠️ Users need to re-register (Supabase Auth handles this)

### 5. Update Application Code

#### Replace AuthContext
In `src/app/layout.tsx`, replace:
```tsx
import { AuthProvider } from '@/contexts/AuthContext'
```
with:
```tsx
import { AuthProvider } from '@/contexts/SupabaseAuthContext'
```

#### Update API Routes
Replace existing API calls with Supabase versions:
- `/api/user/stats` → `/api/supabase/user/stats`
- `/api/user/school-list` → `/api/supabase/user/school-list`

Update these in:
- `src/app/school-list/page.tsx`
- `src/components/PlaceModal.tsx`
- Any other components making API calls

### 6. Test the Migration

1. **Start development server**: `npm run dev`
2. **Test user registration** - should create profile automatically
3. **Test user stats** - add MCAT/GPA data
4. **Test school list** - add schools and verify categorization
5. **Test authentication** - login/logout flows

## Key Benefits After Migration

### 🔒 **Better Authentication**
- Built-in email verification
- Password reset flows
- Social login options (Google, GitHub, etc.)
- No more manual JWT handling

### 📊 **Better Database**
- PostgreSQL with full SQL support
- Real-time subscriptions
- Row Level Security (RLS)
- Better performance and scaling

### 🛠️ **Developer Experience**
- Auto-generated TypeScript types
- Built-in admin dashboard
- Better error handling
- Real-time data updates

### ☁️ **Production Ready**
- Managed hosting and backups
- CDN for global performance
- Built-in monitoring
- Easy scaling

## Post-Migration Cleanup

After successful migration:

1. **Remove old auth files**:
   - `src/lib/auth.ts`
   - `src/lib/database.ts`
   - `src/contexts/AuthContext.tsx`

2. **Remove old API routes**:
   - `src/app/api/auth/`
   - `src/app/api/user/` (keep Supabase versions)

3. **Remove SQLite dependencies**:
   ```bash
   npm uninstall better-sqlite3 bcryptjs jose
   ```

4. **Remove database file**:
   ```bash
   rm medatlas.db*
   ```

## Troubleshooting

### Common Issues

**"Invalid API key" errors**
- Check environment variables are set correctly
- Restart development server after adding env vars

**RLS Policy errors**
- Verify user is authenticated
- Check RLS policies in Supabase dashboard

**Migration script fails**
- Ensure Supabase tables are created first
- Check service role key has proper permissions

### Getting Help

1. Check Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
2. Review error logs in Supabase dashboard
3. Test API endpoints directly in Supabase API docs

## What Users Need to Do

After migration goes live:

1. **Existing users** need to create new accounts (email/password)
2. **Re-enter their stats** (MCAT, GPA, etc.)
3. **Rebuild their school lists** and favorites

Consider sending an email to existing users explaining the upgrade and benefits!