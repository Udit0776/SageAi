import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "sage-ai",
  name: "Sage AI",
  description: "AI-powered life guidance",
  credentials: {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
    },
  },
});
