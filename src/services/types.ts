export type ChatServiceInput = {
  message: string | any[] | Record<string, any>;
  thread_id?: string;
  tools?: string[];
  model?: string;
  userId?: string; // 用户 ID,用于创建会话
  authenticatedClient?: any; // 带认证的 Supabase 客户端
};

export type ChatHistoryQuery = {
  thread_id: string;
  userId?: string;
  authenticatedClient?: any;
};

export type ChatHistoryResult = {
  thread_id: string;
  history: any[];
};

export interface UpdateSessionInput {
  id: string;
  name: string;
}

export interface DeleteSessionInput {
  id: string;
}
