// src/server/ai/index.ts
"use server"; // Indicate server-side module

// Export the configured Genkit AI instance (`ai`)
export * from './ai-instance';

// Export all defined AI flows via the flows' index file
export * from './flows';

// Do NOT typically export './dev' as it's specific to the Genkit development server.

// Add exports for any other AI-related modules if structured separately,
// e.g., reusable tools or prompt definitions not tied to a specific flow.
// Example: export * from './tools';