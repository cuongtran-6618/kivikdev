/**
 * Incident creation handler
 */

import { IncidentData } from "../types";

export class IncidentHandler {
  /**
   * Handle incident created response from backend
   */
  async handleIncidentCreated(context: any, data: IncidentData): Promise<void> {
    console.log("[IncidentHandler] Received incident created response from backend:", data?.sys_id);
    await context.send(
      `Incident has been created with ID: ${data.sys_id}, view it here: ${data.url}`
    );
  }
}


