import { randomUUID } from 'crypto';
import { ChatServiceInput, DeleteSessionInput, UpdateSessionInput } from './types';
import {
  createSession,
  deleteSession,
  getAllSessions,
  getSessionById,
  updateSession,
} from '@/database';

export class SessionService {
  /**
   * 提取会话名称
   */
  extractSessionName(message: string | any[] | Record<string, any>): string {
    if (typeof message === 'string') {
      return message.slice(0, 30) || '新会话';
    }

    if (Array.isArray(message)) {
      // 从多模态内容中提取文本
      const textContent = message.find((item) => item.type === 'text');
      return textContent?.text.slice(0, 30) || '新会话';
    }

    if (typeof message === 'object' && message !== null) {
      // 从消息对象中提取文本
      const content = message.content || message.kwargs?.content;
      if (typeof content === 'string') {
        return content.slice(0, 30) || '新会话';
      }
      if (Array.isArray(content)) {
        const textContent = content.find((item) => item.type === 'text');
        return textContent?.text.slice(0, 30) || '新会话';
      }
    }

    return '新会话';
  }

  createSessionId(message: ChatServiceInput['message']) {
    const sessionName = this.extractSessionName(message);
    const sessionId = randomUUID();
    createSession(sessionId, sessionName);
    const createdAt = new Date().toString();
    return { threadId: sessionId, name: sessionName, createdAt };
  }

  async updateSessionName(input: UpdateSessionInput): Promise<any> {
    if (!input.id || !input.name) {
      throw new Error('缺少参数');
    }
    await updateSession(input.id, input.name);
    const updated = getSessionById(input.id);
    return updated;
  }

  async deleteSession(input: DeleteSessionInput): Promise<void> {
    if (!input.id) {
      throw new Error('缺少 id');
    }
    await deleteSession(input.id);
  }

  async getSessionById(id: string): Promise<any> {
    if (!id) {
      throw new Error('缺少 id');
    }
    return getSessionById(id);
  }

  async getAllSessions(): Promise<any[]> {
    return getAllSessions();
  }
}

/**
 * 单例实例
 */
export const sessionService = new SessionService();
