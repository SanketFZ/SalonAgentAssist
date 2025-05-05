'use server';

/**
 * @fileOverview Summarizes the context of a customer's request for a supervisor.
 *
 * - summarizeRequestContext - A function that summarizes the request context.
 * - SummarizeRequestContextInput - The input type for the summarizeRequestContext function.
 * - SummarizeRequestContextOutput - The return type for the summarizeRequestContext function.
 */

import {ai} from '@/server/ai/ai-instance'; // Adjust import path
import {z} from 'genkit';

const SummarizeRequestContextInputSchema = z.object({
  question: z.string().describe('The customer\'s question.'),
  callerId: z.string().describe('The caller\'s phone number or identifier.'),
});
export type SummarizeRequestContextInput = z.infer<typeof SummarizeRequestContextInputSchema>;

const SummarizeRequestContextOutputSchema = z.object({
  summary: z.string().describe('A concise summary (1-2 sentences) of the customer\'s request context, including the core question and caller ID.'),
});
export type SummarizeRequestContextOutput = z.infer<typeof SummarizeRequestContextOutputSchema>;

export async function summarizeRequestContext(input: SummarizeRequestContextInput): Promise<SummarizeRequestContextOutput> {
  return summarizeRequestContextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeRequestContextPrompt',
  input: {
    schema: z.object({
      question: z.string().describe('The customer\'s question.'),
      callerId: z.string().describe('The caller\'s phone number or identifier.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A concise summary (1-2 sentences) of the customer\'s request context, including the core question and caller ID.'),
    }),
  },
  prompt: `You are an AI assistant tasked with summarizing incoming customer support requests for a human supervisor.
Provide a concise (1-2 sentences) summary that captures the essence of the customer's question and includes their identifier.

Customer Identifier: {{{callerId}}}
Customer Question:
\`\`\`
{{{question}}}
\`\`\`

Summary:`,
});

const summarizeRequestContextFlow = ai.defineFlow<
  typeof SummarizeRequestContextInputSchema,
  typeof SummarizeRequestContextOutputSchema
>({
  name: 'summarizeRequestContextFlow',
  inputSchema: SummarizeRequestContextInputSchema,
  outputSchema: SummarizeRequestContextOutputSchema,
}, async input => {
  const {output} = await prompt(input);
    if (!output) {
      throw new Error("Failed to generate request context summary.");
    }
  return output;
});
