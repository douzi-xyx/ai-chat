import type { NextApiRequest, NextApiResponse } from 'next';
import { getAgentApp } from '@/agent/chatbot';
import { HumanMessage } from '@langchain/core/messages';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === 'POST') {
    // 发送用户消息
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 立即刷新响应头
    res.flushHeaders();

    try {
      const { message, conversationId: thread_id } = JSON.parse(req.body);

      const app = await getAgentApp();

      for await (const event of await app.streamEvents(
        { messages: [new HumanMessage({ content: message })] },
        { configurable: { thread_id }, version: 'v2' }
      )) {
        if (event.event === 'on_chat_model_stream') {
          const curChunkContent = event.data?.chunk?.content;
          if (curChunkContent) {
            // console.log('curChunkContent', curChunkContent);
            const data = JSON.stringify({ type: 'chunk', content: curChunkContent });
            res.write(`data: ${data}\n\n`); // SSE 格式
            // 关键：立即刷新，确保数据立即发送 解决流式响应没有立即发送到前端的问题
            if (typeof (res as any).flush === 'function') {
              (res as any).flush();
            }
          }
        }
      }

      // 发送结束信号
      res.write(`data: ${JSON.stringify({ type: 'end', thread_id })}\n\n`);
      res.end();
    } catch (error) {
      console.error('流式输出错误：', error);
      res.write(`data: ${JSON.stringify({ type: 'error', message: '服务器错误' })}\n\n`);
      res.end();
    }
  } else if (method === 'GET') {
    // 获取当前会话id的历史消息列表
    const { conversationId } = req.query;
    const app = await getAgentApp();
    const state = await app.getState({
      configurable: { thread_id: conversationId as string },
    });
    console.log('state', state);
    res.status(200).json({ data: state?.values?.messages || [] });
  }
}
