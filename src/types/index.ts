export type HelpRequestStatus = "pending" | "resolved" | "unresolved";

export interface HelpRequest {
  id: string;
  callId: string; // Link to the original call
  callerId: string; // Original caller's ID (e.g., phone number)
  question: string;
  status: HelpRequestStatus;
  createdAt: number; // Unix timestamp
  resolvedAt?: number; // Unix timestamp
  supervisorAnswer?: string;
}

export interface KnowledgeBaseEntry {
  id: string;
  question: string;
  answer: string;
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
}
