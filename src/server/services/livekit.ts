/**
 * Represents a call.
 */
export interface Call {
  /**
   * The unique identifier of the call.
   */
  id: string;
  /**
   * The caller's phone number.
   */
  callerId: string;

  /**
   * The question asked by the caller
   */
  question: string;
}

/**
 * Asynchronously receive a call.
 *
 * @returns A promise that resolves to a Call object.
 */
export async function receiveCall(): Promise<Call> {
  // TODO: Implement this by calling LiveKit API.
  // This should only run on the server.

  // Simulate a slight delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const sampleQuestions = [
    "What are your hours?",
    "Do you offer haircuts?",
    "Can I book an appointment for next Tuesday?",
    "How much is a color treatment?",
    "Where are you located?",
  ];
  const randomQuestion = sampleQuestions[Math.floor(Math.random() * sampleQuestions.length)];
  const randomCallerId = `555-123-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
  const randomId = Math.random().toString(36).substring(7);


  return {
    id: randomId,
    callerId: randomCallerId,
    question: randomQuestion,
  };
}

/**
 * Respond to a call
 *
 * @param callId The unique call id.
 * @param answer The answer to respond with
 */
export async function respondToCall(callId: string, answer: string): Promise<void> {
  // TODO: Implement this by calling LiveKit API.
  // This should only run on the server.
  console.log(`[SERVER SERVICE] Simulating responding to call ${callId} with answer: ${answer}`)
   await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call time
}

/**
 * Hang up a call
 *
 * @param callId The unique call id.
 */
export async function hangUpCall(callId: string): Promise<void> {
  // TODO: Implement this by calling LiveKit API.
  // This should only run on the server.
  console.log(`[SERVER SERVICE] Simulating hanging up call ${callId}`)
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate API call time
}
