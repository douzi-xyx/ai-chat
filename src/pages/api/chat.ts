import type { NextApiRequest, NextApiResponse } from 'next';
import { getAgentApp } from '@/agent/chatbot';
import { HumanMessage } from '@langchain/core/messages';

// 配置 API 路由以支持更大的请求体（用于图片上传）
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

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
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { message, conversationId: thread_id, model, toolIds, images } = body;

      const app = await getAgentApp(model, toolIds as string[]);

      // 构建消息内容，支持多模态（文本 + 图片）
      let messageContent: any = message;
      if (images && images.length > 0) {
        messageContent = [
          { type: 'text', text: message || '请描述这张图片' },
          ...images.map((img: { base64: string; mimeType: string }) => ({
            type: 'image_url',
            image_url: {
              url: img.base64,
            },
          })),
        ];
      }

      // console.log('message-----content', message, 'images count:', images?.length || 0);
      for await (const event of await app.streamEvents(
        { messages: [new HumanMessage({ content: messageContent })] },
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
      // console.error('流式输出错误：', error);
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
    // console.log('state', state);
    res.status(200).json({ data: state?.values?.messages || [] });
  }
}
