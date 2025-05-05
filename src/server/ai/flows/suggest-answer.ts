'use server';

/**
 * @fileOverview This file defines a Genkit flow that suggests an answer to a customer's question based on available knowledge.
 *
 * - suggestAnswer - A function that takes a customer's question as input and returns a suggested answer.
 * - SuggestAnswerInput - The input type for the suggestAnswer function.
 * - SuggestAnswerOutput - The return type for the suggestAnswer function.
 */

import {ai} from '@/server/ai/ai-instance'; // Adjust import path
import {z} from 'genkit';
import { getKnowledgeBaseEntries } from '@/server/lib/db'; // Import DB function to potentially fetch KB entries

// Define Tool (optional but good practice) to fetch relevant KB articles
const findRelevantKnowledgeTool = ai.defineTool(
    {
        name: 'findRelevantKnowledge',
        description: 'Searches the knowledge base for entries relevant to a given question.',
        inputSchema: z.object({
            searchQuery: z.string().describe('The question or topic to search for in the knowledge base.'),
        }),
        outputSchema: z.array(z.object({
            question: z.string(),
            answer: z.string(),
        })).describe('A list of relevant knowledge base entries (question/answer pairs).'),
    },
    async ({ searchQuery }) => {
        // Basic implementation: Get all entries and filter.
        // A more robust implementation would use vector search or keyword matching.
        console.log(`[Tool] Searching knowledge base for: "${searchQuery}"`);
        const allEntries = await getKnowledgeBaseEntries();
        // Simple filtering (case-insensitive)
        const relevantEntries = allEntries.filter(entry =>
            entry.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.answer.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 3); // Limit results
        console.log(`[Tool] Found ${relevantEntries.length} relevant entries.`);
        return relevantEntries.map(e => ({ question: e.question, answer: e.answer }));
    }
);


const SuggestAnswerInputSchema = z.object({
  question: z.string().describe('The customer\'s question.'),
});
export type SuggestAnswerInput = z.infer<typeof SuggestAnswerInputSchema>;

const SuggestAnswerOutputSchema = z.object({
  suggestedAnswer: z.string().describe('The suggested answer to the question, potentially synthesized from the knowledge base.'),
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
      // Optional: Allow passing context directly if already fetched
      // knowledgeContext: z.array(z.object({ question: z.string(), answer: z.string() })).optional().describe('Relevant knowledge base entries.'),
    }),
  },
  output: {
    schema: z.object({
      suggestedAnswer: z.string().describe('The suggested answer to the question, potentially synthesized from the knowledge base.'),
    }),
  },
  tools: [findRelevantKnowledgeTool], // Make the tool available
  prompt: `You are an AI assistant helping a human supervisor answer customer questions.
Your goal is to provide a helpful and accurate answer based on the provided customer question and potentially relevant information from the knowledge base.

Customer Question:
\`\`\`
{{{question}}}
\`\`\`

Instructions:
1. Analyze the customer's question.
2. If necessary, use the 'findRelevantKnowledge' tool to search the knowledge base for relevant information. Pass the customer's question or key topics from it as the 'searchQuery'.
3. Synthesize an answer based *only* on the customer's question and the information retrieved from the knowledge base (if any).
4. If no relevant information is found or the knowledge base doesn't provide a clear answer, state that you couldn't find the specific information but offer general assistance if appropriate.
5. Format the answer clearly and concisely.

Suggested Answer:`,
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
    // Example of directly calling the prompt with the tool
    const { output } = await suggestAnswerPrompt(input);

    // Alternative: Fetch knowledge first, then pass to a different prompt without the tool
    /*
    const relevantKnowledge = await findRelevantKnowledgeTool({ searchQuery: input.question });
    const promptWithContext = ai.definePrompt(...); // Define a prompt that takes `knowledgeContext`
    const { output } = await promptWithContext({ question: input.question, knowledgeContext: relevantKnowledge });
    */

    if (!output) {
      throw new Error("Failed to generate suggested answer.");
    }
    return output;
});
