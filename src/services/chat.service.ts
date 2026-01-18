import { randomUUID } from 'crypto';

/**
 * 处理聊天相关的逻辑
 */

import { ChatHistoryQuery, ChatHistoryResult, ChatServiceInput } from './types';
import { HumanMessage, mapStoredMessageToChatMessage } from '@langchain/core/messages';
import { getAgentApp } from '@/agent/chatbot';

export class ChatService {
  /**
   * 解析用户消息，转换为 LangChain 消息对象
   */
  parseUserMessage(message: string | any[] | Record<string, any>): HumanMessage {
    if (typeof message === 'string') {
      // 字符串格式：创建 HumanMessage
      return new HumanMessage(message);
    }

    if (Array.isArray(message)) {
      // 数组格式：多模态内容（文本 + 图片）
      return new HumanMessage({ content: message });
    }

    if (typeof message === 'object' && message !== null) {
      // 对象格式：尝试重建 LangChain 消息
      try {
        return mapStoredMessageToChatMessage(message);
      } catch (error) {
        console.error('重建消息对象失败:', error);
        // 如果重建失败，尝试提取 content
        const content = message.content || message.kwargs?.content;
        if (!content) {
          throw new Error('消息对象缺少 content 字段');
        }
        return new HumanMessage(content);
      }
    }

    throw new Error('无效的消息格式');
  }

  /**
   * 流式获取聊天响应
   */
  async *streamChatResponse(input: ChatServiceInput, threadId: string) {
    try {
      const userMessage = this.parseUserMessage(input.message);

    const threadConfig = { configurable: { thread_id: threadId }, version: 'v2' };

    const app = await getAgentApp(input.model, input.tools as string[]);
    const compiledApp = app as any;

    for await (const event of await compiledApp.streamEvents(
      { messages: [userMessage] },
      threadConfig
    )) {

      if (event.event === 'on_chat_model_stream') {
        const chunk = event.data?.chunk;
        if (chunk?.content) {
          // 发送内容片段
          yield {
            type: 'chunk',
            content: chunk.content,
          };
        }
      } else if (event.event === 'on_chat_model_end') {
        const output = event.data?.output;
        if (output?.tool_calls && output.tool_calls.length > 0) {
          // 透传原始 tool_calls 数据
          yield {
            type: 'tool_calls',
            tool_calls: output.tool_calls,
          };
        }
      } else if (event.event === 'on_tool_end') {
        // 透传完整的工具执行信息
        yield {
          type: 'tool_result',
          name: event.name,
          data: event.data,
        };
      } else if (event.event === 'on_tool_error') {
        // 透传完整的错误信息
        yield {
          type: 'tool_error',
          name: event.name,
          data: event.data,
        };
      }
    }

    // 发送结束标记
    yield {
      type: 'end',
      status: 'success',
      thread_id: threadId,
    };
    } catch (error) {
      console.error('流式获取聊天响应失败', error);
      throw new Error('流式获取聊天响应失败');
    }
  }

  /**
   * 获取聊天历史
   */
  async getChatHistory(query: ChatHistoryQuery): Promise<ChatHistoryResult> {
    const { thread_id, authenticatedClient, userId } = query;

    try {
      // 获取应用实例
    const app = await getAgentApp();

    // 通过 graph.getState 获取历史
    const compiledApp = app as any;
    const state = await compiledApp.getState({
      configurable: { thread_id: thread_id as string },
    });

    const filterdMessages = (state?.values?.messages || [])
      .map((message) => {
        /**
         * LangChain直接返回的数据是运行时对象，不能直接使用，需要序列化
         * LangChain 的消息对象（AIMessage、HumanMessage 等）实现了序列化方法
         * JSON.stringify() 会调用这些对象的 toJSON() 或使用 LangChain 的序列化器
         */
        return JSON.parse(JSON.stringify(message));
      })
      .filter((message) => {
        return message.id.includes('HumanMessage') || message.id.includes('AIMessageChunk');
      });

    return {
      thread_id,
      history: filterdMessages,
    };
    } catch (error) {
      throw new Error('获取聊天历史失败');
    }
  
  }
}

/**
 * 单例实例
 */
export const chatService = new ChatService();
