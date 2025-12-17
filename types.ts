export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: Date;
}
