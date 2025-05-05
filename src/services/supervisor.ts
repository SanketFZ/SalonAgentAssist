/**
 * Represents a message to the supervisor.
 */
export interface SupervisorMessage {
  /**
   * The message content.
   */
  content: string;
}

/**
 * Asynchronously sends a message to the supervisor.
 *
 * @param message The message to send to the supervisor.
 * @returns A promise that resolves when the message is sent.
 */
export async function sendMessageToSupervisor(message: SupervisorMessage): Promise<void> {
  // TODO: Implement this by calling a webhook.

  console.log(`Simulating sending message to supervisor: ${message.content}`);
}
