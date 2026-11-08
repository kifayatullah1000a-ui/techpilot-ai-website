-- ==============================================================================
-- TechPilot AI - Complete Hardened Database Schema & Strict Administrator RLS Migration
-- Target Database: https://qusbrdwetykqhpmjxpcr.supabase.co
--
-- SECURITY ARCHITECTURE CERTIFICATION:
-- 1. TABLE PRIVILEGES HARDENING:
--    - Explicitly revokes ALL table permissions from PUBLIC, anon, and authenticated.
--    - Grants SELECT to anon and authenticated.
--    - Grants INSERT, UPDATE, DELETE exclusively to authenticated.
--    - Enables and forces Row Level Security (RLS) on public.articles.
-- 2. SECURE FUNCTION search_path:
--    - Administrator helper function uses an empty search_path (SET search_path = '')
--      with fully schema-qualified references to eliminate search-path injection.
--    - Function execution revoked from PUBLIC and anon; granted ONLY to authenticated.
-- 3. TRIGGER FUNCTION LEAST PRIVILEGE:
--    - Removed SECURITY DEFINER from update_articles_updated_at (unnecessary elevated privilege).
--    - Uses SET search_path = '' and pg_catalog.now().
-- 4. EXCLUSIVE ADMINISTRATOR AUTHORIZATION:
--    - Restricted exclusively to Supabase Auth User UUID:
--      '6212d070-05b0-46d1-a98a-3c77087626d3'::uuid
--    - No role fallbacks, no email fallbacks, and zero client-editable user_metadata.
-- 5. DYNAMIC POLICY PURGE & LEAST PRIVILEGE:
--    - Queries pg_catalog.pg_policies to drop every existing policy before reapplying.
--    - Anonymous visitors can ONLY read articles where status = 'published'.
--    - Only the verified administrator UUID can read drafts, insert, update, approve, or delete.
--
-- STATUS: PREPARED FOR HUMAN REVIEW (DO NOT EXECUTE WITHOUT EXPLICIT APPROVAL)
-- ==============================================================================

-- Step 1: Create articles table with all domain columns, defaults, and constraints
CREATE TABLE IF NOT EXISTS public.articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT DEFAULT '',
  meta_description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'revision_requested', 'approved', 'published', 'rejected')),
  author_name TEXT DEFAULT 'TechPilot Editorial Staff',
  author_role TEXT DEFAULT 'Staff Contributor',
  author_avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
  read_time TEXT DEFAULT '5 min read',
  featured_image TEXT DEFAULT '/src/assets/images/blog_neural_agents_1793517435046.jpg',
  review_notes TEXT DEFAULT '',
  seo JSONB DEFAULT '{"title": "", "metaDescription": "", "keywords": []}'::jsonb,
  citations JSONB DEFAULT '[]'::jsonb,
  quality_report JSONB DEFAULT NULL,
  metrics JSONB DEFAULT '{"views": 0, "likes": 0, "shares": 0}'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 2: Performance Indexes
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON public.articles(created_at DESC);

-- Step 3: Automatic updated_at timestamp trigger function
-- SECURITY DEFINER removed: runs with caller privileges (least privilege).
-- Uses empty search_path with schema-qualified pg_catalog function.
CREATE OR REPLACE FUNCTION public.update_articles_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = pg_catalog.now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_articles_updated_at ON public.articles;
CREATE TRIGGER trigger_articles_updated_at
BEFORE UPDATE ON public.articles
FOR EACH ROW
EXECUTE FUNCTION public.update_articles_updated_at();

-- Step 4: Helper Function - Verify Administrator Role
-- Hardened with SECURITY DEFINER and empty search_path (SET search_path = '').
-- Strictly validates auth.role() = 'authenticated' AND auth.uid() matches ONLY the specified administrator UUID.
-- All schema and type references are fully qualified.
CREATE OR REPLACE FUNCTION public.is_techpilot_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
BEGIN
  RETURN (
    auth.role() = 'authenticated' AND
    auth.uid() = '6212d070-05b0-46d1-a98a-3c77087626d3'::pg_catalog.uuid
  );
END;
$$;

-- Step 5: Configure Function Execution Permissions
-- Revoked from PUBLIC and anon; granted strictly to authenticated callers
REVOKE ALL ON FUNCTION public.is_techpilot_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_techpilot_admin() TO authenticated;

-- Step 6: Enable and Force Row Level Security (RLS) on public.articles
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles FORCE ROW LEVEL SECURITY;

-- Step 7: Explicit Table-Level PostgreSQL Privileges
-- First, revoke all prior default or lingering permissions from PUBLIC, anon, and authenticated
REVOKE ALL ON TABLE public.articles FROM PUBLIC, anon, authenticated;

-- Grant minimal necessary table capabilities (RLS policies strictly filter all operations)
GRANT SELECT ON TABLE public.articles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.articles TO authenticated;

-- Step 8: Systematic & Dynamic Policy Purge
-- Queries pg_catalog.pg_policies to drop every existing policy on public.articles before reapplying,
-- guaranteeing zero leftover, permissive, or conflicting legacy policies.
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename = 'articles'
  LOOP
    EXECUTE pg_catalog.format('DROP POLICY IF EXISTS %I ON public.articles;', pol.policyname);
  END LOOP;
END;
$$;

-- Step 9: Apply Strict, Hardened Row Level Security (RLS) Policies

-- Policy 1: Public Readers (Anonymous & Authenticated)
-- Public anonymous visitors can ONLY read articles where status is strictly 'published'.
-- Does NOT call is_techpilot_admin(), so anon never invokes the helper function.
CREATE POLICY "Public Read Published Only"
ON public.articles
FOR SELECT
TO anon, authenticated
USING (status = 'published');

-- Policy 2: Administrator Reading Pipeline
-- Only the verified administrator UUID can read all articles regardless of status.
CREATE POLICY "Admin Read All Manuscripts"
ON public.articles
FOR SELECT
TO authenticated
USING (public.is_techpilot_admin());

-- Policy 3: Administrator Insert Pipeline
-- Only the verified administrator UUID can insert new manuscript records.
CREATE POLICY "Admin Insert Manuscripts"
ON public.articles
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_techpilot_admin() AND
  title IS NOT NULL AND pg_catalog.length(pg_catalog.btrim(title)) > 0 AND
  slug IS NOT NULL AND pg_catalog.length(pg_catalog.btrim(slug)) > 0 AND
  content IS NOT NULL
);

-- Policy 4: Administrator Update Pipeline
-- Only the verified administrator UUID can edit content, change review status, approve, or publish.
CREATE POLICY "Admin Update Manuscripts"
ON public.articles
FOR UPDATE
TO authenticated
USING (public.is_techpilot_admin())
WITH CHECK (public.is_techpilot_admin());

-- Policy 5: Administrator Delete Pipeline
-- Only the verified administrator UUID can delete drafts or manuscripts.
CREATE POLICY "Admin Delete Manuscripts"
ON public.articles
FOR DELETE
TO authenticated
USING (public.is_techpilot_admin());
