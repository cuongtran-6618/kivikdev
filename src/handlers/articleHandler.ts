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

    console.log("Sending article selection to backend:", articleMessageData);

    await this.backendService.sendChatMessage(articleMessageData).catch((error) => {
      console.error("[ArticleHandler] Failed to send article selection to backend:", error);
    });

    await context.send(`Article selected! Sending article ID ${articleId} to backend.`);
    return true;
  }
}


