'use server';

/**
 * @fileOverview This file defines a Genkit flow that suggests an answer to a customer's question based on available knowledge.
 *
 * - suggestAnswer - A function that takes a customer's question as input and returns a suggested answer.
 * - SuggestAnswerInput - The input type for the suggestAnswer function.
 * - SuggestAnswerOutput - The return type for the suggestAnswer function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SuggestAnswerInputSchema = z.object({
  question: z.string().describe('The customer\'s question.'),
});
export type SuggestAnswerInput = z.infer<typeof SuggestAnswerInputSchema>;

const SuggestAnswerOutputSchema = z.object({
  suggestedAnswer: z.string().describe('The suggested answer to the question.'),
});
export type SuggestAnswerOutput = z.infer<typeof SuggestAnswerOutputSchema>;

export async function suggestAnswer(input: SuggestAnswerInput): Promise<SuggestAnswerOutput> {
  return suggestAnswerFlow(input);
}

const suggestAnswerPrompt = ai.definePrompt({
  name: 'suggestAnswerPrompt',
  input: {
    schema: z.object({
      question: z.string().describe('The customer\'s question.'),
    }),
  },
  output: {
    schema: z.object({
      suggestedAnswer: z.string().describe('The suggested answer to the question.'),
    }),
  },
  prompt: `You are an AI assistant helping a human supervisor answer customer questions.\n\nGiven the following customer question:\n\n{{question}}\n\nSuggest a possible answer, taking into account your existing knowledge base.\n\nSuggested Answer: `,
});

const suggestAnswerFlow = ai.defineFlow<
  typeof SuggestAnswerInputSchema,
  typeof SuggestAnswerOutputSchema
>({
  name: 'suggestAnswerFlow',
  inputSchema: SuggestAnswerInputSchema,
  outputSchema: SuggestAnswerOutputSchema,
},
async input => {
  const {output} = await suggestAnswerPrompt(input);
  return output!;
});
