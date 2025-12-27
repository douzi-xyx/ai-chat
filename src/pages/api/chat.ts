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

      // Track tools used in this response
      const toolsUsedSet = new Set<string>();

      // console.log('message-----content', message, 'images count:', images?.length || 0);
      // Type assertion: compiled app has streamEvents method
      const compiledApp = app as any;
      for await (const event of await compiledApp.streamEvents(
        { messages: [new HumanMessage({ content: messageContent })] },
        { configurable: { thread_id }, version: 'v2' }
      )) {
        // Handle tool calls detection
        if (event.event === 'on_chat_model_stream') {
          const chunk = event.data?.chunk;
          const curChunkContent = chunk?.content;

          // Check for tool_calls in the chunk
          if (chunk?.tool_calls && Array.isArray(chunk.tool_calls)) {
            for (const toolCall of chunk.tool_calls) {
              if (toolCall.name) {
                toolsUsedSet.add(toolCall.name);
              }
            }
            // Send tool_usage event if tools detected
            if (toolsUsedSet.size > 0) {
              const toolUsageData = JSON.stringify({
                type: 'tool_usage',
                tools: Array.from(toolsUsedSet),
              });
              res.write(`data: ${toolUsageData}\n\n`);
              if (typeof (res as any).flush === 'function') {
                (res as any).flush();
              }
            }
          }

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

        // Also listen for on_tool_start events
        if (event.event === 'on_tool_start') {
          const toolName = event.data?.name;
          if (toolName) {
            toolsUsedSet.add(toolName);
            // Send tool_usage event immediately when tool starts
            const toolUsageData = JSON.stringify({
              type: 'tool_usage',
              tools: Array.from(toolsUsedSet),
            });
            res.write(`data: ${toolUsageData}\n\n`);
            if (typeof (res as any).flush === 'function') {
              (res as any).flush();
            }
          }
        }
      }

      // 发送结束信号
      res.write(`data: ${JSON.stringify({ type: 'end', thread_id })}\n\n`);
      res.end();
    } catch {
      // console.error('流式输出错误：', error);
      res.write(`data: ${JSON.stringify({ type: 'error', message: '服务器错误' })}\n\n`);
      res.end();
    }
  } else if (method === 'GET') {
    // 获取当前会话id的历史消息列表
    const { conversationId } = req.query;
    const app = await getAgentApp();
    // Type assertion: compiled app has getState method
    const compiledApp = app as any;
    const state = await compiledApp.getState({
      configurable: { thread_id: conversationId as string },
    });
    // console.log('state', state);
    res.status(200).json({ data: state?.values?.messages || [] });
  }
}
