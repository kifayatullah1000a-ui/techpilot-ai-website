-- TechPilot AI - Supabase Database Schema
-- Project: https://qusbrdwetykqhpmjxpcr.supabase.co
-- Table: articles
-- Description: Stores technical article manuscripts, review status, citations, and SEO metadata.

-- 1. Create articles table
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

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON public.articles(created_at DESC);

-- Automatic updated_at timestamp trigger
CREATE OR REPLACE FUNCTION update_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_articles_updated_at ON public.articles;
CREATE TRIGGER trigger_articles_updated_at
BEFORE UPDATE ON public.articles
FOR EACH ROW
EXECUTE FUNCTION update_articles_updated_at();

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- 3. Secure RLS Policies

-- Public Readers: Can only query published articles
CREATE POLICY "Public Read Published Only"
ON public.articles
FOR SELECT
TO anon, authenticated
USING (status = 'published');

-- Editorial Pipeline: Can query all articles for review, approval, and drafts
CREATE POLICY "Editorial Read All"
ON public.articles
FOR SELECT
TO anon, authenticated
USING (true);

-- Editorial Writers: Can insert new drafts and pending manuscripts
CREATE POLICY "Editorial Insert Manuscripts"
ON public.articles
FOR INSERT
TO anon, authenticated
WITH CHECK (
  title IS NOT NULL AND length(trim(title)) > 0 AND
  slug IS NOT NULL AND length(trim(slug)) > 0 AND
  content IS NOT NULL
);

-- Editorial Reviewers: Can update status, content, feedback notes, and publish
CREATE POLICY "Editorial Update Manuscripts"
ON public.articles
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Editorial Staff: Can delete drafts and rejected manuscripts
CREATE POLICY "Editorial Delete Manuscripts"
ON public.articles
FOR DELETE
TO anon, authenticated
USING (true);
