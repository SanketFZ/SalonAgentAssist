import type { HelpRequest, KnowledgeBaseEntry, HelpRequestStatus } from "@/types";

// In-memory store (Replace with Firebase/DynamoDB for persistence)
let helpRequests: HelpRequest[] = [];
let knowledgeBase: KnowledgeBaseEntry[] = [];
let idCounter = 0;

// --- Helper Functions ---
const generateId = (): string => {
  idCounter++;
  return idCounter.toString();
};

const findRequestById = (id: string): HelpRequest | undefined => {
  return helpRequests.find(req => req.id === id);
}

const findKnowledgeByQuestion = (question: string): KnowledgeBaseEntry | undefined => {
  // Basic case-insensitive search for simplicity
  return knowledgeBase.find(entry => entry.question.toLowerCase() === question.toLowerCase());
}


// --- Help Request Operations ---

export const createHelpRequest = async (callId: string, callerId: string, question: string): Promise<HelpRequest> => {
  const newRequest: HelpRequest = {
    id: generateId(),
    callId,
    callerId,
    question,
    status: "pending",
    createdAt: Date.now(),
  };
  helpRequests.push(newRequest);
  console.log(`[DB] Created Help Request: ${newRequest.id} for question: "${question}"`);
  // Simulate supervisor notification
  await simulateSupervisorNotification(newRequest);
  return newRequest;
};

export const getHelpRequests = async (status?: HelpRequestStatus): Promise<HelpRequest[]> => {
  let filteredRequests = [...helpRequests]; // Return a copy
  if (status) {
    filteredRequests = filteredRequests.filter(req => req.status === status);
  }
  // Sort by creation date, newest first
  return filteredRequests.sort((a, b) => b.createdAt - a.createdAt);
};

export const getHelpRequestById = async (id: string): Promise<HelpRequest | undefined> => {
  return findRequestById(id);
};

export const resolveHelpRequest = async (id: string, supervisorAnswer: string): Promise<HelpRequest | undefined> => {
  const request = findRequestById(id);
  if (request && request.status === "pending") {
    request.status = "resolved";
    request.supervisorAnswer = supervisorAnswer;
    request.resolvedAt = Date.now();
    console.log(`[DB] Resolved Help Request: ${id} with answer: "${supervisorAnswer}"`);

    // Add to knowledge base
    await addOrUpdateKnowledgeBaseEntry(request.question, supervisorAnswer);

    // Simulate texting back the caller
    await simulateCallerNotification(request.callerId, supervisorAnswer);

    return request;
  }
  console.warn(`[DB] Could not resolve Help Request: ${id}. Not found or not pending.`);
  return undefined;
};

// Simulate marking requests as unresolved after a timeout (e.g., 1 hour)
const TIMEOUT_MS = 60 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  helpRequests.forEach(req => {
    if (req.status === "pending" && (now - req.createdAt > TIMEOUT_MS)) {
      req.status = "unresolved";
      console.log(`[DB] Marked Help Request ${req.id} as unresolved due to timeout.`);
    }
  });
}, 60 * 1000); // Check every minute


// --- Knowledge Base Operations ---

export const getKnowledgeBaseEntries = async (): Promise<KnowledgeBaseEntry[]> => {
  // Sort by update date, newest first
  return [...knowledgeBase].sort((a, b) => b.updatedAt - a.updatedAt);
};

export const addOrUpdateKnowledgeBaseEntry = async (question: string, answer: string): Promise<KnowledgeBaseEntry> => {
  const existingEntry = findKnowledgeByQuestion(question);
  const now = Date.now();

  if (existingEntry) {
    existingEntry.answer = answer;
    existingEntry.updatedAt = now;
    console.log(`[DB] Updated Knowledge Base entry for question: "${question}"`);
    return existingEntry;
  } else {
    const newEntry: KnowledgeBaseEntry = {
      id: generateId(),
      question,
      answer,
      createdAt: now,
      updatedAt: now,
    };
    knowledgeBase.push(newEntry);
    console.log(`[DB] Added new Knowledge Base entry: ${newEntry.id} for question: "${question}"`);
    return newEntry;
  }
};

export const getAnswerFromKnowledgeBase = async (question: string): Promise<string | null> => {
    const entry = findKnowledgeByQuestion(question);
    return entry ? entry.answer : null;
}


// --- Simulation Helpers ---
async function simulateSupervisorNotification(request: HelpRequest) {
    // In a real app, this would call sendMessageToSupervisor
    console.log(`[SIMULATION] Supervisor Notified: Help needed for request ${request.id} - Question: "${request.question}" from ${request.callerId}`);
}

async function simulateCallerNotification(callerId: string, answer: string) {
     // In a real app, this would call sendTextMessage
    console.log(`[SIMULATION] Caller ${callerId} Notified: "${answer}"`);
}


// --- Pre-populate with some data for testing ---
(async () => {
  await addOrUpdateKnowledgeBaseEntry("What are your hours?", "We are open Monday to Friday, 9 AM to 6 PM, and Saturday 10 AM to 4 PM.");
  await addOrUpdateKnowledgeBaseEntry("Do you offer hair coloring services?", "Yes, we offer a full range of hair coloring services.");
  await createHelpRequest("call-abc", "555-111-2222", "Can I book an appointment online?");
  await createHelpRequest("call-def", "555-333-4444", "Do you do perms?");
  // Resolve one request
  await resolveHelpRequest("1", "Currently, we only take appointments over the phone. Please call us at 555-SALON.");
})();
