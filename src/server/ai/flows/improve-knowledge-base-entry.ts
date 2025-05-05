'use server';

/**
 * @fileOverview A flow that improves the formatting of a knowledge base entry based on edits.
 *
 * - improveKnowledgeBaseEntry - A function that handles the improvement process.
 * - ImproveKnowledgeBaseEntryInput - The input type for the improveKnowledgeBaseEntry function.
 * - ImproveKnowledgeBaseEntryOutput - The return type for the improveKnowledgeBaseEntry function.
 */

import {ai} from '@/server/ai/ai-instance'; // Adjust import path
import {z} from 'genkit';

const ImproveKnowledgeBaseEntryInputSchema = z.object({
  originalEntry: z.string().describe('The original knowledge base entry representing the desired style.'),
  editedEntry: z.string().describe('The new knowledge base entry content provided by the user.'),
});
export type ImproveKnowledgeBaseEntryInput = z.infer<typeof ImproveKnowledgeBaseEntryInputSchema>;

const ImproveKnowledgeBaseEntryOutputSchema = z.object({
  improvedEntry: z.string().describe('The improved knowledge base entry with formatting adjusted to match the original style.'),
});
export type ImproveKnowledgeBaseEntryOutput = z.infer<typeof ImproveKnowledgeBaseEntryOutputSchema>;

export async function improveKnowledgeBaseEntry(
  input: ImproveKnowledgeBaseEntryInput
): Promise<ImproveKnowledgeBaseEntryOutput> {
  return improveKnowledgeBaseEntryFlow(input);
}

const improveKnowledgeBaseEntryPrompt = ai.definePrompt({
  name: 'improveKnowledgeBaseEntryPrompt',
  input: {
    schema: z.object({
      originalEntry: z.string().describe('The original knowledge base entry representing the desired style.'),
      editedEntry: z.string().describe('The new knowledge base entry content provided by the user.'),
    }),
  },
  output: {
    schema: z.object({
      improvedEntry: z
        .string()
        .describe('The improved knowledge base entry with formatting adjusted to match the original style.'),
    }),
  },
  prompt: `You are an expert at formatting knowledge base entries to match a consistent tone and style.

You are given an original knowledge base entry that exemplifies the desired style and tone.
You are also given a new entry provided by a user.

Your task is to reformat the new entry to match the tone and style of the original entry as closely as possible, while preserving the factual information from the new entry. Ensure the output is clear, concise, and follows the established formatting conventions (e.g., use of headings, lists, bold text) apparent in the original entry.

Original Entry (Style Reference):
\`\`\`
{{{originalEntry}}}
\`\`\`

New Entry (Content):
\`\`\`
{{{editedEntry}}}
\`\`\`

Improved Entry:`,
});

const improveKnowledgeBaseEntryFlow = ai.defineFlow<
  typeof ImproveKnowledgeBaseEntryInputSchema,
  typeof ImproveKnowledgeBaseEntryOutputSchema
>({
  name: 'improveKnowledgeBaseEntryFlow',
  inputSchema: ImproveKnowledgeBaseEntryInputSchema,
  outputSchema: ImproveKnowledgeBaseEntryOutputSchema,
},
async input => {
  const {output} = await improveKnowledgeBaseEntryPrompt(input);
  if (!output) {
    throw new Error("Failed to generate improved knowledge base entry.");
  }
  return output;
});
