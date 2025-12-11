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
        text: "Knowledge Base Suggestions",
        weight: "Bolder",
        size: "Medium",
      },
    ];

    // Add each article with its own "View Article" button and "Select Article" button
    articles.forEach((article, index) => {
      cardBody.push({
        type: "Container",
        separator: index > 0,
        spacing: "Medium",
        items: [
          {
            type: "TextBlock",
            text: article.title,
            weight: "Bolder",
            wrap: true,
          },
          {
            type: "ActionSet",
            actions: [
              {
                type: "Action.OpenUrl",
                title: "View Article",
                url: article.url,
              },
              {
                type: "Action.Submit",
                title: "Mark as resolved",
                data: {
                  action: "select_article",
                  articleId: article.id,
                },
              },
            ],
          },
        ],
      });
    });

    return {
      $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
      type: "AdaptiveCard",
      version: "1.5",
      body: cardBody,
    };
  }

  /**
   * Send the card to the context
   */
  static async sendCard(context: any, articles: Article[]): Promise<void> {
    const adaptiveCard = this.buildCard(articles);

    await context.send({
      type: "message",
      attachments: [
        {
          contentType: "application/vnd.microsoft.card.adaptive",
          content: adaptiveCard,
        },
      ],
    });
  }
}


