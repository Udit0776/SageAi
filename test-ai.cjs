const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

function loadEnv() {
  const envPath = path.join(__dirname, ".env");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    content.split("\n").forEach(line => {
      const [key, ...valueParts] = line.split("=");
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join("=").trim().replace(/(^"|"$)/g, '');
      }
    });
  }
}

async function test() {
  loadEnv();
  if (!process.env.GEMINI_API_KEY) {
    console.error("No GEMINI_API_KEY found in environment.");
    process.exit(1);
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  const modelNames = [
    "gemini-2.5-flash",
    "gemini-2.0-flash", 
    "gemini-2.5-flash-lite", 
    "gemini-1.5-flash"
  ];
  
  for (const modelName of modelNames) {
    console.log(`Testing model: ${modelName}...`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Hello! Please reply with just 'OK'.");
      console.log(`✅ ${modelName} is WORKING. Response: ${result.response.text().trim()}`);
    } catch (e) {
      console.log(`❌ ${modelName} failed: ${e.message}`);
    }
  }
}

test();
