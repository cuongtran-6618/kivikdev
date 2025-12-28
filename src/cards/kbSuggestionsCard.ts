/**
 * Knowledge Base Suggestions Adaptive Card Builder
 */

import { Article } from "../types";

export interface AdaptiveCard {
  $schema: string;
  type: string;
  version: string;
  body: any[];
}

export class KBSuggestionsCardBuilder {
  /**
   * Create and send adaptive card with KB suggestions
   */
  static buildCard(articles: Article[]): AdaptiveCard {
    const cardBody: any[] = [
      {
        type: "TextBlock",
        text: "Found relevant articles",
        weight: "Bolder",
        size: "Medium",
        spacing: "Medium",
      },
    ];

    // Add each article with simplified, intuitive UI
    articles.forEach((article, index) => {
      cardBody.push({
        type: "Container",
        separator: index > 0,
        spacing: "Medium",
        selectAction: {
          type: "Action.OpenUrl",
          title: article.title,
          url: article.url,
        },
        items: [
          // Clickable title - most intuitive way to open article
          {
            type: "TextBlock",
            text: article.title,
            weight: "Bolder",
            size: "Medium",
            wrap: true,
            spacing: "Small",
            color: "Accent",
          },
          // Single, clear action button
          {
            type: "ActionSet",
            spacing: "Small",
            actions: [
              {
                type: "Action.Submit",
                title: "This solved my issue",
                data: {
                  action: "select_article",
                  articleId: article.id,
                  articleTitle: article.title,
                },
                style: "positive",
              },
            ],
          },
        ],
      });
    });

    return {
      $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
      type: "AdaptiveCard",
      version: "1.4",
      body: cardBody,
    };
  }

  /**
   * Send the card to the context
   */
  static async sendCard(context: any, articles: Article[]): Promise<void> {
    // Validate articles array
    if (!articles || articles.length === 0) {
      console.warn("[KBSuggestionsCardBuilder] No articles provided, cannot send card");
      await context.send("No knowledge base articles found.");
      return;
    }

    try {
      const adaptiveCard = this.buildCard(articles);
      console.log("[KBSuggestionsCardBuilder] Sending adaptive card:", JSON.stringify(adaptiveCard, null, 2));

      await context.send({
        type: "message",
        attachments: [
          {
            contentType: "application/vnd.microsoft.card.adaptive",
            content: adaptiveCard,
          },
        ],
      });
      
      console.log("[KBSuggestionsCardBuilder] Successfully sent adaptive card");
    } catch (error) {
      console.error("[KBSuggestionsCardBuilder] Error sending adaptive card:", error);
      throw error; // Re-throw to let caller handle it
    }
  }
}


