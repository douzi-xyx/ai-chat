import type { NextApiRequest, NextApiResponse } from 'next';
import { chatService } from '@/services/chat.service';

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

      for await (const event of await chatService.streamChatResponse(
        {
          message: messageContent,
          model,
          tools: toolIds,
        },
        thread_id
      )) {
        // console.log('event', event);
        const data = JSON.stringify(event);
        res.write(`data: ${data}\n\n`);
        if (typeof (res as any).flush === 'function') {
          (res as any).flush();
        }
      }

      res.end();
    } catch {
      // console.error('流式输出错误：', error);
      res.write(`data: ${JSON.stringify({ type: 'error', message: '服务器错误' })}\n\n`);
      res.end();
    }
  } else if (method === 'GET') {
    // 获取当前会话id的历史消息列表
    const { conversationId } = req.query;
    console.log('conversationId', conversationId);
    try {
      
    const { history } = await chatService.getChatHistory({ thread_id: conversationId as string });
    return res.status(200).json({ data: history });
    } catch (error) {
      return res.status(500).json({ message: typeof error === 'string' ? error : '获取聊天历史失败' });
    }
  }
}
