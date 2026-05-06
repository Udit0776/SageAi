import { GoogleGenerativeAI } from "@google/generative-ai";

// Collect all available API keys
const API_KEYS = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean); // Remove any undefined keys

if (API_KEYS.length === 0) {
  throw new Error("No GEMINI_API_KEY is set in environment variables");
}

// Models to try, in priority order
const MODEL_NAMES = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];

// Helper to delay execution (exponential backoff)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Centralized AI response function with multi-key + multi-model fallback.
 * 
 * Strategy:
 *   For each API key → For each model → Retry up to maxRetries times.
 *   If a key is quota-exhausted (429 on all models), move to the next key.
 *   If a model is unavailable (503), retry with backoff, then try next model.
 * 
 * @param {string} prompt - The text prompt to send to Gemini.
 * @param {object} [options] - Optional configuration.
 * @param {string} [options.pdfData] - Base64-encoded PDF data for multimodal requests.
 * @returns {Promise<string>} The AI response text.
 */
export async function getAIResponse(prompt, options = {}) {
  const { pdfData } = options;
  const maxRetries = 3;
  let lastError = "All AI models failed to respond.";

  for (let keyIndex = 0; keyIndex < API_KEYS.length; keyIndex++) {
    const apiKey = API_KEYS[keyIndex];
    const genAI = new GoogleGenerativeAI(apiKey);
    let keyQuotaHits = 0; // Track how many models hit 429 on this key

    for (const modelName of MODEL_NAMES) {
      const model = genAI.getGenerativeModel({ model: modelName });
      let modelFailed429 = false;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(
            `[Key ${keyIndex + 1}/${API_KEYS.length}] Trying ${modelName} (attempt ${attempt}/${maxRetries})...`
          );

          let result;
          if (pdfData) {
            result = await model.generateContent([
              {
                inlineData: {
                  data: pdfData,
                  mimeType: "application/pdf",
                },
              },
              { text: prompt },
            ]);
          } else {
            result = await model.generateContent(prompt);
          }

          const response = result.response;
          return response.text();
        } catch (error) {
          const errorMsg = error.message || "";
          const is503 =
            errorMsg.includes("503") ||
            errorMsg.includes("Service Unavailable");
          const is429 =
            errorMsg.includes("429") ||
            errorMsg.includes("Too Many Requests") ||
            errorMsg.includes("quota");
          const is404 =
            errorMsg.includes("404") || errorMsg.includes("not found");

          // If model doesn't exist, skip to next model immediately
          if (is404) {
            console.warn(
              `[Key ${keyIndex + 1}] ${modelName} not found (404). Skipping model...`
            );
            break;
          }

          // If rate limited (per-minute), retry with backoff
          if ((is503 || is429) && attempt < maxRetries) {
            const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
            console.warn(
              `[Key ${keyIndex + 1}] ${modelName} returned ${is503 ? "503" : "429"}, retrying in ${waitTime / 1000}s...`
            );
            await delay(waitTime);
            continue;
          }

          // If still 429 after all retries, mark model as quota-exhausted
          if (is429) {
            modelFailed429 = true;
          }

          console.warn(
            `[Key ${keyIndex + 1}] ${modelName} failed after attempt ${attempt}: ${errorMsg}`
          );
          lastError = errorMsg;
          break; // Try next model
        }
      }

      if (modelFailed429) {
        keyQuotaHits++;
      }
    }

    // If ALL models on this key hit 429, switch to next key
    if (keyQuotaHits >= MODEL_NAMES.length) {
      console.warn(
        `[Key ${keyIndex + 1}] All models quota-exhausted. Switching to next API key...`
      );
      continue;
    }
  }

  throw new Error(
    "The AI service is temporarily unavailable. Please try again in a few minutes."
  );
}
