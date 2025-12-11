/**
 * Message processor with handler chain pattern
 */

import { stripMentionsText } from "@microsoft/teams.api";
import { IMessageHandler, IActionHandler } from "../handlers/interfaces";
import { MessageData, BackendResponseData, Article } from "../types";
import BackendService from "../../backendService";
import { IncidentHandler } from "../handlers/incidentHandler";
import { KBSuggestionsCardBuilder } from "../cards/kbSuggestionsCard";
import { CommandRegistry } from "../commands/commandRegistry";
import { ConversationStorageService } from "../storage/conversationStorage";

export class MessageProcessor {
  private actionHandlers: Map<string, IActionHandler> = new Map();
  private messageHandlers: IMessageHandler[] = [];

  constructor(
    private backendService: BackendService,
    private commandRegistry: CommandRegistry,
    private storageService: ConversationStorageService,
    private incidentHandler: IncidentHandler
  ) {}

  /**
   * Register an action handler
   */
  registerActionHandler(handler: IActionHandler): void {
    this.actionHandlers.set(handler.actionType, handler);
  }

  /**
   * Register a message handler
   */
  registerMessageHandler(handler: IMessageHandler): void {
    this.messageHandlers.push(handler);
  }

  /**
   * Process incoming message
   */
  async process(context: any, activity: any): Promise<void> {
    // Handle action-based messages (e.g., from adaptive cards)
    if (activity.value && activity.value.action) {
      const handler = this.actionHandlers.get(activity.value.action);
      if (handler) {
        const handled = await handler.handle(context, activity, activity.value);
        if (handled) {
          return;
        }
      }
    }

    const text: string = stripMentionsText(activity);

    // Handle commands
    if (text.startsWith("/")) {
      const command = text.split(" ")[0];
      const args = text.split(" ").slice(1);
      const handled = await this.commandRegistry.execute(command, context, activity, args);
      if (handled) {
        return;
      }
    }

    // Try custom message handlers
    for (const handler of this.messageHandlers) {
      const canHandle = await handler.canHandle(context, activity);
      if (canHandle) {
        await handler.handle(context, activity);
        return;
      }
    }

    // Send message to backend
    await this.processBackendMessage(context, activity, text);
  }

  /**
   * Process message with backend service
   */
  private async processBackendMessage(
    context: any,
    activity: any,
    text: string
  ): Promise<void> {
    const messageData: MessageData = {
      conversationId: activity.conversation.id,
      messageId: activity.id || "",
      text: text,
      timestamp: new Date().toISOString(),
      user: {
        id: activity.from.id,
        name: activity.from.name || "Unknown",
      },
      channelId: activity.channelId as string,
      activity: activity,
    };

    // Send to backend (fire and forget - don't block bot response)
    const result = await this.backendService.sendChatMessage(messageData).catch((error) => {
      console.error("[MessageProcessor] Failed to send message to backend:", error);
      return null;
    });

    console.log("[MessageProcessor] Sent message to backend:", result);

    if (!result || !result.data) {
      // Default echo behavior if no backend response
      await this.handleDefaultEcho(context, activity, text);
      return;
    }

    const data = result.data as BackendResponseData;

    // Handle incident creation
    if (data.type === "incident_created") {
      await this.incidentHandler.handleIncidentCreated(context, {
        sys_id: data.sys_id || "",
        url: data.url || "",
      });
      return;
    }

    // Handle KB suggestions
    if (data.type === "kb_suggestions" && data.results) {
      const articles: Article[] = data.results.map((article: any, index: number) => ({
        title: article.title || `Article ${index + 1}`,
        id: article.sys_id,
        url: article.url,
      }));

      await KBSuggestionsCardBuilder.sendCard(context, articles);
      return;
    }

    // Default echo behavior
    await this.handleDefaultEcho(context, activity, text);
  }

  /**
   * Handle default echo behavior
   */
  private async handleDefaultEcho(context: any, activity: any, text: string): Promise<void> {
    const state = this.storageService.getState(activity.conversation.id);
    state.count++;
    this.storageService.setState(activity.conversation.id, state);
    await context.send(`[${state.count}] you said: ${text}`);
  }
}


