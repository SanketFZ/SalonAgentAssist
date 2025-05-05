import { receiveCall, respondToCall, hangUpCall, Call } from "@/server/services/livekit";
import { getAnswerFromKnowledgeBase, createHelpRequest } from "@/server/lib/db";
import { sendMessageToSupervisor } from "@/server/services/supervisor"; // Although simulated in db.ts for now

/**
 * Simulates the AI agent processing an incoming call.
 */
export async function processIncomingCall() {
  console.log("[AGENT] Waiting for incoming call simulation...");

  // Simulate receiving a call after a short delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  const call = await receiveCall(); // In a real scenario, this would block until a call comes

  console.log(`[AGENT] Received call ${call.id} from ${call.callerId}. Question: "${call.question}"`);

  try {
    // 1. Check Knowledge Base
    const knownAnswer = await getAnswerFromKnowledgeBase(call.question);

    if (knownAnswer) {
      // 2a. Respond if answer is known
      console.log(`[AGENT] Found answer in KB for call ${call.id}. Responding.`);
      await respondToCall(call.id, knownAnswer);
      await hangUpCall(call.id);
      console.log(`[AGENT] Responded and hung up call ${call.id}.`);
    } else {
      // 2b. Escalate if answer is unknown
      console.log(`[AGENT] Answer not found for call ${call.id}. Escalating to supervisor.`);
      // Tell caller we're checking
      await respondToCall(call.id, "Let me check with my supervisor and get back to you shortly.");
      // Create help request (this also simulates supervisor notification via db.ts)
      await createHelpRequest(call.id, call.callerId, call.question);
      // Agent hangs up after escalating
      await hangUpCall(call.id);
      console.log(`[AGENT] Escalated call ${call.id} and hung up.`);
    }
  } catch (error) {
    console.error(`[AGENT] Error processing call ${call.id}:`, error);
    // Attempt to hang up gracefully on error
    try {
      await hangUpCall(call.id);
    } catch (hangUpError) {
      console.error(`[AGENT] Error hanging up call ${call.id} after processing error:`, hangUpError);
    }
  } finally {
      // Simulate the next call processing loop
      // In a real service, this would be part of a loop or event handler
       console.log("[AGENT] Ready for next simulated call.");
       // processIncomingCall(); // Uncomment to loop simulation (careful with recursion in simple demos)
  }
}

// --- Initial Setup ---
// Simulate the basic agent prompt (this doesn't directly influence the logic here but represents setup)
console.log("[AGENT] Initializing with fake salon information...");
console.log("[AGENT] Prompt: You are a helpful AI assistant for 'The Cutting Edge' salon. Answer questions about services, hours, and appointments. If you don't know the answer, escalate to a supervisor.");

// Start the simulation (optional, can be triggered elsewhere)
// processIncomingCall();
