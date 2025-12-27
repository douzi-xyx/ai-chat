// 消息内容项类型
export type MessageContentItem =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };

// 消息内容类型：可以是纯文本字符串，或包含文本和图片的数组
export type MessageContent = string | MessageContentItem[];

// 输入框内容
export type TextFieldValue = {
  inputValue?: string;
  images?: File[];
};

export interface Message {
  id: string;
  content: MessageContent;
  role: 'user' | 'assistant';
  isStreaming?: boolean;
  toolsUsed?: string[]; // Array of tool identifiers/names used in this message
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
