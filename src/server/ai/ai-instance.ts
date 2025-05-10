
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const googleApiKey = process.env.GOOGLE_GENAI_API_KEY;

if (!googleApiKey) {
  console.error("**************************************************************************************");
  console.error("ERROR: GOOGLE_GENAI_API_KEY is not set in your environment variables.");
  console.error("Genkit AI functionalities will likely fail. Please set this variable in your .env file.");
  console.error("Refer to Firebase or Google Cloud console to obtain your API key for Generative AI.");
  console.error("**************************************************************************************");
  // The googleAI plugin itself will likely throw an error if the key is missing when an API call is made.
  // This log is to provide an earlier, more direct warning to the developer.
}

// This 'ai' object is a configuration instance for Genkit.
// It is used by other server-side modules (flows) that are marked with 'use server'.
// This file itself does not need to be marked 'use server' as it doesn't directly export Server Actions.
export const ai = genkit({
  promptDir: './prompts', // Genkit prompt files, if any
  plugins: [
    googleAI({
      // Pass the apiKey. The plugin should handle cases where it's undefined or invalid.
      apiKey: googleApiKey,
    }),
  ],
  // Define default model if needed, or specify in each flow/prompt
  model: 'googleai/gemini-2.0-flash', // Default model for Genkit instance
  logLevel: 'debug', // Optional: Set log level for development
  enableTracing: true, // Optional: Enable tracing for debugging
});

