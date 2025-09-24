
export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
}

export interface ChatMessage {
  role: MessageRole;
  content: string;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
}

export interface PanelContent {
  html: string;
  css: string;
  js: string;
}
