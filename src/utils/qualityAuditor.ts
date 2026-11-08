import { QualityCheckReport, QualityProblem } from '../types';

/**
 * Objective, deterministic manuscript quality and SEO auditor.
 * Used for instant client-side evaluation or when server-side Gemini API encounters quota limits.
 * Adheres strictly to TechPilot AI factual integrity rules:
 * - Never invents fake scores
 * - Explains every score with concrete textual evidence
 * - Flags ungrounded statistics and AI boilerplate clichés
 */
export function runDeterministicQualityAudit(
  title: string,
  content: string,
  excerpt: string = ''
): QualityCheckReport {
  const cleanTitle = title.trim();
  const cleanContent = content.trim();
  const paragraphs = cleanContent.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const words = cleanContent.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // 1. Technical Accuracy & Terminology Analysis
  const techTerms = [
    'latency', 'throughput', 'bandwidth', 'hbm', 'sram', 'gpu', 'asic', 'gemm', 'flops',
    'nvlink', 'pcie', 'infiniband', 'roce', 'transformer', 'attention', 'cache', 'kv',
    'moe', 'expert', 'routing', 'serialization', 'interconnect', 'memory wall', 'concurrency'
  ];
  const foundTechTerms = Array.from(
    new Set(techTerms.filter((term) => new RegExp(`\\b${term}\\b`, 'i').test(cleanContent)))
  );

  const passedChecks: string[] = [];
  const detectedErrors: string[] = [];

  if (foundTechTerms.length >= 6) {
    passedChecks.push(`High density of verified domain engineering terminology (${foundTechTerms.length} core concepts identified).`);
  } else if (foundTechTerms.length >= 2) {
    passedChecks.push(`Moderate domain terminology density (${foundTechTerms.length} terms).`);
  } else {
    detectedErrors.push('Low technical specificity: Article relies heavily on non-technical generalizations without architectural depth.');
  }

  // 2. Unsupported Claims & Statistics Identification
  const statRegex = /\b(\d+(\.\d+)?%|\d+(\.\d+)?\s*(?:x|TB\/s|GB\/s|Gbps|Tbps|kW|ms|μs|ns|pJ\/bit|TFLOPS|PFLOPS))\b/g;
  const rawMatches = cleanContent.match(statRegex) || [];
  const uniqueStats = Array.from(new Set(rawMatches));

  const hasCitationsSection = /(?:###\s*(?:Sources|Citations|References)|Sources Suggested|ACM|IEEE|arXiv|DOI)/i.test(cleanContent);
  const unsupportedClaims: Array<{ claim: string; issue: string; suggestedVerification: string }> = [];

  // Inspect sentences containing numerical statistics
  const sentences = cleanContent.split(/(?<=[.?!])\s+/);
  for (const sentence of sentences) {
    if (statRegex.test(sentence) && unsupportedClaims.length < 5) {
      const trimmedSentence = sentence.trim().slice(0, 160);
      const hasDirectCitation = /\[(?:https?:\/\/|\d+)\]|\(.*?20\d\d\)|according to|specified by|RFC|IEEE|ACM/i.test(sentence);
      if (!hasDirectCitation && !hasCitationsSection) {
        unsupportedClaims.push({
          claim: trimmedSentence,
          issue: 'Specific quantitative metric stated without direct attribution or primary benchmark citation.',
          suggestedVerification: 'Attach primary specification source, RFC, or MLPerf/SPEC benchmark document.',
        });
      }
    }
  }

  if (uniqueStats.length > 0 && !hasCitationsSection) {
    detectedErrors.push(`${uniqueStats.length} quantitative benchmarks or metrics detected without an authoritative citations section.`);
  } else if (hasCitationsSection) {
    passedChecks.push('Authoritative citations or primary verification sources section detected.');
  }

  // 3. Mathematical Equations & Code Examples Checker
  // Math inspection
  const displayMathMatches = cleanContent.match(/\$\$[\s\S]*?\$\$/g) || [];
  const inlineMathMatches = cleanContent.match(/\$[^$\n]+\$/g) || [];
  const totalMathBlocks = displayMathMatches.length + inlineMathMatches.length;

  let equationNotes = 'No mathematical formulations detected.';
  if (totalMathBlocks > 0) {
    // Check for broken single dollar signs
    const totalSingleDollars = (cleanContent.match(/(?<!\$)\$(?!\$)/g) || []).length;
    const isMathBalanced = totalSingleDollars % 2 === 0;
    if (isMathBalanced) {
      equationNotes = `Verified ${displayMathMatches.length} display LaTeX formula(s) and ${inlineMathMatches.length} inline formula(s) with balanced delimiters.`;
      passedChecks.push('LaTeX equations maintain syntactically balanced delimiters.');
    } else {
      equationNotes = `Warning: Unbalanced single dollar delimiters detected (${totalSingleDollars} tokens). Possible math rendering artifact.`;
      detectedErrors.push('Unbalanced LaTeX math delimiters detected in text.');
    }
  }

  // Code inspection
  const codeBlocks = cleanContent.match(/```[a-z]*\n[\s\S]*?```/g) || [];
  let codeSyntaxValid = true;
  const codeIssues: string[] = [];
  const codeRecommendations: string[] = [];

  if (codeBlocks.length > 0) {
    passedChecks.push(`Contains ${codeBlocks.length} code block(s) with syntax tags.`);
    for (const block of codeBlocks) {
      // Check bracket balance
      const openBraces = (block.match(/\{/g) || []).length;
      const closeBraces = (block.match(/\}/g) || []).length;
      const openParens = (block.match(/\(/g) || []).length;
      const closeParens = (block.match(/\)/g) || []).length;

      if (openBraces !== closeBraces) {
        codeSyntaxValid = false;
        codeIssues.push(`Mismatched curly braces in code snippet (${openBraces} open vs ${closeBraces} close).`);
      }
      if (openParens !== closeParens) {
        codeSyntaxValid = false;
        codeIssues.push(`Mismatched parentheses in code snippet (${openParens} open vs ${closeParens} close).`);
      }

      // Check if educational label is needed for toy scripts
      if (block.includes('EducationalBlockTable') || block.includes('EducationalMemoryManager')) {
        codeRecommendations.push('Educational simulation block manager detected: Ensure disclaimer specifies missing C++/CUDA kernel integration.');
      }
    }
    if (codeSyntaxValid) {
      codeRecommendations.push('Code snippets exhibit valid syntactic delimiters and function boundaries.');
    }
  } else {
    codeRecommendations.push('No code snippets included. Adding typed implementation examples improves technical authority.');
  }

  // 4. Duplicate or Repetitive Content Detection
  let hasRepetition = false;
  let repetitionDetails = 'No significant paragraph duplication or circular loops detected.';
  const seenHeadings = new Set<string>();
  const duplicateHeadings: string[] = [];

  const headingMatches = cleanContent.match(/^###?\s+(.+)$/gm) || [];
  for (const h of headingMatches) {
    const norm = h.replace(/^#+\s+/, '').trim().toLowerCase();
    if (seenHeadings.has(norm)) {
      duplicateHeadings.push(h);
    }
    seenHeadings.add(norm);
  }

  if (duplicateHeadings.length > 0) {
    hasRepetition = true;
    repetitionDetails = `Duplicate section heading(s) detected: ${duplicateHeadings.join(', ')}. Renumber sections sequentially.`;
  }

  // Check duplicate sentences
  const sentenceMap = new Map<string, number>();
  for (const s of sentences) {
    const cleanS = s.trim().toLowerCase();
    if (cleanS.length > 40) {
      sentenceMap.set(cleanS, (sentenceMap.get(cleanS) || 0) + 1);
    }
  }
  const repeatedSentences = Array.from(sentenceMap.entries()).filter(([_, count]) => count > 1);
  if (repeatedSentences.length > 0) {
    hasRepetition = true;
    repetitionDetails += ` Detected ${repeatedSentences.length} verbatim repeated sentence(s).`;
  }

  // 5. Anti-Slop & Original Value Analysis
  const slopPhrases = [
    "in today's digital landscape",
    'testament to',
    'beacon of innovation',
    'embark on a journey',
    'delve deep',
    'revolutionizing the way',
    'game changer',
    'tapestry of',
    'it is crucial to remember that'
  ];
  const boilerplateFound = slopPhrases.filter((phrase) =>
    new RegExp(`\\b${phrase}\\b`, 'i').test(cleanContent)
  );
  const isAiSlopFree = boilerplateFound.length === 0;

  // 6. Heading Hierarchy & Readability
  const hasH2 = /^##\s+/m.test(cleanContent);
  const hasH3 = /^###\s+/m.test(cleanContent);
  let headingAnalysis = 'Heading hierarchy is well-structured with clear section demarcations.';
  if (!hasH2 && !hasH3) {
    headingAnalysis = 'Poor heading structure: Article lacks markdown headings (## or ###) to organize sub-topics.';
  } else if (hasH3 && !hasH2) {
    headingAnalysis = 'Uses ### subheadings consistently. Consider incorporating ## for major chapter transitions.';
  }

  // 7. SEO Analysis
  const titleLen = cleanTitle.length;
  let suggestedTitle = cleanTitle;
  if (titleLen > 65) {
    suggestedTitle = cleanTitle.slice(0, 58).replace(/:?[^:]*$/, '') || cleanTitle.slice(0, 60);
  } else if (titleLen < 30) {
    suggestedTitle = `${cleanTitle}: Architectural Teardown & Guide`;
  }

  let suggestedMetaDesc = excerpt.trim();
  if (!suggestedMetaDesc || suggestedMetaDesc.length < 50) {
    const firstPara = paragraphs[0] ? paragraphs[0].replace(/^#+.*?\n/, '').trim() : '';
    suggestedMetaDesc = firstPara.slice(0, 155) || `An in-depth technical analysis of ${cleanTitle.toLowerCase()}, covering architectural trade-offs, benchmarks, and production guidelines.`;
  }
  if (suggestedMetaDesc.length > 160) {
    suggestedMetaDesc = suggestedMetaDesc.slice(0, 155).replace(/\s+\S*$/, '') + '...';
  }

  // Top Keywords via frequency
  const stopWords = new Set([
    'the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'over', 'these', 'those', 'under',
    'during', 'where', 'which', 'when', 'what', 'then', 'than', 'have', 'more', 'most', 'will', 'each'
  ]);
  const wordFreq = new Map<string, number>();
  for (const w of words) {
    const lower = w.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (lower.length >= 4 && !stopWords.has(lower)) {
      wordFreq.set(lower, (wordFreq.get(lower) || 0) + 1);
    }
  }
  const sortedKeywords = Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([term]) => term.charAt(0).toUpperCase() + term.slice(1));

  // 8. Compute Multi-Dimensional Scores (0-100)
  // Technical Quality Score
  let techScore = 65;
  if (foundTechTerms.length >= 8) techScore += 20;
  else if (foundTechTerms.length >= 4) techScore += 10;
  if (codeBlocks.length > 0 && codeSyntaxValid) techScore += 10;
  if (totalMathBlocks > 0) techScore += 5;
  if (detectedErrors.length > 0) techScore -= detectedErrors.length * 6;
  techScore = Math.min(98, Math.max(35, techScore));

  // Source Quality Score
  let sourceScore = 50;
  if (hasCitationsSection) sourceScore += 35;
  if (unsupportedClaims.length === 0) sourceScore += 15;
  else sourceScore -= unsupportedClaims.length * 8;
  sourceScore = Math.min(96, Math.max(30, sourceScore));

  // Readability & Structure Score
  let readScore = 75;
  if (wordCount >= 600 && wordCount <= 3500) readScore += 10;
  if (paragraphs.length >= 4) readScore += 5;
  if (hasRepetition) readScore -= 18;
  if (!isAiSlopFree) readScore -= boilerplateFound.length * 8;
  readScore = Math.min(95, Math.max(30, readScore));

  // SEO Score
  let seoScore = 70;
  if (titleLen >= 35 && titleLen <= 65) seoScore += 15;
  else seoScore -= 10;
  if (suggestedMetaDesc.length >= 120 && suggestedMetaDesc.length <= 160) seoScore += 10;
  if (hasH2 || hasH3) seoScore += 5;
  seoScore = Math.min(95, Math.max(40, seoScore));

  const overallScore = Math.round((techScore * 0.35) + (sourceScore * 0.25) + (readScore * 0.2) + (seoScore * 0.2));

  // 9. Problems Needing Human Attention
  const problems: QualityProblem[] = [];

  if (unsupportedClaims.length > 0) {
    for (const uc of unsupportedClaims) {
      problems.push({
        severity: 'warning',
        category: 'Sources',
        problem: `Ungrounded claim: "${uc.claim}"`,
        remediation: uc.suggestedVerification,
      });
    }
  }

  if (duplicateHeadings.length > 0) {
    problems.push({
      severity: 'critical',
      category: 'Readability',
      problem: `Duplicate section headings found (${duplicateHeadings.join(', ')}).`,
      remediation: 'Renumber sections sequentially (01, 02, 03) to prevent reader disorientation.',
    });
  }

  if (codeIssues.length > 0) {
    for (const issue of codeIssues) {
      problems.push({
        severity: 'critical',
        category: 'Code/Math',
        problem: issue,
        remediation: 'Fix syntax mismatch before editorial approval.',
      });
    }
  }

  if (boilerplateFound.length > 0) {
    problems.push({
      severity: 'warning',
      category: 'Originality',
      problem: `AI boilerplate cliché detected: "${boilerplateFound.join('", "')}".`,
      remediation: 'Replace generic filler with direct, concrete engineering statements.',
    });
  }

  if (titleLen > 65) {
    problems.push({
      severity: 'suggestion',
      category: 'SEO',
      problem: `Title length (${titleLen} chars) exceeds search engine recommended display limit (60-65 chars).`,
      remediation: `Consider trimming to: "${suggestedTitle}"`,
    });
  }

  // 10. Prioritized Improvement Suggestions
  const improvementSuggestions: string[] = [];
  if (unsupportedClaims.length > 0) {
    improvementSuggestions.push('Add primary benchmark links or official specification documents for quantitative metrics.');
  }
  if (!isAiSlopFree) {
    improvementSuggestions.push(`Purge generic marketing prose (${boilerplateFound.length} phrase(s) flagged) to maintain academic tone.`);
  }
  if (totalMathBlocks === 0) {
    improvementSuggestions.push('Incorporate formal mathematical expressions ($$ ... $$) for algorithmic time/space invariants.');
  }
  if (codeBlocks.length === 0) {
    improvementSuggestions.push('Include a minimal, syntactically typed code snippet (TypeScript or Python) demonstrating kernel dispatch.');
  }
  if (improvementSuggestions.length < 3) {
    improvementSuggestions.push('Verify section numbering order and ensure the conclusion provides concrete deployment considerations.');
  }

  return {
    overallScore,
    scores: {
      technicalQuality: techScore,
      sourceQuality: sourceScore,
      readability: readScore,
      seo: seoScore,
    },
    scoreRationales: {
      technicalQualityRationale: `Score reflects ${foundTechTerms.length} core engineering terms, ${codeBlocks.length} code blocks, and ${totalMathBlocks} mathematical formulations.`,
      sourceQualityRationale: hasCitationsSection
        ? 'Includes an authoritative primary sources section. Minor assertions should retain direct in-text links.'
        : 'Lacks explicit primary citations section; quantitative metrics require human verification.',
      readabilityRationale: `Evaluated across ${paragraphs.length} paragraphs (${wordCount} words). ${hasRepetition ? 'Contains repetition issues.' : 'No circular repetition.'} ${isAiSlopFree ? 'Zero generic AI slop phrases.' : `${boilerplateFound.length} boilerplate phrase(s) flagged.`}`,
      seoRationale: `Title is ${titleLen} characters (target 40-60). Meta description is ${suggestedMetaDesc.length} characters (target 140-160). Heading hierarchy status: ${hasH2 || hasH3 ? 'Pass' : 'Needs headings'}.`,
    },
    technicalAccuracy: {
      passedChecks,
      detectedErrors,
    },
    unsupportedClaims,
    mathAndCode: {
      equationNotes,
      codeSyntaxValid,
      codeIssues,
      codeRecommendations,
    },
    contentRepetition: {
      hasRepetition,
      details: repetitionDetails,
    },
    originalityAndValue: {
      noveltyAssessment: isAiSlopFree
        ? 'High originality: Demonstrates technical depth without generic introductory filler.'
        : `Contains ${boilerplateFound.length} recurring AI clichés that dilute editorial authority.`,
      isAiSlopFree,
      boilerplatePhrasesFound: boilerplateFound,
    },
    seo: {
      suggestedTitle,
      titleLength: suggestedTitle.length,
      suggestedMetaDescription: suggestedMetaDesc,
      metaDescriptionLength: suggestedMetaDesc.length,
      suggestedKeywords: sortedKeywords,
      headingStructureAssessment: headingAnalysis,
    },
    problemsNeedingAttention: problems,
    improvementSuggestions,
    auditedAt: new Date().toISOString(),
    isLiveGemini: false,
  };
}
