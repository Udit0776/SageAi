// Deterministic ATS Resume Scorer
import { extractCanonicalSkills } from "./skill-taxonomy.js";

const ACTION_VERBS = new Set([
  "achieved", "built", "designed", "developed", "engineered", "implemented", "improved", 
  "increased", "launched", "led", "managed", "optimised", "optimized", "reduced", "delivered", 
  "architected", "automated", "collaborated", "created", "deployed", "established", "executed", 
  "generated", "grew", "handled", "integrated", "modernised", "modernized", "orchestrated", 
  "oversaw", "pioneered", "resolved", "spearheaded", "streamlined", "transformed", "upgraded", 
  "administered", "analyzed", "coordinated", "formulated", "guided", "introduced", "minimized", 
  "monitored", "negotiated", "maximized", "customized", "directed", "expedited", "facilitated", 
  "initiated", "inspected", "mentored", "programmed", "restructured", "tailored", "trained", 
  "simplified", "solved", "conducted", "drove", "headed", "presented"
]);

const STOPWORDS = new Set([
  "the", "and", "a", "to", "of", "for", "in", "on", "with", "at", "by", "an", "is", "are", 
  "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "but", 
  "if", "or", "because", "as", "until", "while", "about", "into", "through", "during", 
  "before", "after", "above", "below", "from", "up", "down", "out", "off", "over", "under", 
  "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", 
  "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", 
  "nor", "not", "only", "own", "same", "so", "than", "too", "very", "can", "will", "just", 
  "should", "now", "that", "this", "these", "those", "their", "them", "they", "our", "your", 
  "its", "would", "could", "should", "isn", "aren", "wasn", "weren", "hasn", "haven", "hadn", 
  "doesn", "don", "shouldn", "wouldn", "couldn", "mustn"
]);

const CORPUS = [
  "successful professional with years of experience",
  "proven track record of success",
  "highly motivated self starter",
  "excellent communication and interpersonal skills",
  "ability to work in a fast paced environment",
  "strong team player and detail oriented",
  "results driven and goal oriented",
  "demonstrated capability in managing projects",
  "adept at collaborating with cross functional teams",
  "passionate about delivering high quality solutions",
  "solid background in software engineering",
  "skills in designing and implementing",
  "experienced in troubleshooting and problem solving",
  "effective leadership and management skills",
  "committed to continuous learning",
  "ability to prioritize and multitask",
  "knowledge of industry best practices",
  "track record of meeting deadlines",
  "strive for excellence in every task",
  "excellent organizational and planning abilities"
];

function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .split(/[^a-z0-9+-]/i)
    .map(t => t.trim())
    .filter(t => t.length >= 3 && !STOPWORDS.has(t));
}

const CORPUS_TOKEN_SETS = CORPUS.map(doc => new Set(tokenize(doc)));

function getIDF(token) {
  let df = 0;
  for (const docSet of CORPUS_TOKEN_SETS) {
    if (docSet.has(token)) {
      df++;
    }
  }
  return Math.log((CORPUS.length + 1) / (df + 1)) + 1;
}

// 1. SECTION DETECTION (25 points)
function detectSections(resumeText) {
  const lines = resumeText.split(/\r?\n/);
  const foundSections = [];
  const missingSections = [];
  let sectionScore = 0;

  const sectionsToFind = [
    { 
      key: "contact", 
      name: "Contact Info", 
      points: 3, 
      regex: /(contact|personal info|info|links|about me)/i, 
      check: (text) => /[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/.test(text) || /\+?\d[\d-\s()]{7,}/.test(text) 
    },
    { 
      key: "summary", 
      name: "Professional Summary/Objective", 
      points: 3, 
      regex: /(professional summary|summary|objective|profile|about)/i 
    },
    { 
      key: "skills", 
      name: "Skills", 
      points: 6, 
      regex: /(skills|expertise|technologies|competencies|capabilities)/i 
    },
    { 
      key: "experience", 
      name: "Work Experience", 
      points: 6, 
      regex: /(experience|employment|history|work|career)/i 
    },
    { 
      key: "education", 
      name: "Education", 
      points: 4, 
      regex: /(education|academic|studies|university)/i 
    },
    { 
      key: "projects", 
      name: "Projects/Portfolio", 
      points: 3, 
      regex: /(projects|portfolio|accomplishments)/i 
    }
  ];

  for (const sec of sectionsToFind) {
    let found = false;
    for (const line of lines) {
      const cleanLine = line.trim();
      // Heuristic for a section header: starts with markdown header prefix, is bolded, or is a short capital line
      const isHeader = cleanLine.startsWith('#') || 
                       cleanLine.startsWith('**') || 
                       (cleanLine.length < 30 && /^[A-Z][A-Za-z\s/&]{2,25}$/.test(cleanLine));
      
      if (isHeader && sec.regex.test(cleanLine)) {
        found = true;
        break;
      }
    }
    
    // Fallback detection for contact info
    if (!found && sec.check && sec.check(resumeText)) {
      found = true;
    }

    if (found) {
      foundSections.push(sec.name);
      sectionScore += sec.points;
    } else {
      missingSections.push(sec.name);
    }
  }

  return { sectionScore, foundSections, missingSections };
}

// 2. KEYWORD DENSITY / TF-IDF SCORE (35 points)
function computeKeywordScore(resumeText, jdText, options = {}) {
  const { isGeneralStructuralOnly = false } = options;

  if (isGeneralStructuralOnly || !jdText || jdText.trim().length === 0) {
    return { keywordScore: 0, matchedKeywords: [], missingKeywords: [], isGeneralStructuralOnly: true };
  }

  const jdSkills = extractCanonicalSkills(jdText);
  const resumeSkills = extractCanonicalSkills(resumeText);

  if (jdSkills.size === 0) {
    // Fallback to standard token-based matching if no skills are detected in the JD
    const jdTokens = tokenize(jdText);
    const resumeTokens = tokenize(resumeText);
    const resumeTokenSet = new Set(resumeTokens);

    if (jdTokens.length === 0) {
      return { keywordScore: 0, matchedKeywords: [], missingKeywords: [] };
    }

    const jdTF = {};
    for (const token of jdTokens) {
      jdTF[token] = (jdTF[token] || 0) + 1;
    }

    const uniqueJDTokens = Object.keys(jdTF);
    const weights = {};
    let totalWeight = 0;

    for (const token of uniqueJDTokens) {
      const tf = jdTF[token] / jdTokens.length;
      const idf = getIDF(token);
      weights[token] = tf * idf;
      totalWeight += weights[token];
    }

    if (totalWeight === 0) {
      return { keywordScore: 0, matchedKeywords: [], missingKeywords: [] };
    }

    let matchedWeight = 0;
    const matchedKeywords = [];
    const missingKeywords = [];

    for (const token of uniqueJDTokens) {
      if (resumeTokenSet.has(token)) {
        matchedWeight += weights[token];
        matchedKeywords.push(token);
      } else {
        missingKeywords.push(token);
      }
    }

    const keywordScore = Math.round((matchedWeight / totalWeight) * 35);
    return { keywordScore, matchedKeywords, missingKeywords };
  }

  const matchedKeywords = [];
  const missingKeywords = [];

  for (const skill of jdSkills) {
    if (resumeSkills.has(skill)) {
      matchedKeywords.push(skill);
    } else {
      missingKeywords.push(skill);
    }
  }

  const keywordScore = Math.round((matchedKeywords.length / jdSkills.size) * 35);

  return { keywordScore, matchedKeywords, missingKeywords };
}

// 3. ACTION VERB SCORE (20 points)
function computeActionVerbScore(resumeText) {
  const lines = resumeText.split(/\r?\n/);
  // Detect bullet points: lines starting with -, *, • or numbers followed by a dot
  const bulletRegex = /^\s*([-*•]|\d+\.)\s+(.+)$/;
  let totalBullets = 0;
  let actionVerbBullets = 0;
  const weakBullets = [];

  for (const line of lines) {
    const match = line.match(bulletRegex);
    if (match) {
      totalBullets++;
      const bulletText = match[2].trim();
      
      // Smart check: split by colon, dash, or pipe to handle labeled bullets like "Label: Developed..."
      const parts = bulletText.split(/[:\-|]/).map(p => p.trim()).filter(Boolean);
      let hasActionVerb = false;
      
      for (const part of parts) {
        const firstWord = part.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "") || "";
        if (ACTION_VERBS.has(firstWord)) {
          hasActionVerb = true;
          break;
        }
      }
      
      if (hasActionVerb) {
        actionVerbBullets++;
      } else {
        weakBullets.push(bulletText);
      }
    }
  }

  const actionVerbScore = totalBullets > 0 
    ? Math.round((actionVerbBullets / totalBullets) * 20) 
    : 0;

  return { actionVerbScore, totalBullets, actionVerbBullets, weakBullets };
}

// 4. FORMATTING PENALTY (20 points, starts full)
function computeFormattingScore(resumeText) {
  let formattingScore = 20;
  const penalties = [];

  // Table check
  const hasTable = /\|?\s*:?-{3,}:?\s*\|/g.test(resumeText);
  if (hasTable) {
    formattingScore -= 8;
    penalties.push("Markdown tables detected (unfriendly for simple ATS parsers).");
  }

  // Excessive special characters
  const specialCharsMatch = resumeText.match(/[█▪●■♦★◆|]/g);
  if (specialCharsMatch && specialCharsMatch.length > 10) {
    formattingScore -= 5;
    penalties.push(`Excessive special characters or dividers found (${specialCharsMatch.length} occurrences).`);
  }

  // Very long paragraphs
  const paragraphs = resumeText.split(/\r?\n\s*\r?\n/);
  let hasLongParagraph = false;
  for (const para of paragraphs) {
    const wordCount = para.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount > 200) {
      hasLongParagraph = true;
      break;
    }
  }
  if (hasLongParagraph) {
    formattingScore -= 4;
    penalties.push("Very long unbroken paragraph(s) detected (>200 words).");
  }

  // Missing contact info
  const hasEmail = /[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/.test(resumeText);
  const hasPhone = /\+?\d[\d-\s()]{7,}/.test(resumeText);
  if (!hasEmail || !hasPhone) {
    formattingScore -= 3;
    penalties.push("Missing critical contact details (email or phone pattern not detected).");
  }

  formattingScore = Math.max(0, formattingScore);

  return { formattingScore, penalties };
}

export function computeATSScore(resumeText, jdText, options = {}) {
  const { isGeneralStructuralOnly = false } = options;
  const sectionResult = detectSections(resumeText);
  const structuralOnly = isGeneralStructuralOnly || !jdText || jdText.trim().length === 0;

  const keywordResult = computeKeywordScore(resumeText, jdText, options);
  const actionVerbResult = computeActionVerbScore(resumeText);
  const formattingResult = computeFormattingScore(resumeText);

  let totalScore = 0;
  let breakdown = {};

  if (structuralOnly) {
    // Re-scale the three structural categories to total 100 points
    // Max Section: 35 points, Max Action Verbs: 30 points, Max Formatting: 35 points
    const secScore = Math.round((sectionResult.sectionScore / 25) * 35);
    const avScore = Math.round((actionVerbResult.actionVerbScore / 20) * 30);
    const fmtScore = Math.round((formattingResult.formattingScore / 20) * 35);
    
    totalScore = secScore + avScore + fmtScore;
    breakdown = {
      section: secScore,
      keyword: 0,
      actionVerb: avScore,
      formatting: fmtScore
    };
  } else {
    // Standard targeted scoring (total 100 points)
    totalScore = sectionResult.sectionScore + 
                 keywordResult.keywordScore + 
                 actionVerbResult.actionVerbScore + 
                 formattingResult.formattingScore;
                 
    breakdown = {
      section: sectionResult.sectionScore,
      keyword: keywordResult.keywordScore,
      actionVerb: actionVerbResult.actionVerbScore,
      formatting: formattingResult.formattingScore
    };
  }

  let grade = "D";
  if (totalScore >= 85) grade = "A";
  else if (totalScore >= 70) grade = "B";
  else if (totalScore >= 55) grade = "C";

  return {
    totalScore,
    grade,
    breakdown,
    scanMode: structuralOnly ? "structural" : "targeted",
    foundSections: sectionResult.foundSections,
    missingSections: sectionResult.missingSections,
    matchedKeywords: keywordResult.matchedKeywords,
    missingKeywords: keywordResult.missingKeywords,
    totalBullets: actionVerbResult.totalBullets,
    actionVerbBullets: actionVerbResult.actionVerbBullets,
    weakBullets: actionVerbResult.weakBullets,
    penalties: formattingResult.penalties
  };
}

export function getPlainTextFromResume(resume) {
  if (!resume) return "";
  let obj = resume;
  if (typeof resume === "string") {
    try {
      obj = JSON.parse(resume);
    } catch (e) {
      return resume;
    }
  }
  
  if (obj.customMarkdown && obj.customMarkdown.trim().length > 0) {
    return obj.customMarkdown;
  }
  
  const parts = [];
  if (obj.contactInfo) {
    const contactParts = [];
    if (obj.contactInfo.mobile) contactParts.push(obj.contactInfo.mobile);
    if (obj.contactInfo.email) contactParts.push(obj.contactInfo.email);
    if (obj.contactInfo.linkedin) {
      const cleanLink = obj.contactInfo.linkedin.replace(/https?:\/\/(www\.)?/, "");
      contactParts.push(`[${cleanLink}](${obj.contactInfo.linkedin})`);
    }
    if (obj.contactInfo.twitter) {
      const cleanTwitter = obj.contactInfo.twitter.replace(/https?:\/\/(www\.)?(twitter\.com|x\.com)\//, "@");
      contactParts.push(`[${cleanTwitter}](${obj.contactInfo.twitter})`);
    }
    if (contactParts.length > 0) {
      parts.push(`## Contact Info\n\n${contactParts.join(" | ")}`);
    }
  }

  if (obj.summary) {
    parts.push(`## Professional Summary\n\n${obj.summary}`);
  }
  
  if (obj.skills) {
    parts.push(`## Skills\n\n${obj.skills}`);
  }
  
  const formatDisplayDateLocal = (dateStr) => {
    if (!dateStr) return "";
    const dateParts = dateStr.split("-");
    if (dateParts.length >= 2) {
      const year = dateParts[0];
      const monthIndex = parseInt(dateParts[1], 10) - 1;
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      if (monthIndex >= 0 && monthIndex < 12) {
        return `${months[monthIndex]} ${year}`;
      }
    }
    return dateStr;
  };

  const entriesToMarkdownLocal = (entries, type) => {
    if (!entries?.length) return "";
    return (
      `## ${type}\n\n` +
      entries
        .map((entry) => {
          const org = entry.organization || entry.company || entry.school || "";
          const title = entry.title || entry.degree || "";
          const start = formatDisplayDateLocal(entry.startDate);
          const end = entry.current ? "Present" : formatDisplayDateLocal(entry.endDate);
          const dateRange = start && end ? `${start} - ${end}` : (start || end || "");
          const dateSpan = dateRange ? ` | ${dateRange}` : "";

          return `### ${title}${org ? ` | ${org}` : ""}${dateSpan}\n\n${entry.description || ""}`;
        })
        .join("\n\n")
    );
  };

  if (Array.isArray(obj.experience)) {
    const expMD = entriesToMarkdownLocal(obj.experience, "Work Experience");
    if (expMD) parts.push(expMD);
  }
  
  if (Array.isArray(obj.education)) {
    const eduMD = entriesToMarkdownLocal(obj.education, "Education");
    if (eduMD) parts.push(eduMD);
  }
  
  if (Array.isArray(obj.projects)) {
    const projMD = entriesToMarkdownLocal(obj.projects, "Projects");
    if (projMD) parts.push(projMD);
  }
  
  return parts.join("\n\n");
}

