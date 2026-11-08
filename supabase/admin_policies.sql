-- ==============================================================================
-- TechPilot AI - Administrator-Only Access Control & RLS Security Policies
-- Target Database: https://qusbrdwetykqhpmjxpcr.supabase.co
--
-- SECURITY ARCHITECTURE:
-- 1. Explicitly revokes ALL table permissions from PUBLIC, anon, authenticated.
-- 2. Grants SELECT to anon and authenticated; grants INSERT, UPDATE, DELETE to authenticated.
-- 3. Enables and forces Row Level Security on public.articles.
-- 4. Helper function uses SET search_path = '' and is executable ONLY by authenticated.
-- 5. Exclusive authorization for Supabase Auth UUID: 6212d070-05b0-46d1-a98a-3c77087626d3
-- ==============================================================================

-- 1. Helper Function: Verify Administrator Role
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

-- 2. Configure Function Execution Permissions
REVOKE ALL ON FUNCTION public.is_techpilot_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_techpilot_admin() TO authenticated;

-- 3. Enable and Force Row Level Security (RLS)
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles FORCE ROW LEVEL SECURITY;

-- 4. Explicit Table Privileges
REVOKE ALL ON TABLE public.articles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.articles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.articles TO authenticated;

-- 5. Dynamic Policy Purge
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

-- 6. Apply Hardened Row Level Security (RLS) Policies

-- Policy 1: Public Readers (Anonymous & Authenticated)
CREATE POLICY "Public Read Published Only"
ON public.articles
FOR SELECT
TO anon, authenticated
USING (status = 'published');

-- Policy 2: Administrator Reading Pipeline
CREATE POLICY "Admin Read All Manuscripts"
ON public.articles
FOR SELECT
TO authenticated
USING (public.is_techpilot_admin());

-- Policy 3: Administrator Insert Pipeline
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
CREATE POLICY "Admin Update Manuscripts"
ON public.articles
FOR UPDATE
TO authenticated
USING (public.is_techpilot_admin())
WITH CHECK (public.is_techpilot_admin());

-- Policy 5: Administrator Delete Pipeline
CREATE POLICY "Admin Delete Manuscripts"
ON public.articles
FOR DELETE
TO authenticated
USING (public.is_techpilot_admin());
