import { GoogleGenerativeAI } from "@google/generative-ai";

// Collect all available API keys
const API_KEYS = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean); // Remove any undefined keys

// Groq API keys
const GROQ_KEYS = [
  process.env.GROQ_API_KEY_1,
  process.env.GROQ_API_KEY_2,
].filter(Boolean);

// Models to try, in priority order
const MODEL_NAMES = [
  "gemini-3.5-flash",
  "gemini-3.1-pro-preview",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash",
];

// Helper to delay execution (exponential backoff)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to wrap a promise in a timeout
const requestWithTimeout = (promise, ms) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("Request Timeout")), ms))
  ]);
};

/**
 * Execute the cascading AI request logic across Gemini and Groq models.
 */
async function runGeminiCascade(prompt, options) {
  const { pdfData } = options;
  if (API_KEYS.length === 0) {
    throw new Error("No Gemini API keys configured.");
  }

  let lastError = "Gemini models failed.";

  for (let keyIndex = 0; keyIndex < API_KEYS.length; keyIndex++) {
    const apiKey = API_KEYS[keyIndex];
    const genAI = new GoogleGenerativeAI(apiKey);
    let keyQuotaHits = 0;

    for (const modelName of MODEL_NAMES) {
      const modelOptions = { model: modelName };
      if (options.useSearch) {
        modelOptions.tools = [{ googleSearch: {} }];
      }
      const model = genAI.getGenerativeModel(modelOptions);
      let modelFailed429 = false;

      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          console.log(
            `[Key ${keyIndex + 1}/${API_KEYS.length}] Trying ${modelName} (attempt ${attempt}/2)...`,
          );

          let result;
          const apiCall = pdfData
            ? model.generateContent([
                {
                  inlineData: {
                    data: pdfData,
                    mimeType: "application/pdf",
                  },
                },
                { text: prompt },
              ])
            : model.generateContent(prompt);

          result = await requestWithTimeout(apiCall, 8000);

          const response = result.response;
          return response.text();
        } catch (error) {
          const errorMsg = error.message || "";
          const isTimeout = errorMsg.includes("Request Timeout");
          const is503 =
            errorMsg.includes("503") ||
            errorMsg.includes("Service Unavailable");
          const is500 =
            errorMsg.includes("500") ||
            errorMsg.includes("Internal Server Error") ||
            errorMsg.includes("Internal error");
          const is429 =
            errorMsg.includes("429") ||
            errorMsg.includes("Too Many Requests") ||
            errorMsg.includes("quota");
          const is404 =
            errorMsg.includes("404") || errorMsg.includes("not found");

          lastError = errorMsg;

          if (isTimeout) {
            console.warn(
              `[Key ${keyIndex + 1}] ${modelName} request timed out (>8s). Skipping model...`,
            );
            break;
          }

          if (is404) {
            console.warn(
              `[Key ${keyIndex + 1}] ${modelName} not found (404). Skipping model...`,
            );
            break;
          }

          if (is429) {
            console.warn(
              `[Key ${keyIndex + 1}] ${modelName} returned 429 (quota exceeded). Skipping model immediately...`,
            );
            modelFailed429 = true;
            break;
          }

          if ((is503 || is500) && attempt === 1) {
            console.warn(
              `[Key ${keyIndex + 1}] ${modelName} returned transient error ${is503 ? "503" : "500"}. Retrying in 1s...`,
            );
            await delay(1000);
            continue;
          }

          console.warn(
            `[Key ${keyIndex + 1}] ${modelName} failed on attempt ${attempt}: ${errorMsg}`,
          );
          break;
        }
      }

      if (modelFailed429) {
        keyQuotaHits++;
      }
    }

    if (keyQuotaHits >= MODEL_NAMES.length) {
      console.warn(
        `[Key ${keyIndex + 1}] All models quota-exhausted. Switching to next API key...`,
      );
      continue;
    }
  }

  throw new Error(lastError);
}

async function runGroqCascade(prompt, options) {
  if (GROQ_KEYS.length === 0) {
    throw new Error("No Groq API keys configured.");
  }

  let lastError = "Groq models failed.";

  console.log("Trying Groq cascade...");
  for (let gKeyIndex = 0; gKeyIndex < GROQ_KEYS.length; gKeyIndex++) {
    const groqKey = GROQ_KEYS[gKeyIndex];

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(
          `[Groq Key ${gKeyIndex + 1}/${GROQ_KEYS.length}] Trying llama-3.3-70b-versatile (attempt ${attempt}/2)...`,
        );

        const fetchCall = fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${groqKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }]
          })
        });

        const response = await requestWithTimeout(fetchCall, 8000);

        if (!response.ok) {
          const status = response.status;
          const errorText = await response.text();
          const errorMsg = `Groq API returned status ${status}: ${errorText}`;
          lastError = errorMsg;

          if (status === 404) {
            console.warn(`[Groq Key ${gKeyIndex + 1}] Model not found (404).`);
            break;
          }

          if (status === 429) {
            console.warn(`[Groq Key ${gKeyIndex + 1}] Groq returned 429 (quota exceeded). Skipping key...`);
            break;
          }

          if ((status === 500 || status === 503) && attempt === 1) {
            console.warn(`[Groq Key ${gKeyIndex + 1}] Groq returned transient error ${status}. Retrying in 1s...`);
            await delay(1000);
            continue;
          }

          console.warn(`[Groq Key ${gKeyIndex + 1}] Groq request failed: ${errorMsg}`);
          break;
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) {
          return text;
        }
        throw new Error("Invalid response structure from Groq");
      } catch (error) {
        const errorMsg = error.message || "";
        lastError = errorMsg;
        console.warn(`[Groq Key ${gKeyIndex + 1}] Error: ${errorMsg}`);

        if (errorMsg.includes("Request Timeout")) {
          console.warn(`[Groq Key ${gKeyIndex + 1}] Groq request timed out (>8s). Skipping key...`);
          break;
        }
        
        if (attempt === 1) {
          await delay(1000);
          continue;
        }
        break;
      }
    }
  }

  throw new Error(lastError);
}

/**
 * Execute the cascading AI request logic across Gemini and Groq models.
 */
async function executeCascade(prompt, options) {
  const { pdfData } = options;
  let lastError = "All AI models failed to respond.";

  // Determine if this request requires Gemini features
  const requiresGemini = !!pdfData || !!options.useSearch;

  if (requiresGemini) {
    // Gemini First, then Groq fallback (if applicable)
    try {
      return await runGeminiCascade(prompt, options);
    } catch (geminiError) {
      lastError = geminiError.message;
      if (!pdfData) { // Groq can handle text-only requests if Gemini fails
        try {
          return await runGroqCascade(prompt, options);
        } catch (groqError) {
          lastError = groqError.message;
        }
      }
    }
  } else {
    // Groq First, then Gemini fallback
    try {
      return await runGroqCascade(prompt, options);
    } catch (groqError) {
      lastError = groqError.message;
      try {
        return await runGeminiCascade(prompt, options);
      } catch (geminiError) {
        lastError = geminiError.message;
      }
    }
  }

  throw new Error(`The AI service is temporarily unavailable. Details: ${lastError}`);
}

/**
 * Centralized AI response function with multi-key + multi-model fallback and global timeout.
 *
 * @param {string} prompt - The text prompt to send to AI.
 * @param {object} [options] - Optional configuration.
 * @param {string} [options.pdfData] - Base64-encoded PDF data for multimodal requests.
 * @returns {Promise<string>} The AI response text.
 */
export async function getAIResponse(prompt, options = {}) {
  // Global 30-second timeout (A4 JSON generations take more time)
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("AI is busy")), 30000)
  );

  return Promise.race([
    executeCascade(prompt, options),
    timeoutPromise
  ]);
}
