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
      const summaryText = article.summary || "No summary available. Lorem ipsum dolor sit amet, consectetur adipiscing elit.. Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
      const truncatedText = summaryText.length > 50 ? summaryText.slice(0, 50) + "…" : summaryText;

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
          // Title row with inline chevron toggle
          {
            type: "ColumnSet",
            columns: [
              {
                type: "Column",
                width: "stretch",
                items: [
                  {
                    type: "TextBlock",
                    text: article.title,
                    weight: "Bolder",
                    size: "Medium",
                    wrap: true,
                    spacing: "Small",
                    color: "Accent",
                  },
                ],
              },
              {
                type: "Column",
                width: "auto",
                verticalContentAlignment: "center",
                items: [
                // Inline check button (replaces "This solved my issue")
                  {
                    type: "ActionSet",
                    actions: [
                      {
                        type: "Action.Submit",
                        title: "✓",
                        data: {
                          action: "select_article",
                          articleId: article.id,
                          articleTitle: article.title,
                        },
                        style: "positive",
                      },
                    ],
                  },
                  {
                    type: "Container",
                    id: `toggleCollapsedContainer_${article.id}`,
                    items: [
                      {
                        type: "ActionSet",
                        actions: [
                          {
                            type: "Action.ToggleVisibility",
                            title: "▶",
                            tooltip: "Show summary",
                            targetElements: [
                              `summary_truncated_${article.id}`,
                              `summary_full_${article.id}`,
                              `toggleCollapsedContainer_${article.id}`,
                              `toggleExpandedContainer_${article.id}`,
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "Container",
                    id: `toggleExpandedContainer_${article.id}`,
                    isVisible: false,
                    items: [
                      {
                        type: "ActionSet",
                        actions: [
                          {
                            type: "Action.ToggleVisibility",
                            title: "▼",
                            tooltip: "Hide summary",
                            targetElements: [
                              `summary_truncated_${article.id}`,
                              `summary_full_${article.id}`,
                              `toggleCollapsedContainer_${article.id}`,
                              `toggleExpandedContainer_${article.id}`,
                            ],
                          },
                        ],
                      },
                    ],
                  },                  
                ],
              },
            ],
          },
          // Truncated summary (visible) and full summary (hidden)
          {
            type: "Container",
            id: `summary_truncated_${article.id}`,
            isVisible: true,
            spacing: "Small",
            items: [
              {
                type: "TextBlock",
                text: truncatedText,
                wrap: true,
                isSubtle: true,
                size: "Small",
              },
            ],
          },
          {
            type: "Container",
            id: `summary_full_${article.id}`,
            isVisible: false,
            spacing: "Small",
            items: [
              {
                type: "TextBlock",
                text: summaryText,
                wrap: true,
                isSubtle: true,
                size: "Small",
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


