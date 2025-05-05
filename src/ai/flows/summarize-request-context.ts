'use server';

/**
 * @fileOverview Summarizes the context of a customer's request for a supervisor.
 *
 * - summarizeRequestContext - A function that summarizes the request context.
 * - SummarizeRequestContextInput - The input type for the summarizeRequestContext function.
 * - SummarizeRequestContextOutput - The return type for the summarizeRequestContext function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SummarizeRequestContextInputSchema = z.object({
  question: z.string().describe('The customer\u0027s question.'),
  callerId: z.string().describe('The caller\u0027s phone number.'),
});
export type SummarizeRequestContextInput = z.infer<typeof SummarizeRequestContextInputSchema>;

const SummarizeRequestContextOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the customer\u0027s request context.'),
});
export type SummarizeRequestContextOutput = z.infer<typeof SummarizeRequestContextOutputSchema>;

export async function summarizeRequestContext(input: SummarizeRequestContextInput): Promise<SummarizeRequestContextOutput> {
  return summarizeRequestContextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeRequestContextPrompt',
  input: {
    schema: z.object({
      question: z.string().describe('The customer\u0027s question.'),
      callerId: z.string().describe('The caller\u0027s phone number.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A concise summary of the customer\u0027s request context.'),
    }),
  },
  prompt: `You are an AI assistant summarizing customer requests for a human supervisor.
  Summarize the following customer question and include the caller id, in 1-2 sentences:
  Question: {{{question}}}
  Caller ID: {{{callerId}}}`,
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
  return output!;
});
