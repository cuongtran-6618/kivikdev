/**
 * Article selection handler
 */

import { IActionHandler } from "./interfaces";
import BackendService from "../../backendService";
import { MessageData } from "../types";

export class ArticleSelectionHandler implements IActionHandler {
  actionType = "select_article";

  constructor(private backendService: BackendService) {}

  async handle(context: any, activity: any, data: any): Promise<boolean> {
    const articleId = data.articleId;
    
    if (!articleId) {
      return false;
    }

    const articleMessageData: MessageData = {
      conversationId: activity.conversation.id,
      messageId: activity.id || "",
      text: `${articleId}`,
      timestamp: new Date().toISOString(),
      user: {
        id: activity.from.id,
        name: activity.from.name || "Unknown",
      },
      channelId: activity.channelId as string,
      activity: activity,
    };

    console.log("[ArticleHandler] Sending article selection to backend:", articleMessageData);

    try {
      await this.backendService.sendChatMessage(articleMessageData);
      console.log("[ArticleHandler] Successfully sent article selection to backend");
      
      // Send a concise confirmation
      await context.send(`Marked as resolved. Thanks!`);
    } catch (error) {
      console.error("[ArticleHandler] Failed to send article selection to backend:", error);
      await context.send({
        type: "message",
        text: `❌ Sorry, I encountered an error while marking the article. Please try again.`,
      });
    }

    return true;
  }
}


