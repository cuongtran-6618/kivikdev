/**
 * Conversation storage service module
 */

import { IStorage } from "@microsoft/teams.common";
import { ConversationState } from "../types";

export class ConversationStorageService {
  constructor(private storage: IStorage) {}

  /**
   * Get conversation state, creating default if it doesn't exist
   */
  getState(conversationId: string): ConversationState {
    let state = this.storage.get(conversationId);
    if (!state) {
      state = { count: 0 };
      this.storage.set(conversationId, state);
    }
    return state;
  }

  /**
   * Update conversation state
   */
  setState(conversationId: string, state: ConversationState): void {
    this.storage.set(conversationId, state);
  }

  /**
   * Delete conversation state
   */
  deleteState(conversationId: string): void {
    this.storage.delete(conversationId);
  }

  /**
   * Update a specific property in conversation state
   */
  updateStateProperty<T>(conversationId: string, key: string, value: T): void {
    const state = this.getState(conversationId);
    state[key] = value;
    this.setState(conversationId, state);
  }

  /**
   * Get a specific property from conversation state
   */
  getStateProperty<T>(conversationId: string, key: string): T | undefined {
    const state = this.getState(conversationId);
    return state[key] as T | undefined;
  }
}

