/**
 * Service client for the local Python NLP microservice.
 * All functions fail gracefully (returning null) if the service is offline.
 */

const NLP_SERVICE_URL = "http://localhost:8000";
const REQUEST_TIMEOUT_MS = 5000; // 5-second timeout for local NLP calls

/**
 * Computes semantic similarity (cosine similarity) between two text blocks.
 * 
 * @param {string} text1 - First text block (e.g. candidate resume)
 * @param {string} text2 - Second text block (e.g. target job description)
 * @returns {Promise<{score: number, interpretation: string, top_matching_pairs: Array<{sentence1: string, sentence2: string, similarity: number}>} | null>}
 */
export async function computeSemanticSimilarity(text1, text2) {
  if (!text1 || !text2) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const response = await fetch(`${NLP_SERVICE_URL}/semantic-similarity`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text1, text2 }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[NLP Client] Semantic similarity API returned status ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.warn(`[NLP Client] Failed to compute semantic similarity (service offline or timed out): ${error.message}`);
    return null;
  }
}

/**
 * Extracts technical and soft skills from a text block and structures them into categories.
 * 
 * @param {string} text - Text to analyze (e.g. job description or resume)
 * @returns {Promise<{skills: string[], categories: {languages: string[], frameworks: string[], databases: string[], cloud: string[], soft_skills: string[]}} | null>}
 */
export async function extractSkills(text) {
  if (!text) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const response = await fetch(`${NLP_SERVICE_URL}/extract-skills`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[NLP Client] Extract skills API returned status ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.warn(`[NLP Client] Failed to extract skills (service offline or timed out): ${error.message}`);
    return null;
  }
}
