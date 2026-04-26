import { serve } from "inngest/next";
import { helloWorld } from "@/lib/inngest/function";
import { inngest } from "@/lib/inngest/client";

// create a api that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    helloWorld, // Add all your functions here
  ],
});

console.log("Inngest route initialized with functions:", [helloWorld.id]);
