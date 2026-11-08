export type ArticleCategory =
  | 'Generative AI'
  | 'Robotics & Hardware'
  | 'Quantum & Silicon'
  | 'AI Safety & Governance'
  | 'Dev & Cloud Architecture';

export type ArticleStatus =
  | 'draft'
  | 'pending_review'
  | 'revision_requested'
  | 'approved'
  | 'published'
  | 'rejected';

export interface Author {
  name: string;
  role: string;
  avatar: string;
}

export interface Citation {
  source: string;
  url: string;
  note: string;
}

export interface ResearchSource {
  title: string;
  url: string;
  domain?: string;
  publicationDate?: string;
  isGrounded: boolean;
  snippet?: string;
  note?: string;
}

export interface ResearchFinding {
  title: string;
  detail: string;
  confidence?: string;
}

export interface ResearchResult {
  topic: string;
  summary: string;
  sources: ResearchSource[];
  searchQueries: string[];
  groundedWithGoogleSearch: boolean;
  researchedAt: string;
  keyFindings?: ResearchFinding[];
  suggestedOutline?: string[];
  model?: string;
}

export interface QualityProblem {
  severity: 'critical' | 'warning' | 'suggestion';
  category: 'Technical' | 'Sources' | 'Code/Math' | 'SEO' | 'Readability' | 'Originality';
  problem: string;
  remediation: string;
}

export interface QualityCheckReport {
  overallScore: number;
  scores: {
    technicalQuality: number;
    sourceQuality: number;
    readability: number;
    seo: number;
  };
  scoreRationales: {
    technicalQualityRationale: string;
    sourceQualityRationale: string;
    readabilityRationale: string;
    seoRationale: string;
  };
  technicalAccuracy: {
    passedChecks: string[];
    detectedErrors: string[];
  };
  unsupportedClaims: Array<{
    claim: string;
    issue: string;
    suggestedVerification: string;
  }>;
  mathAndCode: {
    equationNotes: string;
    codeSyntaxValid: boolean;
    codeIssues: string[];
    codeRecommendations: string[];
  };
  contentRepetition: {
    hasRepetition: boolean;
    details: string;
  };
  originalityAndValue: {
    noveltyAssessment: string;
    isAiSlopFree: boolean;
    boilerplatePhrasesFound: string[];
  };
  seo: {
    suggestedTitle: string;
    titleLength: number;
    suggestedMetaDescription: string;
    metaDescriptionLength: number;
    suggestedKeywords: string[];
    headingStructureAssessment: string;
  };
  problemsNeedingAttention: QualityProblem[];
  improvementSuggestions: string[];
  auditedAt: string;
  isLiveGemini?: boolean;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  category: ArticleCategory;
  excerpt: string;
  content: string;
  author: Author;
  publishedAt: string;
  readTime: string;
  featuredImage: string;
  status: ArticleStatus;
  reviewNotes?: string;
  seo: {
    title: string;
    metaDescription: string;
    keywords: string[];
  };
  citations: Citation[];
  qualityReport?: QualityCheckReport;
  metrics?: {
    views?: number;
    likes: number;
    shares: number;
  };
  tags: string[];
  featured?: boolean;
  isDemo?: boolean;
}

export interface ToolItem {
  id: string;
  name: string;
  description: string;
  category: 'Prompt Engineering' | 'Content Optimization' | 'Code & Architecture' | 'Analysis & SEO';
  badge: string;
  actionLabel: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role?: string;
  lastSignIn?: string;
}

export type ActiveTab = 
  | 'home' 
  | 'blog' 
  | 'tools' 
  | 'studio' 
  | 'research' 
  | 'approvals'
  | 'admin'
  | 'about'
  | 'contact'
  | 'privacy'
  | 'terms';

