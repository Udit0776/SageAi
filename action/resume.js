"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getAIResponse } from "@/lib/gemini";
import { extractText, getDocumentProxy } from "unpdf";
import { registerUserActivity } from "./streak";
import { computeSemanticSimilarity, extractSkills } from "@/lib/nlp";
import { computeATSScore, getPlainTextFromResume } from "@/lib/ats-scorer";
import { extractCanonicalSkills } from "@/lib/skill-taxonomy";

function cleanGarbledText(text) {
  if (typeof text !== "string") return text;
  return text
    .replace(/â€¢/g, "•")
    .replace(/\u00e2\u20ac\u00a2/g, "•")
    .replace(/â\x80\xa2/g, "•")
    .replace(/â\x80\x93/g, "–")
    .replace(/â\x80\x94/g, "—")
    .replace(/â\x80\x99/g, "’")
    .replace(/â\x80\x98/g, "‘")
    .replace(/â\x80\x9c/g, "“")
    .replace(/â\x80\x9d/g, "”")
    .replace(/â€“/g, "–")
    .replace(/â€”/g, "—")
    .replace(/â€™/g, "’")
    .replace(/â€˜/g, "‘")
    .replace(/â€œ/g, "“")
    .replace(/â€/g, "”");
}

export async function saveResume(content) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  const cleanedContent = cleanGarbledText(content);

  try {
    const resume = await db.resume.upsert({
      where: { userId: user.id },
      update: { content: cleanedContent },
      create: { userId: user.id, content: cleanedContent },
    });

    try {
      await registerUserActivity();
    } catch (streakError) {
      console.error("Failed to register streak activity:", streakError);
    }

    revalidatePath("/resume");
    return resume;
  } catch (error) {
    console.error("Error in saving resume:", error.message);
    throw new Error("Failed to save resume");
  }
}

export async function getResume() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  try {
    const resume = await db.resume.findUnique({
      where: { userId: user.id },
    });
    if (!resume) return null;

    const cleanedContent = cleanGarbledText(resume.content);

    const industryInsight = user.industry
      ? await db.industryInsight.findUnique({
          where: { industry: user.industry },
        })
      : null;

    return {
      ...resume,
      content: cleanedContent,
      user: {
        industry: user.industry,
        industryInsight,
      },
    };
  } catch (error) {
    console.error("Error fetching resume:", error.message);
    throw new Error("Failed to fetch resume");
  }
}

export async function improveWithAI({ current, type }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  const prompt = `
    As an expert resume writer, improve the following ${type} description for a ${user.industry} professional.
    Make it more impactful, quantifiable, and aligned with industry standards.
    Current content: "${current}"

    Requirements:
    1. Use action verbs
    2. Include metrics and results where possible
    3. Highlight relevant technical skills
    4. Keep it concise but detailed
    5. Focus on achievements over responsibilities
    6. Use industry-specific keywords
    
    Format the response as a single paragraph without any additional text or explanations.
  `;

  try {
    const text = await getAIResponse(prompt);
    const cleanedText = text.replace(/```(?:[a-z]+)?\n?|\n?```/gi, "").trim();
    return cleanGarbledText(cleanedText);
  } catch (error) {
    console.error("Error improving with AI:", error);
    throw new Error(error.message || "Failed to improve content with AI");
  }
}

export async function parsePDFResume(formData) {
  const file = formData.get("file");
  if (!file) throw new Error("No file provided");

  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");

  try {
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await extractText(pdf, { mergePages: true });
    return { base64, text: cleanGarbledText(text) };
  } catch (error) {
    console.error("Unpdf extraction failed, falling back to multimodal:", error);
    return { base64, text: null };
  }
}

export async function extractResumeFromPDF(data) {
  const { base64, text: extractedText } = data;
  const cleanedText = cleanGarbledText(extractedText);
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const prompt = `
    You are an expert resume parser. I have provided a ${cleanedText ? "text version" : "PDF"} of a resume.
    Extract the following information and structure it into a JSON object:
    {
      "contactInfo": {
        "email": "",
        "mobile": "",
        "linkedin": "",
        "twitter": ""
      },
      "summary": "...",
      "skills": "...",
      "experience": [
        { "title": "", "organization": "", "startDate": "", "endDate": "", "description": "", "current": false }
      ],
      "education": [
        { "title": "", "organization": "", "startDate": "", "endDate": "", "description": "", "current": false }
      ],
      "projects": [
        { "title": "", "link": "", "description": "" }
      ]
    }

    Rules:
    - Extract as much information as possible accurately.
    - If a field is not found, leave it as an empty string or empty array.
    - Format dates consistently (e.g., YYYY-MM).
    - Return ONLY the JSON object. No markdown formatting.
  `;

  try {
    const aiResponse = cleanedText 
      ? await getAIResponse(`${prompt}\n\nResume Content:\n${cleanedText}`)
      : await getAIResponse(prompt, { pdfData: base64 });

    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI response did not contain valid JSON");
    }
    const parsed = JSON.parse(jsonMatch[0]);
    const cleanObject = (obj) => {
      if (typeof obj === "string") return cleanGarbledText(obj);
      if (Array.isArray(obj)) return obj.map(cleanObject);
      if (obj !== null && typeof obj === "object") {
        const res = {};
        for (const k in obj) {
          res[k] = cleanObject(obj[k]);
        }
        return res;
      }
      return obj;
    };
    return cleanObject(parsed);
  } catch (error) {
    console.error("Error extracting resume:", error);
    throw new Error(error.message || "Failed to extract resume from PDF");
  }
}

function extractKeywords(text) {
  if (!text) return new Set();
  const stopwords = new Set([
    "the", "and", "a", "to", "of", "for", "in", "on", "with", "at", "by", "an", "is", "are", 
    "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "but", 
    "if", "or", "because", "as", "until", "while", "about", "into", "through", "during", 
    "before", "after", "above", "below", "from", "up", "down", "out", "off", "over", "under", 
    "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", 
    "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", 
    "nor", "not", "only", "own", "same", "so", "than", "too", "very", "can", "will", "just", 
    "should", "now", "that", "this", "these", "those", "their", "them", "they", "our", "your", 
    "its", "been", "have", "has", "had", "would", "could", "should", "isn", "aren", "wasn", 
    "weren", "hasn", "haven", "hadn", "doesn", "don", "shouldn", "wouldn", "couldn", "mustn"
  ]);

  const cleanText = text.toLowerCase();
  const words = cleanText.split(/[^a-z0-9]+/i);
  
  const tokens = new Set();
  for (const word of words) {
    if (word.length >= 3 && !stopwords.has(word)) {
      tokens.add(word);
    }
  }
  return tokens;
}

function computeKeywordMatchScore(resumeText, jdText) {
  if (!jdText || jdText.trim().length === 0) {
    return { matchScore: 0, matchingKeywords: [], missingKeywords: [] };
  }

  const jdSkills = extractCanonicalSkills(jdText);
  const resumeSkills = extractCanonicalSkills(resumeText);

  if (jdSkills.size === 0) {
    // Fallback to generic keyword token extraction if no taxonomy skills are in the JD
    const resumeKeywords = extractKeywords(resumeText);
    const jdKeywords = extractKeywords(jdText);
    
    if (jdKeywords.size === 0) {
      return { matchScore: 0, matchingKeywords: [], missingKeywords: [] };
    }
    
    const matching = [];
    const missing = [];
    
    for (const keyword of jdKeywords) {
      if (resumeKeywords.has(keyword)) {
        matching.push(keyword);
      } else {
        missing.push(keyword);
      }
    }
    
    const matchScore = Math.round((matching.length / jdKeywords.size) * 100);
    
    return {
      matchScore,
      matchingKeywords: matching,
      missingKeywords: missing
    };
  }

  const matching = [];
  const missing = [];

  for (const skill of jdSkills) {
    if (resumeSkills.has(skill)) {
      matching.push(skill);
    } else {
      missing.push(skill);
    }
  }

  const matchScore = Math.round((matching.length / jdSkills.size) * 100);

  return {
    matchScore,
    matchingKeywords: matching,
    missingKeywords: missing
  };
}


export async function tailorResumeWithAI({ currentResume, jobDescription }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const resumeText = getPlainTextFromResume(currentResume);
  const cleanedJD = cleanGarbledText(jobDescription);
  const keywordResult = computeKeywordMatchScore(resumeText, cleanedJD);

  // Invoke NLP microservice endpoints concurrently
  const [semanticResult, resumeSkillsResult, jdSkillsResult] = await Promise.all([
    computeSemanticSimilarity(resumeText, cleanedJD),
    extractSkills(resumeText),
    extractSkills(cleanedJD)
  ]);

  const semanticScore = semanticResult ? semanticResult.score : null;
  const semanticInterpretation = semanticResult ? semanticResult.interpretation : null;
  const topPairs = semanticResult ? semanticResult.top_matching_pairs : [];

  const presentSkills = resumeSkillsResult ? resumeSkillsResult.skills : [];
  const requiredSkills = jdSkillsResult ? jdSkillsResult.skills : [];

  // Compute skillGap as required skills missing from the resume (case-insensitive)
  const resumeSkillsSet = new Set(presentSkills.map(s => s.toLowerCase().trim()));
  const skillGap = requiredSkills.filter(s => !resumeSkillsSet.has(s.toLowerCase().trim()));

  const prompt = `
    You are an expert ATS optimizer and career strategist. 
    
    Candidate Resume: """${currentResume}"""
    Target Job Description: """${cleanedJD}"""

    We did some advanced pre-processing analyses:
    
    1. Deterministic Keyword Match:
       - Match Score: ${keywordResult.matchScore}%
       - Matching Keywords: ${JSON.stringify(keywordResult.matchingKeywords)}
       - Missing Keywords: ${JSON.stringify(keywordResult.missingKeywords)}
       
    2. Semantic Similarity (via Sentence-Transformers):
       - Cosine Similarity Score: ${semanticScore !== null ? (semanticScore * 100).toFixed(0) + '%' : 'N/A'}
       - Interpretation: ${semanticInterpretation || 'N/A'}
       - Top matching sentence pairs: ${JSON.stringify(topPairs)}
       
    3. Skills Gap Analysis:
       - Required Skills (from Job Description): ${JSON.stringify(requiredSkills)}
       - Present Skills (from Resume): ${JSON.stringify(presentSkills)}
       - Skill Gap (Missing required skills): ${JSON.stringify(skillGap)}

    Requirements:
    1. Calculate a contextual "AI Match Score" (0-100) based on how well the candidate's actual experience and projects map to the job requirements (not just literal keyword match).
    2. Provide a concise explanation (aiExplanation) comparing all these metrics: the deterministic keyword match score (${keywordResult.matchScore}%), the semantic similarity score (${semanticScore !== null ? (semanticScore * 100).toFixed(0) + '%' : 'N/A'}), and your contextual score. Explain why there is a gap (if any).
    3. Rewrite the resume (in the same JSON structure) to better match the job description. In the rewritten resume, specifically address the missing keywords (${JSON.stringify(keywordResult.missingKeywords)}) and missing skills (${JSON.stringify(skillGap)}) where appropriate to help the candidate rank higher in ATS checks and semantic search engines.
    
    Return strictly as JSON in the following format:
    {
      "aiMatchScore": number,
      "aiExplanation": "string (brief 1-2 sentence comparison and gap analysis)",
      "tailoredResume": { ...same structure as candidate resume... }
    }
  `;

  try {
    const text = await getAIResponse(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI response did not contain valid JSON");
    }
    const parsedResult = JSON.parse(jsonMatch[0]);
    const cleanObject = (obj) => {
      if (typeof obj === "string") return cleanGarbledText(obj);
      if (Array.isArray(obj)) return obj.map(cleanObject);
      if (obj !== null && typeof obj === "object") {
        const res = {};
        for (const k in obj) {
          res[k] = cleanObject(obj[k]);
        }
        return res;
      }
      return obj;
    };
    return {
      keywordMatchScore: keywordResult.matchScore,
      matchingKeywords: keywordResult.matchingKeywords,
      missingKeywords: keywordResult.missingKeywords,
      semanticSimilarityScore: semanticScore !== null ? Math.round(semanticScore * 100) : null,
      aiMatchScore: parsedResult.aiMatchScore,
      semanticInterpretation: semanticInterpretation,
      topMatchingPairs: topPairs,
      requiredSkills: requiredSkills,
      presentSkills: presentSkills,
      skillGap: skillGap,
      aiExplanation: cleanGarbledText(parsedResult.aiExplanation),
      tailoredResume: cleanObject(parsedResult.tailoredResume)
    };
  } catch (error) {
    console.error("Error tailoring resume:", error);
    throw new Error(error.message || "Failed to tailor resume with AI");
  }
}

export async function parseMarkdownResume(markdownText) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  const cleanedMarkdown = cleanGarbledText(markdownText);

  const prompt = `
    You are an expert resume parser. I have provided a Markdown version of a resume.
    Extract the information and structure it into a JSON object matching this schema:
    {
      "contactInfo": {
        "email": "",
        "mobile": "",
        "linkedin": "",
        "twitter": ""
      },
      "summary": "...",
      "skills": "...",
      "experience": [
        { "title": "", "organization": "", "startDate": "", "endDate": "", "description": "", "current": false }
      ],
      "education": [
        { "title": "", "organization": "", "startDate": "", "endDate": "", "description": "", "current": false }
      ],
      "projects": [
        { "title": "", "link": "", "description": "" }
      ]
    }

    Rules:
    - Extract all fields accurately from the Markdown text.
    - If a field is not found, leave it as an empty string or empty array.
    - Format dates consistently as YYYY-MM (e.g., "2026-12" or "2022-05"). If it's a month name like "Dec 2026", convert it to YYYY-MM (e.g., "2026-12").
    - Return ONLY the JSON object. No markdown formatting.
  `;

  try {
    const aiResponse = await getAIResponse(`${prompt}\n\nResume Markdown:\n${cleanedMarkdown}`);
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI response did not contain valid JSON");
    }
    const parsed = JSON.parse(jsonMatch[0]);
    const cleanObject = (obj) => {
      if (typeof obj === "string") return cleanGarbledText(obj);
      if (Array.isArray(obj)) return obj.map(cleanObject);
      if (obj !== null && typeof obj === "object") {
        const res = {};
        for (const k in obj) {
          res[k] = cleanObject(obj[k]);
        }
        return res;
      }
      return obj;
    };
    return cleanObject(parsed);
  } catch (error) {
    console.error("Error parsing Markdown resume:", error);
    throw new Error("Failed to parse Markdown resume content");
  }
}

export async function analyzeResumeATS(jdText) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: { 
      resume: true,
      industryInsight: true
    }
  });
  if (!user) throw new Error("User not found");
  if (!user.resume) throw new Error("Resume not found");

  const resumeText = getPlainTextFromResume(user.resume.content);
  
  let options = {};
  if (!jdText || jdText.trim().length === 0) {
    options.isGeneralStructuralOnly = true;
  }

  const breakdown = computeATSScore(resumeText, jdText || "", options);

  const prompt = `
    You are an expert resume reviewer and ATS optimizer.
    We have analyzed the candidate's resume against a target job description and computed a deterministic ATS score breakdown.
    
    ATS Score: ${breakdown.totalScore}/100 (Grade: ${breakdown.grade})
    Scan Mode: ${breakdown.scanMode} (either 'targeted', 'industry', or 'structural')
    Score Breakdown:
    - Section Detection: ${breakdown.breakdown.section}/${breakdown.scanMode === 'structural' ? 35 : 25}
    - Keyword Match: ${breakdown.breakdown.keyword}/${breakdown.scanMode === 'structural' ? 0 : 35}
    - Action Verbs: ${breakdown.breakdown.actionVerb}/${breakdown.scanMode === 'structural' ? 30 : 20}
    - Formatting Score: ${breakdown.breakdown.formatting}/${breakdown.scanMode === 'structural' ? 35 : 20}
    
    Found Sections: ${JSON.stringify(breakdown.foundSections)}
    Missing Sections: ${JSON.stringify(breakdown.missingSections)}
    Matched Keywords: ${JSON.stringify(breakdown.matchedKeywords)}
    Missing Keywords: ${JSON.stringify(breakdown.missingKeywords)}
    Weak Bullets: ${JSON.stringify(breakdown.weakBullets)}
    Formatting Penalties: ${JSON.stringify(breakdown.penalties)}
    
    Your task: Generate qualitative, constructive, and highly actionable improvement suggestions based ONLY on the computed breakdown above.
    Do NOT generate your own score or contradict the computed breakdown.
    Explain why missing items are important, how to improve weak bullet points with action verbs, and how to resolve formatting warnings.
    
    Format the response as clean Markdown with bullet points and clear sections.
  `;

  let aiFeedback = "";
  try {
    aiFeedback = await getAIResponse(prompt);
  } catch (error) {
    console.error("Gemini failed, using fallback qualitative feedback:", error);
    aiFeedback = "Failed to load AI suggestions. Please try again later.";
  }

  await db.resume.update({
    where: { id: user.resume.id },
    data: {
      atsScore: breakdown.totalScore,
      feedback: aiFeedback,
      targetJobDescription: jdText || null
    }
  });

  revalidatePath("/resume");

  return {
    ...breakdown,
    aiFeedback
  };
}

