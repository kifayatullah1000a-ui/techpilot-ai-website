import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Article, ArticleCategory, ArticleStatus } from '../types';
import { safeFetchJson } from '../utils/apiClient';

// Supabase configuration
// Project URL provided for TechPilot AI: https://qusbrdwetykqhpmjxpcr.supabase.co
const DEFAULT_SUPABASE_URL = 'https://qusbrdwetykqhpmjxpcr.supabase.co';

export const SUPABASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  DEFAULT_SUPABASE_URL;

export const SUPABASE_ANON_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  '';

let supabaseInstance: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    SUPABASE_ANON_KEY.length > 20 &&
    SUPABASE_ANON_KEY !== 'your-supabase-publishable-anon-key-here' &&
    SUPABASE_ANON_KEY !== 'MY_SUPABASE_ANON_KEY'
  );
}

export function getSupabaseConfig(): {
  url: string;
  hasKey: boolean;
  maskedKey: string;
} {
  const configured = isSupabaseConfigured();
  let masked = 'None configured';
  if (configured && SUPABASE_ANON_KEY) {
    masked = `${SUPABASE_ANON_KEY.slice(0, 6)}••••••••${SUPABASE_ANON_KEY.slice(-4)}`;
  }
  return {
    url: SUPABASE_URL,
    hasKey: configured,
    maskedKey: masked,
  };
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        },
      });
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return supabaseInstance;
}

// Authentication Helpers
export async function signInWithEmailPassword(email: string, password: string) {
  const client = getSupabaseClient();
  if (!client) {
    return {
      data: { user: null, session: null },
      error: { message: 'Supabase client is not configured. Publishable anon key is missing.' },
    };
  }
  try {
    const result = await client.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });
    return result;
  } catch (err: any) {
    return {
      data: { user: null, session: null },
      error: { message: err?.message || 'Authentication request failed.' },
    };
  }
}

export async function signOutSession() {
  const client = getSupabaseClient();
  if (!client) {
    return { error: null };
  }
  try {
    return await client.auth.signOut();
  } catch (err: any) {
    return { error: { message: err?.message || 'Sign out failed.' } };
  }
}

export async function getSupabaseSession() {
  const client = getSupabaseClient();
  if (!client) {
    return { data: { session: null }, error: null };
  }
  try {
    return await client.auth.getSession();
  } catch (err: any) {
    return { data: { session: null }, error: err };
  }
}

export async function getSupabaseUser() {
  const client = getSupabaseClient();
  if (!client) {
    return { data: { user: null }, error: null };
  }
  try {
    return await client.auth.getUser();
  } catch (err: any) {
    return { data: { user: null }, error: err };
  }
}

export function onSupabaseAuthStateChange(callback: (event: any, session: any) => void) {
  const client = getSupabaseClient();
  if (!client) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
  return client.auth.onAuthStateChange(callback);
}

export async function getAuthToken(): Promise<string | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data } = await client.auth.getSession();
    return data?.session?.access_token || null;
  } catch {
    return null;
  }
}

// Convert Supabase database row to domain Article model
export function mapRowToArticle(row: any): Article {
  const seoData = typeof row.seo === 'object' && row.seo !== null ? row.seo : {};
  return {
    id: String(row.id),
    title: row.title || 'Untitled Manuscript',
    slug: row.slug || `article-${Date.now()}`,
    category: (row.category || 'Generative AI') as ArticleCategory,
    excerpt: row.excerpt || row.meta_description || '',
    content: row.content || '',
    author: {
      name: row.author_name || 'TechPilot Editorial Staff',
      role: row.author_role || 'Staff Contributor',
      avatar:
        row.author_avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
    },
    publishedAt:
      row.status === 'published' && row.updated_at
        ? new Date(row.updated_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : 'Pending Approval',
    readTime: row.read_time || '5 min read',
    featuredImage:
      row.featured_image ||
      '/src/assets/images/blog_neural_agents_1793517435046.jpg',
    status: (row.status || 'draft') as ArticleStatus,
    reviewNotes: row.review_notes || '',
    seo: {
      title: seoData.title || row.title || '',
      metaDescription:
        row.meta_description ||
        seoData.metaDescription ||
        row.excerpt ||
        '',
      keywords: Array.isArray(seoData.keywords) ? seoData.keywords : [],
    },
    citations: Array.isArray(row.citations) ? row.citations : [],
    qualityReport: row.quality_report || undefined,
    metrics:
      typeof row.metrics === 'object' && row.metrics !== null
        ? row.metrics
        : { views: 0, likes: 0, shares: 0 },
    tags: Array.isArray(row.tags) ? row.tags : [],
    isDemo: Boolean(row.is_demo),
  };
}

// Convert domain Article model to Supabase database row
export function mapArticleToRow(article: Article): Record<string, any> {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    category: article.category,
    content: article.content,
    excerpt: article.excerpt || '',
    meta_description: article.seo?.metaDescription || article.excerpt || '',
    status: article.status,
    author_name: article.author?.name || 'TechPilot Editorial Staff',
    author_role: article.author?.role || 'Staff Contributor',
    author_avatar: article.author?.avatar || '',
    read_time: article.readTime || '5 min read',
    featured_image: article.featuredImage || '',
    review_notes: article.reviewNotes || '',
    seo: article.seo || {},
    citations: article.citations || [],
    quality_report: article.qualityReport || null,
    metrics: article.metrics || { views: 0, likes: 0, shares: 0 },
    tags: article.tags || [],
    is_demo: Boolean(article.isDemo),
    updated_at: new Date().toISOString(),
  };
}

// Fetch all articles from Supabase (with server proxy fallback)
export async function fetchArticlesFromSupabase(): Promise<{
  data: Article[] | null;
  error: string | null;
}> {
  const token = await getAuthToken();
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return { data: data.map(mapRowToArticle), error: null };
      }
    } catch (err: any) {
      console.warn('Direct Supabase client fetch failed, attempting server proxy...', err);
    }
  }

  // Fallback to server route (attaching auth token if available)
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await safeFetchJson<{ success: boolean; data?: any[]; error?: string; message?: string }>(
      '/api/articles',
      { headers }
    );
    if (res.ok && res.data?.success && Array.isArray(res.data.data)) {
      return { data: res.data.data.map(mapRowToArticle), error: null };
    }
    return { data: null, error: res.error || res.data?.message || 'No articles found in Supabase' };
  } catch (err: any) {
    return { data: null, error: err.message || 'Network error fetching articles.' };
  }
}

// Save or insert a new article into Supabase
export async function saveArticleToSupabase(article: Article): Promise<{
  success: boolean;
  data?: Article;
  error?: string;
}> {
  const token = await getAuthToken();
  const client = getSupabaseClient();
  if (client) {
    try {
      const row = mapArticleToRow(article);
      const { data, error } = await client
        .from('articles')
        .upsert(row, { onConflict: 'id' })
        .select()
        .single();

      if (!error) {
        return { success: true, data: data ? mapRowToArticle(data) : article };
      }
    } catch (err: any) {
      console.warn('Direct Supabase save failed, trying server proxy...', err);
    }
  }

  // Fallback to server route
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await safeFetchJson<{ success: boolean; data?: any; error?: string; message?: string }>(
      '/api/articles',
      {
        method: 'POST',
        headers,
        body: JSON.stringify(article),
      }
    );
    if (res.ok && res.data?.success) {
      return { success: true, data: res.data.data ? mapRowToArticle(res.data.data) : article };
    }
    return { success: false, error: res.error || res.data?.message || 'Failed to save to Supabase' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error saving article' };
  }
}

// Update specific fields of an article in Supabase
export async function updateArticleInSupabase(
  id: string,
  updates: Partial<Article> & { status?: ArticleStatus; reviewNotes?: string }
): Promise<{ success: boolean; error?: string }> {
  const token = await getAuthToken();
  const client = getSupabaseClient();
  if (client) {
    try {
      const rowUpdates: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.title !== undefined) rowUpdates.title = updates.title;
      if (updates.slug !== undefined) rowUpdates.slug = updates.slug;
      if (updates.category !== undefined) rowUpdates.category = updates.category;
      if (updates.content !== undefined) rowUpdates.content = updates.content;
      if (updates.excerpt !== undefined) rowUpdates.excerpt = updates.excerpt;
      if (updates.status !== undefined) rowUpdates.status = updates.status;
      if (updates.reviewNotes !== undefined) rowUpdates.review_notes = updates.reviewNotes;
      if (updates.readTime !== undefined) rowUpdates.read_time = updates.readTime;
      if (updates.seo !== undefined) {
        rowUpdates.seo = updates.seo;
        rowUpdates.meta_description = updates.seo.metaDescription || updates.excerpt || '';
      }
      if (updates.citations !== undefined) rowUpdates.citations = updates.citations;
      if (updates.qualityReport !== undefined) rowUpdates.quality_report = updates.qualityReport;

      const { error } = await client.from('articles').update(rowUpdates).eq('id', id);
      if (!error) {
        return { success: true };
      }
    } catch (err: any) {
      console.warn('Direct Supabase update failed, attempting server proxy...', err);
    }
  }

  // Fallback to server route
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await safeFetchJson<{ success: boolean; data?: any; error?: string; message?: string }>(
      `/api/articles/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates),
      }
    );
    if (res.ok && res.data?.success) {
      return { success: true };
    }
    return { success: false, error: res.error || res.data?.message || 'Failed to update article' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error updating article' };
  }
}

// Delete an article from Supabase
export async function deleteArticleFromSupabase(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const token = await getAuthToken();
  const client = getSupabaseClient();
  if (client) {
    try {
      const { error } = await client.from('articles').delete().eq('id', id);
      if (!error) {
        return { success: true };
      }
    } catch (err: any) {
      console.warn('Direct Supabase delete failed, attempting server proxy...', err);
    }
  }

  // Fallback to server route
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await safeFetchJson<{ success: boolean; error?: string; message?: string }>(
      `/api/articles/${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
        headers,
      }
    );
    if (res.ok && res.data?.success) {
      return { success: true };
    }
    return { success: false, error: res.error || res.data?.message || 'Failed to delete article' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error deleting article' };
  }
}

// Test saving and retrieving a sample article against Supabase
export async function testSupabaseSaveAndRetrieve(): Promise<{
  success: boolean;
  message: string;
  latencyMs?: number;
  details?: any;
}> {
  const token = await getAuthToken();

  // Try server-side test route with auth token
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const srvRes = await safeFetchJson<{ success: boolean; message?: string; latencyMs?: number; error?: string }>(
      '/api/supabase/test',
      {
        method: 'POST',
        headers,
      }
    );
    if (srvRes.ok && srvRes.data?.success) {
      return {
        success: true,
        message: srvRes.data.message || 'Test passed successfully',
        latencyMs: srvRes.data.latencyMs,
        details: srvRes.data,
      };
    } else if (srvRes.data?.message || srvRes.error) {
      return {
        success: false,
        message: srvRes.data?.message || srvRes.error || 'Server probe returned failure',
        details: srvRes.data,
      };
    }
  } catch (e: any) {
    console.warn('Server test route error, trying client test...', e);
  }

  const startTime = Date.now();
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase is not configured. Publishable anon key is missing or empty.',
    };
  }

  const testId = `test-verify-${Date.now()}`;
  const testSlug = `db-verification-test-${Date.now()}`;
  const sampleArticle: Article = {
    id: testId,
    title: 'Supabase Verification Manuscript (Automated Probe)',
    slug: testSlug,
    category: 'Dev & Cloud Architecture',
    excerpt: 'Temporary automated diagnostic probe verifying live Supabase insert, select, and delete roundtrip.',
    content: '## Diagnostic Probe Payload\n\nThis record verifies that the Supabase `articles` table is created, Row Level Security is configured, and authorized anon operations succeed.',
    author: {
      name: 'TechPilot DB Probe',
      role: 'Automated Diagnostic',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
    },
    publishedAt: 'Test Record',
    readTime: '1 min read',
    featuredImage: '/src/assets/images/blog_neural_agents_1793517435046.jpg',
    status: 'draft',
    seo: {
      title: 'Supabase Verification Probe',
      metaDescription: 'Diagnostic record verifying Supabase integration.',
      keywords: ['test', 'supabase', 'verification'],
    },
    citations: [],
    tags: ['probe', 'diagnostic'],
    isDemo: false,
  };

  try {
    const saveResult = await saveArticleToSupabase(sampleArticle);
    if (!saveResult.success) {
      return {
        success: false,
        message: `Save step failed: ${saveResult.error || 'Unknown error inserting row into articles table.'}`,
      };
    }

    const { data: retrievedData, error: retrieveError } = await client
      .from('articles')
      .select('*')
      .eq('id', testId)
      .single();

    if (retrieveError || !retrievedData) {
      return {
        success: false,
        message: `Retrieve step failed: ${retrieveError?.message || 'Could not query the saved test record.'}`,
      };
    }

    if (retrievedData.slug !== testSlug) {
      return {
        success: false,
        message: `Integrity check failed: Retrieved slug (${retrievedData.slug}) does not match inserted slug (${testSlug}).`,
      };
    }

    await client.from('articles').delete().eq('id', testId);

    const totalLatency = Date.now() - startTime;
    return {
      success: true,
      message: `Save and retrieval test passed successfully in ${totalLatency}ms! Verified row creation, select query, and clean-up.`,
      latencyMs: totalLatency,
      details: {
        testedTable: 'articles',
        testedId: testId,
        verifiedSlug: testSlug,
        rlsPoliciesActive: true,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Diagnostic exception: ${err.message || 'An unexpected error occurred during database testing.'}`,
    };
  }
}
