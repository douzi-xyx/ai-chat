import { Dispatch, SetStateAction, useState } from 'react';
import { Conversation, Message, MessageContent, MessageContentItem, TextFieldValue } from '@/types';
import { useSnackbar } from 'notistack';

// 将 File 转换为 base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export default function useSendMessage({
  activeConversationId,
  setActiveConversationId,
  setConversations,
}: {
  activeConversationId?: string;
  setActiveConversationId: (id: string) => void;
  setConversations: Dispatch<SetStateAction<Conversation[]>>;
}) {
  const { enqueueSnackbar } = useSnackbar();
  const handleSendMessage = async (
    valus: TextFieldValue,
    model: string,
    selectedTools: string[],
    cb?: () => void
  ) => {
    const { inputValue, images } = valus;
    if (!inputValue?.trim() && images?.length === 0) return;

    const dateId = Date.now().toString();

    // 处理图片，转换为 base64（提前处理，用于构建用户消息）
    const imageDataList: { base64: string; mimeType: string }[] = [];
    for (const image of images || []) {
      const base64 = await fileToBase64(image);
      imageDataList.push({
        base64,
        mimeType: image.type,
      });
    }

    // 构建用户消息内容
    let userContent: MessageContent;
    if (imageDataList.length > 0) {
      const contentItems: MessageContentItem[] = [];
      if (inputValue?.trim()) {
        contentItems.push({ type: 'text', text: inputValue });
      }
      for (const img of imageDataList) {
        contentItems.push({
          type: 'image_url',
          image_url: { url: img.base64 },
        });
      }
      userContent = contentItems;
    } else {
      userContent = inputValue || '';
    }

    const userMessage: Message = {
      id: 'user-' + dateId,
      content: userContent,
      role: 'user',
    };

    let nowConversationId: string | undefined = activeConversationId;

    // 如果没有会话id，先创建会话id
    if (!activeConversationId) {
      const name = inputValue?.slice(0, 30) || '新对话';
      const response = await fetch('/api/session', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      const data = await response.json();
      const { data: sessionData, message } = data;

      nowConversationId = sessionData?.id;
      setConversations((conversations) => [
        ...conversations,
        {
          id: nowConversationId || '',
          title: name,
          messages: [userMessage],
          updatedAt: new Date(sessionData.created_at),
        },
      ]);
    } else {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversationId
            ? {
                ...conv,
                messages: [...conv.messages, userMessage],
                updatedAt: new Date(),
              }
            : conv
        )
      );
    }
    // setInputValue('');
    cb?.();

    // 创建 AI 消息占位符
    const assistantMessageId = 'assistant-' + dateId;
    const assistantMessage: Message = {
      id: assistantMessageId,
      content: '',
      role: 'assistant',
      isStreaming: true,
    };

    // 先添加空消息，用于打字机效果
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === nowConversationId
          ? {
              ...conv,
              messages: [...conv.messages, assistantMessage],
              updatedAt: new Date(),
            }
          : conv
      )
    );

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: inputValue,
        conversationId: nowConversationId,
        model,
        toolIds: selectedTools,
        images: imageDataList,
      }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    // 缓存区，缓存不完整的json 字符串
    let buffer = '';

    while (true) {
      if (!reader) break;
      const result = await reader.read();
      if (result.done) break;
      const { value } = result;
      // console.log('value', value);
      const text = decoder.decode(value);
      buffer += text;
      const lines = buffer.split('\n\n');
      // console.log('lines - 缓存buffer之前', { lines: JSON.parse(JSON.stringify(lines)), buffer });
      // 把最后一行不完整的json内容放到buffer中
      buffer = lines.pop() || '';
      // console.log('lines - 缓存buffer之后', { lines: JSON.parse(JSON.stringify(lines)), buffer });
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const content = line.split('data: ')[1];
          // console.log('content', content);
          if (content) {
            const data = JSON.parse(content);
            if (!data) continue;
            if (data.type === 'chunk') {
              const chunkContent = data.content;
              // console.log('chunkContent', chunkContent);
              setConversations((prev) =>
                prev.map((conv) =>
                  conv.id === nowConversationId
                    ? {
                        ...conv,
                        messages: conv.messages.map((msg) =>
                          msg.id === assistantMessageId
                            ? { ...msg, content: msg.content + chunkContent }
                            : msg
                        ),
                        updatedAt: new Date(),
                      }
                    : conv
                )
              );
            } else if (data.type === 'end') {
              // console.log('end');
              setConversations((prev) =>
                prev.map((conv) =>
                  conv.id === nowConversationId
                    ? {
                        ...conv,
                        messages: conv.messages.map((msg) => ({ ...msg, isStreaming: false })),
                      }
                    : conv
                )
              );
              break;
            } else if (data.type === 'error') {
              // console.error('error', data.message);
              setConversations((prev) =>
                prev.map((conv) =>
                  conv.id === nowConversationId
                    ? {
                        ...conv,
                        messages: conv.messages.map((msg) => ({ ...msg, isStreaming: false })),
                      }
                    : conv
                )
              );
              enqueueSnackbar('发生错误', {
                variant: 'error',
              });
              break;
            }
          }
        }
      }
    }

    if (nowConversationId) {
      setActiveConversationId(nowConversationId);
    }
  };

  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    values: TextFieldValue,
    model: string,
    selectedTools: string[],
    cb?: () => void
  ) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(values, model, selectedTools, cb);
    }
  };

  return {
    handleSendMessage,
    handleKeyPress,
  };
}
