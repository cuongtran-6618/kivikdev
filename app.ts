/**
 * Main application entry point
 * Refactored for modularity, extensibility, and scalability
 */

import { LocalStorage } from "@microsoft/teams.common";
import config from "./config";
import BackendService from "./backendService";
import { createApp } from "./src/app/appFactory";
import { ConversationStorageService } from "./src/storage/conversationStorage";
import { CommandRegistry, createDefaultCommands } from "./src/commands/commandRegistry";
import { MessageProcessor } from "./src/middleware/messageProcessor";
import { ArticleSelectionHandler } from "./src/handlers/articleHandler";
import { IncidentHandler } from "./src/handlers/incidentHandler";

// Initialize storage
const storage = new LocalStorage();
const storageService = new ConversationStorageService(storage);

// Initialize backend service
const backendService = new BackendService({
  baseUrl: config.BackendServiceUrl,
});

// Initialize handlers
const incidentHandler = new IncidentHandler();
const articleHandler = new ArticleSelectionHandler(backendService);

// Initialize command registry with default commands
const commandRegistry = new CommandRegistry();
const defaultCommands = createDefaultCommands(storageService);
commandRegistry.registerAll(defaultCommands);

// Initialize message processor
const messageProcessor = new MessageProcessor(
  backendService,
  commandRegistry,
  storageService,
  incidentHandler
);

// Register action handlers
messageProcessor.registerActionHandler(articleHandler);

// Create the app
const app = createApp({
  storage,
});

// Register message handler
app.on("message", async (context) => {
  const activity = context.activity;
  console.log("[App] Received message:", activity);

  try {
    await messageProcessor.process(context, activity);
  } catch (error) {
    console.error("[App] Error processing message:", error);
    await context.send("Sorry, I encountered an error processing your message.");
  }
});

export default app;
