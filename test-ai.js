import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: ".env.local" });

async function test() {
  if (!process.env.GEMINI_API_KEY) {
    console.error("No GEMINI_API_KEY found in environment.");
    process.exit(1);
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // const modelNames = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
  const modelNames = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.5-flash-lite",
    "gemini-1.5-flash",
  ];
  for (const modelName of modelNames) {
    console.log(`Testing model: ${modelName}...`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(
        "Hello! Please reply with just 'OK'.",
      );
      console.log(
        `✅ ${modelName} is WORKING. Response: ${result.response.text()}`,
      );
    } catch (e) {
      console.log(`❌ ${modelName} failed: ${e.message}`);
    }
  }
}

test();
