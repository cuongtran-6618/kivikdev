/**
 * Command registry for managing command handlers
 */

import { ICommandHandler } from "../handlers/interfaces";
import { ConversationStorageService } from "../storage/conversationStorage";

export class CommandRegistry {
  private handlers: Map<string, ICommandHandler> = new Map();

  /**
   * Register a command handler
   */
  register(handler: ICommandHandler): void {
    this.handlers.set(handler.command, handler);
  }

  /**
   * Register multiple command handlers
   */
  registerAll(handlers: ICommandHandler[]): void {
    handlers.forEach((handler) => this.register(handler));
  }

  /**
   * Get a command handler by command name
   */
  getHandler(command: string): ICommandHandler | undefined {
    return this.handlers.get(command);
  }

  /**
   * Check if a command is registered
   */
  hasCommand(command: string): boolean {
    return this.handlers.has(command);
  }

  /**
   * Get all registered commands
   */
  getAllCommands(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Execute a command
   */
  async execute(command: string, context: any, activity: any, args?: string[]): Promise<boolean> {
    const handler = this.getHandler(command);
    if (!handler) {
      return false;
    }

    await handler.handle(context, activity, args);
    return true;
  }
}

/**
 * Create default command handlers
 */
export function createDefaultCommands(
  storageService: ConversationStorageService
): ICommandHandler[] {
  return [
    {
      command: "/reset",
      description: "Reset conversation state",
      async handle(context: any, activity: any) {
        storageService.deleteState(activity.conversation.id);
        await context.send("Ok I've deleted the current conversation state.");
      },
    },
    {
      command: "/count",
      description: "Get conversation count",
      async handle(context: any, activity: any) {
        const state = storageService.getState(activity.conversation.id);
        await context.send(`The count is ${state.count}`);
      },
    },
    {
      command: "/diag",
      description: "Show diagnostic information",
      async handle(context: any, activity: any) {
        await context.send(JSON.stringify(activity));
      },
    },
    {
      command: "/state",
      description: "Show conversation state",
      async handle(context: any, activity: any) {
        const state = storageService.getState(activity.conversation.id);
        await context.send(JSON.stringify(state));
      },
    },
    {
      command: "/runtime",
      description: "Show runtime information",
      async handle(context: any, activity: any) {
        const runtime = {
          nodeversion: process.version,
          sdkversion: "2.0.0", // Teams AI v2
        };
        await context.send(JSON.stringify(runtime));
      },
    },
  ];
}


