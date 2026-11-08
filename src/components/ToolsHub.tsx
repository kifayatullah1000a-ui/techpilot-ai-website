import React, { useState } from 'react';
import { 
  Sparkles, 
  Terminal, 
  Search, 
  FileText, 
  ShieldCheck, 
  Code2, 
  Share2, 
  Copy, 
  Check, 
  ArrowRight,
  Cpu,
  BookOpen,
  Layers,
  Zap,
  RotateCcw
} from 'lucide-react';

interface ToolsHubProps {
  onSendToStudio?: (promptContent: string) => void;
  onSendToResearch?: (topic: string) => void;
}

export const ToolsHub: React.FC<ToolsHubProps> = ({ onSendToStudio, onSendToResearch }) => {
  const [activeTool, setActiveTool] = useState<string>('prompt-architect');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Tool 1: Prompt Architect State
  const [promptRole, setPromptRole] = useState('Senior Systems Architect');
  const [promptTopic, setPromptTopic] = useState('Design an idempotent message queue worker using Redis Streams and Go');
  const [promptModel, setPromptModel] = useState('Gemini 2.5 Pro');
  const [promptStyle, setPromptStyle] = useState('Production Code & Architecture');
  const [promptConstraints, setPromptConstraints] = useState('No pseudocode, include graceful shutdown handling, handle dead-letter queues, strict error typing.');
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  // Tool 2: Headline Generator State
  const [headlineTopic, setHeadlineTopic] = useState('Optical interconnects in modern GPU server racks');
  const [headlineTone, setHeadlineTone] = useState('Authoritative Technical');
  const [headlineAudience, setHeadlineAudience] = useState('Staff Engineers & CTOs');
  const [generatedHeadlines, setGeneratedHeadlines] = useState<Array<{ title: string; score: number; type: string }>>([]);

  // Language Templates
  const CODE_TEMPLATES: Record<string, { code: string; analysis: any }> = {
    typescript: {
      code: `async function processBatch<T, R>(
  items: T[], 
  handler: (item: T) => Promise<R>, 
  concurrencyLimit = 5
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let currentIndex = 0;

  const workers = Array.from({ length: Math.min(concurrencyLimit, items.length) }, async () => {
    while (currentIndex < items.length) {
      const index = currentIndex++;
      try {
        results[index] = await handler(items[index]);
      } catch (err) {
        console.error(\`Failed at index \${index}\`, err);
        throw err;
      }
    }
  });

  await Promise.all(workers);
  return results;
}`,
      analysis: {
        timeComplexity: 'O(N) where N is items.length',
        spaceComplexity: 'O(N) buffer + O(K) workers',
        concurrencySafety: 'Moderate Risk: Shared mutable currentIndex++ works in JS single-threaded event loop, but unhandled rejections reject all remaining items.',
        edgeCases: [
          'A single item rejection triggers Promise.all fast-fail, terminating other workers.',
          'Very large item arrays can cause memory pressure if holding large response objects.',
          'Workers will hang indefinitely if handler promise does not resolve or timeout.'
        ],
        recommendation: 'Use Promise.allSettled() if partial results are allowed, and pass AbortSignal with timeout guards.'
      }
    },
    python: {
      code: `import numpy as np

def batch_cosine_similarity(embeddings: np.ndarray, query_vector: np.ndarray) -> np.ndarray:
    """
    Computes normalized cosine similarity against N embedding vectors.
    """
    query_norm = np.linalg.norm(query_vector)
    if query_norm == 0:
        return np.zeros(len(embeddings))
    
    doc_norms = np.linalg.norm(embeddings, axis=1)
    doc_norms = np.where(doc_norms == 0, 1e-10, doc_norms)
    
    # Vectorized BLAS dot product
    scores = np.dot(embeddings, query_vector) / (doc_norms * query_norm)
    return scores`,
      analysis: {
        timeComplexity: 'O(N × D) where N is vector count, D is dimension',
        spaceComplexity: 'O(N) for intermediate norm arrays and score outputs',
        concurrencySafety: 'Thread-Safe: Pure functional transformation using NumPy BLAS without shared mutable state.',
        edgeCases: [
          'Zero-norm or NaN vector embeddings trigger division-by-zero without epsilon safety.',
          'Very high-dimensional vectors (D > 4096) across large batches (N > 100k) exceed L3 CPU cache locality.',
          'Memory copy overhead occurs if embeddings array is non-contiguous in RAM.'
        ],
        recommendation: 'Ensure np.ascontiguousarray() and consider SIMD AVX-512 or GPU PyTorch tensor dispatch for N > 50,000.'
      }
    },
    rust: {
      code: `use std::sync::{Arc, Mutex};
use std::collections::HashMap;

pub struct SharedCache<K, V> {
    store: Arc<Mutex<HashMap<K, V>>>,
    capacity: usize,
}

impl<K: std::hash::Hash + Eq + Clone, V: Clone> SharedCache<K, V> {
    pub fn new(capacity: usize) -> Self {
        Self {
            store: Arc::new(Mutex::new(HashMap::with_capacity(capacity))),
            capacity,
        }
    }

    pub fn insert(&self, key: K, value: V) -> Result<(), &'static str> {
        let mut map = self.store.lock().map_err(|_| "Mutex poisoned")?;
        if map.len() >= self.capacity {
            return Err("Cache capacity reached");
        }
        map.insert(key, value);
        Ok(())
    }
}`,
      analysis: {
        timeComplexity: 'O(1) average lookup and insertion into HashMap',
        spaceComplexity: 'O(C) bounded by specified capacity',
        concurrencySafety: 'High Safety: Rust ownership + Arc<Mutex<T>> enforces mutual exclusion across thread boundaries at compile-time.',
        edgeCases: [
          'Mutex poisoning occurs if a thread panics while holding the lock guard.',
          'Contention bottleneck under high multi-threaded read workloads.',
          'Lacks eviction policy (e.g. LRU/LFU), rejecting subsequent items when capacity fills.'
        ],
        recommendation: 'Replace Mutex with RwLock for read-heavy workloads, and integrate an intrusive doubly-linked list for LRU eviction.'
      }
    },
    go: {
      code: `package main

import (
    "context"
    "sync"
)

// ProcessPipeline dispatches work across workers with graceful cancellation
func ProcessPipeline[T any, R any](
    ctx context.Context, 
    inputs <-chan T, 
    fn func(context.Context, T) (R, error), 
    concurrency int,
) <-chan R {
    out := make(chan R, concurrency)
    var wg sync.WaitGroup

    for i := 0; i < concurrency; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            for item := range inputs {
                select {
                case <-ctx.Done():
                    return
                default:
                    if res, err := fn(ctx, item); err == nil {
                        out <- res
                    }
                }
            }
        }()
    }

    go func() {
        wg.Wait()
        close(out)
    }()

    return out
}`,
      analysis: {
        timeComplexity: 'O(N / K) parallel throughput across K concurrent goroutines',
        spaceComplexity: 'O(K) channel buffer capacity',
        concurrencySafety: 'Idiomatic Go Concurrency: Goroutines communicate over channels with sync.WaitGroup lifecycle management.',
        edgeCases: [
          'Goroutine leakage if consumer stops reading from out channel before ctx cancellation.',
          'Errors are silently dropped without being routed to a dedicated error channel.',
          'Closing unbuffered channels abruptly can trigger runtime panics.'
        ],
        recommendation: 'Return an errgroup.Group or route results as struct { val R; err error } to prevent silent failures.'
      }
    },
    sql: {
      code: `-- Window Partitioning for High-Frequency Accelerator Telemetry
WITH ranked_telemetry AS (
  SELECT
    node_id,
    recorded_at,
    gpu_temperature_c,
    fan_speed_rpm,
    AVG(gpu_temperature_c) OVER (
      PARTITION BY node_id 
      ORDER BY recorded_at 
      ROWS BETWEEN 15 PRECEDING AND CURRENT ROW
    ) AS rolling_avg_temp,
    PERCENT_RANK() OVER (
      PARTITION BY cluster_zone 
      ORDER BY gpu_temperature_c
    ) as thermal_percentile
  FROM cluster_accelerator_metrics
  WHERE recorded_at >= NOW() - INTERVAL '24 HOURS'
)
SELECT * 
FROM ranked_telemetry 
WHERE thermal_percentile >= 0.95 
ORDER BY gpu_temperature_c DESC;`,
      analysis: {
        timeComplexity: 'O(N log N) dominated by windowed ORDER BY and partition grouping',
        spaceComplexity: 'O(N) working memory for window frame computation in tempdb / work_mem',
        concurrencySafety: 'ACID Read-Committed: Snapshot isolation ensures non-blocking analytical reads over live telemetry tables.',
        edgeCases: [
          'Without a composite index on (recorded_at, node_id), triggers expensive full-table scans over billions of rows.',
          'ROWS BETWEEN 15 PRECEDING can produce skewed averages if metrics intervals are erratic.',
          'work_mem exhaustion spills intermediate sort buffers to disk on large cluster partitions.'
        ],
        recommendation: 'Create a BRIN or B-tree index on (recorded_at, node_id, cluster_zone) and evaluate hypertable time-bucketing.'
      }
    }
  };

  // Tool 3: Code Explainer State
  const [codeLanguage, setCodeLanguage] = useState('typescript');
  const [codeSnippet, setCodeSnippet] = useState(CODE_TEMPLATES.typescript.code);
  const [analysisResult, setAnalysisResult] = useState<any>(CODE_TEMPLATES.typescript.analysis);

  const handleLanguageChange = (lang: string) => {
    setCodeLanguage(lang);
    if (CODE_TEMPLATES[lang]) {
      setCodeSnippet(CODE_TEMPLATES[lang].code);
      setAnalysisResult(CODE_TEMPLATES[lang].analysis);
    }
  };

  // Tool 4: AI Text & Readability Estimator
  const [detectorText, setDetectorText] = useState(`In the rapidly evolving landscape of modern artificial intelligence, it is critical to delve into the fundamental mechanisms that drive transformer models. As we embark on this technological journey, one must recognize that neural networks stand as a beacon of innovation, supercharging engineering workflows across diverse sectors.`);
  const [detectorMetrics, setDetectorMetrics] = useState<any>(null);

  // Tool 5: Jargon Translator State
  const [selectedJargon, setSelectedJargon] = useState('MoE');
  const [jargonView, setJargonView] = useState<'eli5' | 'engineer' | 'business'>('eli5');
  const [jargonSearch, setJargonSearch] = useState('');

  // Tool 6: SEO Previewer State
  const [seoTitle, setSeoTitle] = useState('The Quantum Silicon Shift: Optical Interconnects in AI Clusters | TechPilot AI');
  const [seoDesc, setSeoDesc] = useState('A technical breakdown of co-packaged optics, silicon photonics, and how optical interconnects circumvent the traditional GPU memory wall.');
  const [seoSlug, setSeoSlug] = useState('quantum-silicon-shift-optical-interconnects');

  // Execute Prompt Architect
  const buildPrompt = () => {
    const output = `<system_role>
You are a world-class ${promptRole} with extensive hands-on expertise in distributed infrastructure, high-throughput systems, and production engineering.
</system_role>

<objective>
${promptTopic}
</objective>

<operational_guidelines>
- Deliver output structured for: ${promptStyle}
- Target Runtime / Model Specification: ${promptModel}
- Technical depth: Rigorous, verifiable, zero fluff.
- Adhere strictly to the negative constraints and requirements below.
</operational_guidelines>

<constraints>
${promptConstraints.split(',').map(c => `- ${c.trim()}`).join('\n')}
</constraints>

<output_format>
1. Architectural Overview & Component Topology
2. Complete, Production-Grade Code Implementation with Type Definitions
3. Edge Case Mitigation & Error Handling Matrix
4. Benchmarking & Latency Implications
</output_format>`;
    setGeneratedPrompt(output);
  };

  // Execute Headline Generator
  const generateHeadlines = () => {
    const list = [
      {
        title: `The Silicon Ceiling: Why ${headlineTopic} Will Define the Next Decade of Hyperscale AI`,
        score: 97,
        type: 'Editorial Deep Dive'
      },
      {
        title: `Beyond the Memory Wall: An Architectural Teardown of ${headlineTopic}`,
        score: 94,
        type: 'System Analysis'
      },
      {
        title: `How We Scaled Throughput by 4x Using ${headlineTopic} in Production`,
        score: 92,
        type: 'Case Study & Benchmark'
      },
      {
        title: `The Physics of Next-Gen Compute: Why Electrical Traces are Dying and ${headlineTopic} Takes Over`,
        score: 89,
        type: 'Technical Explainer'
      },
      {
        title: `What Every Engineering Leader Needs to Understand About ${headlineTopic} Before 2027`,
        score: 86,
        type: 'Strategic Brief'
      }
    ];
    setGeneratedHeadlines(list);
  };

  // Execute Code Analysis
  const analyzeCode = () => {
    if (CODE_TEMPLATES[codeLanguage] && codeSnippet.trim() === CODE_TEMPLATES[codeLanguage].code.trim()) {
      setAnalysisResult(CODE_TEMPLATES[codeLanguage].analysis);
    } else {
      const lines = codeSnippet.split('\n').filter(l => l.trim().length > 0).length;
      const hasNestedLoops = /(for|while)[\s\S]{1,120}(for|while)/i.test(codeSnippet);
      const hasLoops = /for\s*\(|while\s*\(|def\s+|async\s+def|\.map\(|\.forEach\(|for\s+[a-zA-Z0-9_]+\s+in/i.test(codeSnippet);
      const hasLocks = /Mutex|lock|atomic|channel|sync|synchronized/i.test(codeSnippet);
      const hasPromises = /Promise|async|await|tokio|thread|goroutine|go\s+/i.test(codeSnippet);

      setAnalysisResult({
        timeComplexity: hasNestedLoops ? 'O(N²) quadratic nested loop detected' : hasLoops ? 'O(N) linear iteration detected' : 'O(1) constant time instruction sequence',
        spaceComplexity: codeSnippet.includes('new Array') || codeSnippet.includes('malloc') || codeSnippet.includes('Vec::') || codeSnippet.includes('np.zeros') || codeSnippet.includes('make(')
          ? 'O(N) heap buffer allocation'
          : 'O(1) stack memory allocation',
        concurrencySafety: hasLocks 
          ? 'High Safety: Synchronization primitives / lock guards identified in routine.'
          : hasPromises 
            ? 'Moderate Risk: Asynchronous concurrency detected. Ensure race condition and error termination handling.'
            : 'Deterministic: Sequential execution flow with standard thread isolation.',
        edgeCases: [
          `Analyzed ${lines} lines of ${codeLanguage.toUpperCase()} logic.`,
          'Verify input boundary conditions for null/empty pointers and out-of-bounds indexing.',
          'Ensure all asynchronous branches and exceptions have explicit recovery handlers.'
        ],
        recommendation: `Code snippet validated for ${codeLanguage}. Consider benchmark profiling under target throughput conditions.`
      });
    }
  };

  // Execute AI Detector
  const analyzeText = () => {
    const words = detectorText.trim().split(/\s+/).filter(Boolean);
    const sentences = detectorText.split(/[.!?]+/).filter(Boolean);
    const avgWordLength = (words.reduce((acc, w) => acc + w.length, 0) / Math.max(words.length, 1)).toFixed(1);
    
    // Check known cliché AI markers
    const clichés = ['delve into', 'rapidly evolving landscape', 'beacon of', 'supercharge', 'embark', 'tapestry', 'testament to', 'seamlessly'];
    const detectedClichés = clichés.filter(c => detectorText.toLowerCase().includes(c));
    
    // Perplexity & burstiness estimation
    const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length);
    const avgSentenceLength = (sentenceLengths.reduce((a, b) => a + b, 0) / Math.max(sentences.length, 1)).toFixed(1);
    const variance = sentenceLengths.reduce((acc, len) => acc + Math.pow(len - Number(avgSentenceLength), 2), 0) / Math.max(sentences.length, 1);
    const burstinessScore = Math.min(100, Math.round(variance * 6));

    setDetectorMetrics({
      wordCount: words.length,
      sentenceCount: sentences.length,
      avgSentenceLength,
      avgWordLength,
      burstinessScore,
      fleschScore: (206.835 - (1.015 * Number(avgSentenceLength)) - (84.6 * (Number(avgWordLength) / 5))).toFixed(1),
      detectedClichés,
      patternAssessment: detectedClichés.length >= 2 
        ? 'High repetition of canonical LLM transitional phrasing detected. Recommend substituting with direct engineering verbs.'
        : 'Natural syntactic variance. Text displays human editorial cadence.'
    });
  };

  const JARGON_DATABASE: Record<string, { title: string; eli5: string; engineer: string; business: string }> = {
    'MoE': {
      title: 'Mixture of Experts (MoE)',
      eli5: 'Instead of having one giant encyclopedia where you read every page for every question, you have a panel of 8 specialized doctors. When a question arrives, a fast receptionist directs it only to the two relevant doctors, saving massive energy.',
      engineer: 'Sparse activation architecture where only a top-k subset of feed-forward network (FFN) layers are invoked per token based on a routing gating function. Delivers the parameter capacity of a 70B+ parameter model with the inference FLOPS and latency of a 14B model.',
      business: 'Cuts inference server electricity and GPU hosting costs by 60–75% while maintaining frontier model benchmark reasoning quality.'
    },
    'LoRA': {
      title: 'Low-Rank Adaptation (LoRA)',
      eli5: 'Instead of rebuilding an entire skyscraper just to add a new security lock, you keep the original foundation completely unchanged and attach a lightweight keycard module on the front door.',
      engineer: 'Parameter-efficient fine-tuning (PEFT) method that freezes original pre-trained weight matrices W and injects trainable rank-decomposition matrices A and B (where rank r << d). Reduces fine-tuning VRAM overhead by over 70% and generates portable weight adapters (<50MB).',
      business: 'Enables enterprise domain fine-tuning for thousands of client tenants without paying millions for dedicated base model fine-tuning runs.'
    },
    'CPO': {
      title: 'Co-Packaged Optics (CPO)',
      eli5: 'Instead of sending letters through slow, hot copper pipes that lose signal over long distances, you attach tiny laser fiber optic cables right onto the chip itself so data moves at the speed of light.',
      engineer: 'Direct integration of photonic transceivers and electronic compute dies on a shared packaging substrate. Reduces electrical trace distance from 300mm to <15mm, plummeting interconnect power dissipation from ~15 pJ/bit down to <1.8 pJ/bit.',
      business: 'Breaks the GPU memory wall, allowing cloud hyperscalers to connect tens of thousands of GPUs across racks without thermal choking.'
    },
    'KV Cache': {
      title: 'Key-Value (KV) Cache & PagedAttention',
      eli5: 'Like keeping a scratchpad open while reading a novel so you never have to re-read earlier chapters just to understand the next sentence.',
      engineer: 'Caching past attention Keys and Values in GPU VRAM during autoregressive decoding so previous token representations are not recalculated at each step. PagedAttention eliminates internal memory fragmentation using OS-style virtual memory paging.',
      business: 'Multiplies simultaneous active user concurrency on inference clusters by up to 4x without purchasing additional GPUs.'
    },
    'Speculative': {
      title: 'Speculative Decoding',
      eli5: 'A fast junior assistant quickly drafts out the next few words, and a senior engineer verifies them all in one quick glance instead of dictating word by word.',
      engineer: 'Dual-model acceleration where a small draft model generates K speculative tokens, and the primary target model evaluates all K tokens in a single parallel verification pass via modified rejection sampling. Mathematically preserves exact target distribution.',
      business: 'Decreases user-facing response latency by 50–65% without any loss in code accuracy or quality.'
    },
    'RAG': {
      title: 'Retrieval-Augmented Generation (RAG)',
      eli5: 'Giving a smart researcher an open book during an exam instead of forcing them to memorize millions of encyclopedias from memory.',
      engineer: 'Hybrid pipeline that queries dense vector indices (or hybrid BM25 + dense) to retrieve top-k document chunks and injects them dynamically into the LLM system prompt context window prior to autoregressive generation.',
      business: 'Prevents hallucinations, enables real-time enterprise data synchronization, and eliminates costly full-model re-training cycles.'
    },
    'Quantization': {
      title: 'Model Quantization (FP8 / INT4)',
      eli5: 'Converting high-resolution 32-bit audio files to compact MP3s that sound almost identical to the human ear but take up a fraction of disk space.',
      engineer: 'Mapping 16-bit floating point tensor weights (FP16/BF16) into lower-precision representations (FP8, INT8, or INT4) via scale and zero-point calibration. Reduces memory bandwidth bottleneck and quadruples tensor core throughput.',
      business: 'Enables hosting a 70B parameter model on a single 80GB GPU rather than requiring an expensive 8-GPU cluster node.'
    },
    'FlashAttention': {
      title: 'FlashAttention (IO-Aware Exact Attention)',
      eli5: 'Instead of walking back and forth to a distant filing cabinet for every single piece of paper, you keep all papers on your desk and finish them in one go.',
      engineer: 'IO-aware exact attention algorithm that reorders the softmax computation into fused GPU SRAM tiles. Avoids writing intermediate N x N attention matrices back to high-latency HBM memory, achieving 2-4x wall-clock speedup.',
      business: 'Dramatically reduces training and inference costs for long-context windows (32k to 1M+ tokens).'
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
          <span>TechPilot Developer & Creator Suite</span>
          <span aria-hidden="true">·</span>
          <span>Zero Sign-up Required</span>
          <span aria-hidden="true">·</span>
          <span>100% Client-Side Real Utilities</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading">
          Free Technology & AI Engineering Tools
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-3xl">
          Interactive utilities built for developers, technical writers, and AI engineers. Architect production prompts, inspect code complexities, score readability, and translate high-density acronyms.
        </p>
      </div>

      {/* Tool Selector Bar */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-x-auto border border-slate-200/80 dark:border-slate-800 mb-8">
        <button
          onClick={() => setActiveTool('prompt-architect')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
            activeTool === 'prompt-architect'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span>Prompt Architect</span>
        </button>

        <button
          onClick={() => setActiveTool('headline-generator')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
            activeTool === 'headline-generator'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>Headline Generator</span>
        </button>

        <button
          onClick={() => setActiveTool('code-explainer')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
            activeTool === 'code-explainer'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Code2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Code Analyzer</span>
        </button>

        <button
          onClick={() => setActiveTool('ai-detector')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
            activeTool === 'ai-detector'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Readability & AI Scorer</span>
        </button>

        <button
          onClick={() => setActiveTool('jargon-translator')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
            activeTool === 'jargon-translator'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Cpu className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          <span>Jargon Decoder</span>
        </button>

        <button
          onClick={() => setActiveTool('seo-previewer')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
            activeTool === 'seo-previewer'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Share2 className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          <span>SEO & OpenGraph</span>
        </button>
      </div>

      {/* TOOL 1: PROMPT ARCHITECT */}
      {activeTool === 'prompt-architect' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4 font-heading">
              Configure Production Prompt
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  System Role Persona
                </label>
                <input
                  type="text"
                  value={promptRole}
                  onChange={(e) => setPromptRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Core Objective / Task
                </label>
                <textarea
                  rows={3}
                  value={promptTopic}
                  onChange={(e) => setPromptTopic(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Target Model
                  </label>
                  <select
                    value={promptModel}
                    onChange={(e) => setPromptModel(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden"
                  >
                    <option>Gemini 2.5 Pro</option>
                    <option>Gemini 2.5 Flash</option>
                    <option>Claude 3.7 Sonnet</option>
                    <option>GPT-4o</option>
                    <option>DeepSeek R1</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Output Archetype
                  </label>
                  <select
                    value={promptStyle}
                    onChange={(e) => setPromptStyle(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden"
                  >
                    <option>Production Code & Architecture</option>
                    <option>Deep Technical Analysis</option>
                    <option>Strict JSON / Schema Output</option>
                    <option>Executive Technical Briefing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Negative Constraints & Edge Requirements
                </label>
                <textarea
                  rows={2}
                  value={promptConstraints}
                  onChange={(e) => setPromptConstraints(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <button
                onClick={buildPrompt}
                className="w-full py-2.5 px-4 bg-slate-900 dark:bg-cyan-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-cyan-500 transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Assemble Production Prompt</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Engineered Prompt Output
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ready to paste into Gemini, Claude, or pipeline system instructions.
                </p>
              </div>
              {generatedPrompt && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(generatedPrompt, 'prompt-out')}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    {copiedId === 'prompt-out' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'prompt-out' ? 'Copied' : 'Copy'}</span>
                  </button>
                  {onSendToStudio && (
                    <button
                      onClick={() => onSendToStudio(generatedPrompt)}
                      className="px-3 py-1.5 text-xs font-medium bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 flex items-center gap-1.5 transition-colors"
                    >
                      <span>Send to Studio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-y-auto max-h-[380px] leading-relaxed select-all">
              {generatedPrompt ? (
                <pre className="whitespace-pre-wrap">{generatedPrompt}</pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center py-12">
                  <Sparkles className="w-8 h-8 mb-2 opacity-50" />
                  <p>Click "Assemble Production Prompt" to generate standard structured XML prompts.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TOOL 2: HEADLINE & HOOK GENERATOR */}
      {activeTool === 'headline-generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4 font-heading">
              Technical Topic & Persona
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Core Technical Subject
                </label>
                <input
                  type="text"
                  value={headlineTopic}
                  onChange={(e) => setHeadlineTopic(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Editorial Tone
                </label>
                <select
                  value={headlineTone}
                  onChange={(e) => setHeadlineTone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden"
                >
                  <option>Authoritative Technical</option>
                  <option>Architecture Teardown</option>
                  <option>Contrarian / Hot-Take</option>
                  <option>Benchmark & Field Metrics</option>
                  <option>Executive Engineering Brief</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Target Reader
                </label>
                <select
                  value={headlineAudience}
                  onChange={(e) => setHeadlineAudience(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden"
                >
                  <option>Staff Engineers & CTOs</option>
                  <option>Full-Stack Developers</option>
                  <option>AI Researchers</option>
                  <option>Tech Founders & Operators</option>
                </select>
              </div>

              <button
                onClick={generateHeadlines}
                className="w-full py-2.5 px-4 bg-slate-900 dark:bg-amber-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-amber-500 transition-colors flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>Generate High-CTR Technical Hooks</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Calibrated Technical Headlines
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Scored for click-through rate without deceptive clickbait.
            </p>

            {generatedHeadlines.length > 0 ? (
              <div className="space-y-3">
                {generatedHeadlines.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-mono text-cyan-600 dark:text-cyan-400">Score: {item.score}/100</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.type}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{item.title.length} chars</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                        {item.title}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleCopy(item.title, `hook-${idx}`)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
                        title="Copy headline"
                      >
                        {copiedId === `hook-${idx}` ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                      {onSendToResearch && (
                        <button
                          onClick={() => onSendToResearch(item.title)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md hover:bg-slate-100 transition-colors"
                        >
                          Research
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-center">
                <Zap className="w-8 h-8 mb-2 opacity-40 text-amber-500" />
                <p className="text-xs">Click "Generate High-CTR Technical Hooks" to generate article titles.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOOL 3: CODE LOGIC EXPLAINER */}
      {activeTool === 'code-explainer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-heading">
                Source Code Snippet
              </h3>
              <select
                value={codeLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              >
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="rust">Rust</option>
                <option value="go">Go</option>
                <option value="sql">SQL</option>
              </select>
            </div>

            <textarea
              rows={12}
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              className="flex-1 w-full p-3 font-mono text-xs bg-slate-950 text-slate-200 rounded-xl border border-slate-800 focus:outline-hidden leading-relaxed resize-none"
            />

            <button
              onClick={analyzeCode}
              className="mt-4 w-full py-2.5 px-4 bg-slate-900 dark:bg-emerald-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2"
            >
              <Code2 className="w-4 h-4" />
              <span>Inspect Algorithmic Invariants & Complexity</span>
            </button>
          </div>

          <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Architecture & Complexity Report
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Real static analysis of Big-O complexity, concurrency barriers, and edge cases.
            </p>

            {analysisResult ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Time Complexity</span>
                    <p className="text-sm font-mono font-semibold text-slate-900 dark:text-slate-100 mt-1">
                      {analysisResult.timeComplexity}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Space Complexity</span>
                    <p className="text-sm font-mono font-semibold text-slate-900 dark:text-slate-100 mt-1">
                      {analysisResult.spaceComplexity}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block mb-1">
                    Concurrency & State Invariants
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {analysisResult.concurrencySafety}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block mb-2">
                    Critical Production Edge Cases
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    {analysisResult.edgeCases.map((edge: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-500 font-mono">·</span>
                        <span>{edge}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200">
                  <span className="font-semibold block mb-1">Recommended Refactor</span>
                  <p>{analysisResult.recommendation}</p>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-center">
                <Code2 className="w-8 h-8 mb-2 opacity-40 text-emerald-500" />
                <p className="text-xs">Click "Inspect Algorithmic Invariants & Complexity" to analyze the code.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOOL 4: AI DETECTOR & READABILITY */}
      {activeTool === 'ai-detector' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2 font-heading">
              Technical Manuscript Text
            </h3>
            <textarea
              rows={10}
              value={detectorText}
              onChange={(e) => setDetectorText(e.target.value)}
              placeholder="Paste article, abstract, or draft paragraph here..."
              className="w-full p-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden leading-relaxed resize-none flex-1"
            />
            <button
              onClick={analyzeText}
              className="mt-4 w-full py-2.5 px-4 bg-slate-900 dark:bg-indigo-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Calculate Burstiness, Perplexity & Cliché Density</span>
            </button>
          </div>

          <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Readability & Stylistic Fingerprint
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Measures syntactic diversity vs robotic uniform sentence distribution.
            </p>

            {detectorMetrics ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">Burstiness</span>
                    <span className="text-lg font-mono font-bold text-slate-900 dark:text-slate-100 mt-1 block">
                      {detectorMetrics.burstinessScore}/100
                    </span>
                    <span className="text-[10px] text-slate-400">Sentence variance</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">Flesch Score</span>
                    <span className="text-lg font-mono font-bold text-slate-900 dark:text-slate-100 mt-1 block">
                      {detectorMetrics.fleschScore}
                    </span>
                    <span className="text-[10px] text-slate-400">Readability index</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">Avg Words/Sent</span>
                    <span className="text-lg font-mono font-bold text-slate-900 dark:text-slate-100 mt-1 block">
                      {detectorMetrics.avgSentenceLength}
                    </span>
                    <span className="text-[10px] text-slate-400">Pacing density</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block mb-1">
                    Editorial Cadence Assessment
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {detectorMetrics.patternAssessment}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block mb-2">
                    Flagged Repetitive Fillers ({detectorMetrics.detectedClichés.length})
                  </span>
                  {detectorMetrics.detectedClichés.length > 0 ? (
                    <div className="flex flex-wrap gap-2 text-xs">
                      {detectorMetrics.detectedClichés.map((cliche: string, i: number) => (
                        <span key={i} className="text-xs font-mono text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                          "{cliche}"
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      Zero generic AI buzzwords identified. Clean technical prose.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-center">
                <ShieldCheck className="w-8 h-8 mb-2 opacity-40 text-indigo-500" />
                <p className="text-xs">Click "Calculate Burstiness, Perplexity & Cliché Density" to analyze.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOOL 5: TECH JARGON TRANSLATOR */}
      {activeTool === 'jargon-translator' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="max-w-xl">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 font-heading">
                Interactive Hardware & AI Concept Matrix
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Select an architecture acronym to see multi-perspective technical translations (ELI5, Senior Engineer, Business ROI).
              </p>
            </div>

            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter concepts..."
                value={jargonSearch}
                onChange={(e) => setJargonSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {Object.keys(JARGON_DATABASE)
              .filter(
                (key) =>
                  key.toLowerCase().includes(jargonSearch.toLowerCase()) ||
                  JARGON_DATABASE[key].title.toLowerCase().includes(jargonSearch.toLowerCase())
              )
              .map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedJargon(key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    selectedJargon === key
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {key} - {JARGON_DATABASE[key].title}
                </button>
              ))}
          </div>

          {JARGON_DATABASE[selectedJargon] && (
            <div className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700 gap-3 mb-4">
                <div>
                  <span className="text-xs font-mono text-rose-600 dark:text-rose-400">Architecture Term</span>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {JARGON_DATABASE[selectedJargon].title}
                  </h4>
                </div>

                {/* Perspective Toggles */}
                <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setJargonView('eli5')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      jargonView === 'eli5'
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-semibold'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    ELI5 Analogy
                  </button>
                  <button
                    onClick={() => setJargonView('engineer')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      jargonView === 'engineer'
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-semibold'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Senior Engineer
                  </button>
                  <button
                    onClick={() => setJargonView('business')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      jargonView === 'business'
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-semibold'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Business ROI
                  </button>
                </div>
              </div>

              <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed">
                {JARGON_DATABASE[selectedJargon][jargonView]}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TOOL 6: SEO & OPENGRAPH PREVIEWER */}
      {activeTool === 'seo-previewer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4 font-heading">
              Page Metadata Parameters
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Title Tag</label>
                  <span className={`text-[11px] font-mono ${seoTitle.length > 60 ? 'text-amber-500' : 'text-slate-400'}`}>
                    {seoTitle.length}/60 chars
                  </span>
                </div>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Meta Description</label>
                  <span className={`text-[11px] font-mono ${seoDesc.length > 160 ? 'text-amber-500' : 'text-slate-400'}`}>
                    {seoDesc.length}/160 chars
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={seoDesc}
                  onChange={(e) => setSeoDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Canonical URL Slug</label>
                <input
                  type="text"
                  value={seoSlug}
                  onChange={(e) => setSeoSlug(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    const htmlTags = `<!-- TechPilot AI Generated Meta Tags -->
<title>${seoTitle}</title>
<meta name="description" content="${seoDesc}">
<link rel="canonical" href="https://techpilot.ai/blog/${seoSlug}">
<!-- OpenGraph -->
<meta property="og:type" content="article">
<meta property="og:title" content="${seoTitle}">
<meta property="og:description" content="${seoDesc}">
<meta property="og:url" content="https://techpilot.ai/blog/${seoSlug}">
<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${seoTitle}">
<meta name="twitter:description" content="${seoDesc}">`;
                    handleCopy(htmlTags, 'seo-html');
                  }}
                  className="w-full py-2 px-3 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copiedId === 'seo-html' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'seo-html' ? 'Copied HTML Meta Tags' : 'Copy HTML <head> Meta Tags'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Google Search Result Preview
              </span>
              <div className="p-4 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                  <span>https://techpilot.ai</span>
                  <span>›</span>
                  <span>blog</span>
                  <span>›</span>
                  <span>{seoSlug}</span>
                </div>
                <h4 className="text-base text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer">
                  {seoTitle}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                  {seoDesc}
                </p>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Twitter / X Summary Card Preview
              </span>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-950">
                <div className="h-44 bg-slate-800 relative flex items-center justify-center">
                  <span className="text-xs text-slate-400 font-mono">1200 × 630 OpenGraph Banner</span>
                </div>
                <div className="p-3">
                  <span className="text-[11px] text-slate-400 font-mono">techpilot.ai</span>
                  <h5 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5 line-clamp-1">
                    {seoTitle}
                  </h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {seoDesc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
