'use server';

/**
 * @fileOverview A flow that improves the formatting of a knowledge base entry based on edits.
 *
 * - improveKnowledgeBaseEntry - A function that handles the improvement process.
 * - ImproveKnowledgeBaseEntryInput - The input type for the improveKnowledgeBaseEntry function.
 * - ImproveKnowledgeBaseEntryOutput - The return type for the improveKnowledgeBaseEntry function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const ImproveKnowledgeBaseEntryInputSchema = z.object({
  originalEntry: z.string().describe('The original knowledge base entry.'),
  editedEntry: z.string().describe('The edited knowledge base entry.'),
});
export type ImproveKnowledgeBaseEntryInput = z.infer<typeof ImproveKnowledgeBaseEntryInputSchema>;

const ImproveKnowledgeBaseEntryOutputSchema = z.object({
  improvedEntry: z.string().describe('The improved knowledge base entry with better formatting.'),
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
      originalEntry: z.string().describe('The original knowledge base entry.'),
      editedEntry: z.string().describe('The edited knowledge base entry.'),
    }),
  },
  output: {
    schema: z.object({
      improvedEntry: z
        .string()
        .describe('The improved knowledge base entry with better formatting.'),
    }),
  },
  prompt: `You are an expert at formatting knowledge base entries to match a consistent tone and style.

You are given an original knowledge base entry and an edited version of the entry.

Your task is to reformat the edited entry to match the tone and style of the original entry as closely as possible.

Original Entry: {{{originalEntry}}}

Edited Entry: {{{editedEntry}}}

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
  return output!;
});