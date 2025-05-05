// This file is used by `genkit start` for local development and flow inspection.
// It should import all the flows you want to make available during development.

// Load environment variables if needed (e.g., from .env file)
// import dotenv from 'dotenv';
// dotenv.config();

import '@/server/ai/flows/summarize-request-context.ts';
import '@/server/ai/flows/improve-knowledge-base-entry.ts';
import '@/server/ai/flows/suggest-answer.ts';
