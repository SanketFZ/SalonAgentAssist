import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  updateDoc,
  Timestamp,
  orderBy,
  limit,
  serverTimestamp, // Use serverTimestamp for consistency
} from "firebase/firestore";
import type { HelpRequest, KnowledgeBaseEntry, HelpRequestStatus } from "@/types";

// Firestore collection references
const helpRequestsCollection = collection(db, "helpRequests");
const knowledgeBaseCollection = collection(db, "knowledgeBase");

// --- Help Request Operations ---

export const createHelpRequest = async (callId: string, callerId: string, question: string): Promise<HelpRequest> => {
  const newRequestData = {
    callId,
    callerId,
    question,
    status: "pending" as HelpRequestStatus,
    createdAt: serverTimestamp(), // Use server timestamp
    resolvedAt: null,
    supervisorAnswer: null,
  };
  const docRef = await addDoc(helpRequestsCollection, newRequestData);
  console.log(`[DB] Created Help Request in Firestore: ${docRef.id} for question: "${question}"`);

  // Construct the HelpRequest object to return (createdAt will be null until server confirms)
  const newRequest: HelpRequest = {
    id: docRef.id,
    ...newRequestData,
     createdAt: Date.now(), // Use local time temporarily, Firestore value is the source of truth
     resolvedAt: undefined, // Ensure optional fields are handled
     supervisorAnswer: undefined,
  };

  // Simulate supervisor notification (remains the same)
  await simulateSupervisorNotification(newRequest);
  return newRequest;
};

export const getHelpRequests = async (status?: HelpRequestStatus): Promise<HelpRequest[]> => {
  let q;
  if (status) {
    q = query(helpRequestsCollection, where("status", "==", status), orderBy("createdAt", "desc"));
  } else {
    q = query(helpRequestsCollection, orderBy("createdAt", "desc"));
  }

  const querySnapshot = await getDocs(q);
  const requests: HelpRequest[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    requests.push({
      id: doc.id,
      callId: data.callId,
      callerId: data.callerId,
      question: data.question,
      status: data.status,
      createdAt: (data.createdAt as Timestamp)?.toMillis() || Date.now(), // Handle potential null/pending server timestamp
      resolvedAt: (data.resolvedAt as Timestamp)?.toMillis(), // Optional
      supervisorAnswer: data.supervisorAnswer, // Optional
    });
  });
  return requests;
};

export const getHelpRequestById = async (id: string): Promise<HelpRequest | undefined> => {
  const docRef = doc(db, "helpRequests", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      callId: data.callId,
      callerId: data.callerId,
      question: data.question,
      status: data.status,
      createdAt: (data.createdAt as Timestamp)?.toMillis() || Date.now(),
      resolvedAt: (data.resolvedAt as Timestamp)?.toMillis(),
      supervisorAnswer: data.supervisorAnswer,
    };
  } else {
    return undefined;
  }
};

export const resolveHelpRequest = async (id: string, supervisorAnswer: string): Promise<HelpRequest | undefined> => {
  const docRef = doc(db, "helpRequests", id);
  const requestSnap = await getDoc(docRef); // Get current data first

  if (!requestSnap.exists() || requestSnap.data().status !== 'pending') {
      console.warn(`[DB] Could not resolve Help Request in Firestore: ${id}. Not found or not pending.`);
      return undefined;
  }

  const requestData = requestSnap.data() as Omit<HelpRequest, 'id' | 'createdAt' | 'resolvedAt'> & { createdAt: Timestamp | null, resolvedAt: Timestamp | null }; // Type assertion for Firestore data

  try {
    await updateDoc(docRef, {
      status: "resolved" as HelpRequestStatus,
      supervisorAnswer: supervisorAnswer,
      resolvedAt: serverTimestamp(), // Use server timestamp
    });
    console.log(`[DB] Resolved Help Request in Firestore: ${id} with answer: "${supervisorAnswer}"`);

    // Add to knowledge base (using the original question from requestData)
    await addOrUpdateKnowledgeBaseEntry(requestData.question, supervisorAnswer);

    // Simulate texting back the caller (using callerId from requestData)
    await simulateCallerNotification(requestData.callerId, supervisorAnswer);

    // Return the updated request structure
    const updatedRequest: HelpRequest = {
      id: id,
      callId: requestData.callId,
      callerId: requestData.callerId,
      question: requestData.question,
      status: "resolved",
      createdAt: (requestData.createdAt as Timestamp)?.toMillis() || Date.now(),
      resolvedAt: Date.now(), // Use local time temporarily
      supervisorAnswer: supervisorAnswer,
    };
    return updatedRequest;

  } catch (error) {
    console.error(`[DB] Error resolving Help Request ${id} in Firestore:`, error);
    return undefined; // Indicate failure
  }
};

// Note: The automatic timeout logic using setInterval is removed.
// This kind of logic should be handled by backend functions (e.g., Cloud Functions triggered on a schedule)
// or by querying for pending requests older than the timeout period when needed.


// --- Knowledge Base Operations ---

export const getKnowledgeBaseEntries = async (): Promise<KnowledgeBaseEntry[]> => {
  const q = query(knowledgeBaseCollection, orderBy("updatedAt", "desc"));
  const querySnapshot = await getDocs(q);
  const entries: KnowledgeBaseEntry[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    entries.push({
      id: doc.id,
      question: data.question,
      answer: data.answer,
      createdAt: (data.createdAt as Timestamp).toMillis(),
      updatedAt: (data.updatedAt as Timestamp).toMillis(),
    });
  });
  return entries;
};

export const addOrUpdateKnowledgeBaseEntry = async (question: string, answer: string): Promise<KnowledgeBaseEntry> => {
    // Query for existing entry based on question
    const q = query(knowledgeBaseCollection, where("question", "==", question), limit(1));
    const querySnapshot = await getDocs(q);

    const now = serverTimestamp(); // Use server timestamp for updates

    if (!querySnapshot.empty) {
        // Update existing entry
        const existingDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, "knowledgeBase", existingDoc.id), {
            answer: answer,
            updatedAt: now,
        });
        console.log(`[DB] Updated Knowledge Base entry in Firestore for question: "${question}"`);
        const data = existingDoc.data();
        return {
            id: existingDoc.id,
            question: data.question,
            answer: answer, // Return the new answer
            createdAt: (data.createdAt as Timestamp).toMillis(),
            updatedAt: Date.now(), // Use local time temporarily
        };
    } else {
        // Add new entry
        const newEntryData = {
            question,
            answer,
            createdAt: now,
            updatedAt: now,
        };
        const docRef = await addDoc(knowledgeBaseCollection, newEntryData);
        console.log(`[DB] Added new Knowledge Base entry in Firestore: ${docRef.id} for question: "${question}"`);
        return {
            id: docRef.id,
            ...newEntryData,
            createdAt: Date.now(), // Use local time temporarily
            updatedAt: Date.now(), // Use local time temporarily
        };
    }
};

export const getAnswerFromKnowledgeBase = async (question: string): Promise<string | null> => {
    const q = query(knowledgeBaseCollection, where("question", "==", question), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return doc.data().answer as string;
    } else {
        return null;
    }
}


// --- Simulation Helpers (remain unchanged) ---
async function simulateSupervisorNotification(request: HelpRequest) {
    // In a real app, this would call sendMessageToSupervisor
    console.log(`[SIMULATION] Supervisor Notified: Help needed for request ${request.id} - Question: "${request.question}" from ${request.callerId}`);
}

async function simulateCallerNotification(callerId: string, answer: string) {
     // In a real app, this would call sendTextMessage via Twilio or similar
    console.log(`[SIMULATION] Caller ${callerId} Notified: "${answer}"`);
}


// --- Remove Pre-population ---
// Data is now persistent in Firestore, so pre-population is removed.
// (async () => {
//   // Removed pre-population logic
// })();
