/**
 * Core type definitions for the application
 */

export interface ConversationState {
  count: number;
  [key: string]: any; // Allow extensibility
}

export interface MessageData {
  conversationId: string;
  messageId: string;
  text: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
  };
  channelId?: string;
  activity?: any;
}

export interface Article {
  id: string;
  title: string;
  url: string;
  sys_id?: string;
}

export interface IncidentData {
  sys_id: string;
  url: string;
  [key: string]: any;
}

export interface BackendResponseData {
  type: 'incident_created' | 'kb_suggestions' | string;
  sys_id?: string;
  url?: string;
  results?: Array<{
    title: string;
    sys_id: string;
    url: string;
    [key: string]: any;
  }>;
  [key: string]: any;
}

export interface CommandContext {
  conversationId: string;
  activity: any;
  [key: string]: any;
}


