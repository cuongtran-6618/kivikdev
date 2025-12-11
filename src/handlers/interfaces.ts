/**
 * Handler interfaces for extensibility
 */

export interface IMessageHandler {
  /**
   * Check if this handler can process the message
   */
  canHandle(context: any, activity: any): boolean | Promise<boolean>;

  /**
   * Handle the message
   */
  handle(context: any, activity: any): Promise<void | boolean>;
}

export interface ICommandHandler {
  /**
   * The command name (e.g., "/reset")
   */
  command: string;

  /**
   * Description of what the command does
   */
  description?: string;

  /**
   * Handle the command
   */
  handle(context: any, activity: any, args?: string[]): Promise<void>;
}

export interface IActionHandler {
  /**
   * The action type this handler processes
   */
  actionType: string;

  /**
   * Handle the action
   */
  handle(context: any, activity: any, data: any): Promise<void | boolean>;
}


