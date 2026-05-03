import { serve } from "inngest/next";
import { generateIndustryInsights } from "@/lib/inngest/function";
import { inngest } from "@/lib/inngest/client";

// create a api that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateIndustryInsights],
});

// console.log("Inngest route initialized with functions:", [
//   generateIndustryInsights.id,
// ]);
