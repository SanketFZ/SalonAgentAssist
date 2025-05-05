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

  return {
    id: '123',
    callerId: '555-123-4567',
    question: 'What are your hours?',
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
  console.log(`Simulating responding to call ${callId} with answer: ${answer}`)
}

/**
 * Hang up a call
 *
 * @param callId The unique call id.
 */
export async function hangUpCall(callId: string): Promise<void> {
  // TODO: Implement this by calling LiveKit API.
  console.log(`Simulating hanging up call ${callId}`)
}
