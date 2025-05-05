import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  promptDir: './prompts', // Genkit prompt files, if any
  plugins: [
    googleAI({
      // Ensure GOOGLE_GENAI_API_KEY is set in your environment variables
      // This key should NOT be exposed client-side.
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
    }),
  ],
  // Define default model if needed, or specify in each flow/prompt
  model: 'googleai/gemini-2.0-flash',
  logLevel: 'debug', // Optional: Set log level for development
  enableTracing: true, // Optional: Enable tracing for debugging
});
