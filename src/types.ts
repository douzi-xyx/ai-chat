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

export type Tool = {
  id: string;
  name: string;
  icon: string | React.ReactNode;
  description: string;
};
