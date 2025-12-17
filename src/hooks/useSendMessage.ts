import { Dispatch, SetStateAction, useState } from 'react';
import { Conversation, Message } from '../../types';
import { enqueueSnackbar } from 'notistack';

export default function useSendMessage({
  activeConversationId,
  setActiveConversationId,
  setConversations,
}: {
  activeConversationId?: string;
  setActiveConversationId: Dispatch<SetStateAction<string | undefined>>;
  setConversations: Dispatch<SetStateAction<Conversation[]>>;
}) {
  const [inputValue, setInputValue] = useState<string>('');

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
    };

    let nowConversationId: string | undefined = activeConversationId;

    // 如果没有会话id，先创建会话id
    if (!activeConversationId) {
      const name = '新对话';
      const response = await fetch('/api/session', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      const data = await response.json();
      const { data: sessionData, message } = data;

      nowConversationId = sessionData?.id;
      setActiveConversationId(nowConversationId);
      setConversations((conversations) => [
        ...conversations,
        {
          id: sessionData.id,
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

    // 创建 AI 消息占位符
    const assistantMessageId = (Date.now() + 1).toString();
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
      body: JSON.stringify({ message: inputValue, conversationId: nowConversationId }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    while (true) {
      if (!reader) break;
      const result = await reader.read();
      if (result.done) break;
      const { value } = result;
      console.log('value', value);
      const text = decoder.decode(value);
      const lines = text.split('\n\n').filter(Boolean);

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const content = line.split('data: ')[1];
          if (content) {
            const data = JSON.parse(content);
            if (!data) continue;
            if (data.type === 'chunk') {
              const chunkContent = data.content;
              console.log('chunkContent', chunkContent);
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
              console.log('end');
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
              console.error('error', data.message);
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
              enqueueSnackbar(data.message, {
                variant: 'error',
              });
              break;
            }
          }
        }
      }
    }

    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return {
    handleSendMessage,
    inputValue,
    setInputValue,
    handleKeyPress,
  };
}
