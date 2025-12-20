import { useEffect, useState } from 'react';
import { Conversation, Message } from '@/types';
import { useSnackbar } from 'notistack';
import { getAllSessions } from '@/agent/db';

const ACTIVE_CONVERSATION_KEY = 'active-conversation-id';

export default function useConversation() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>();
  const { enqueueSnackbar } = useSnackbar();

  // 初始化时读取
  useEffect(() => {
    const saved = localStorage.getItem(ACTIVE_CONVERSATION_KEY);
    if (saved) {
      setActiveConversationId(saved);
    }
  }, []);

  const activeConversation =
    conversations.find((conv) => conv.id === activeConversationId) || conversations[0];

  const handleChangeActiveConversationId = (id: string) => {
    setActiveConversationId(id);
    localStorage.setItem(ACTIVE_CONVERSATION_KEY, id);
  };

  const handleNewConversation = async () => {
    try {
      // console.log('handleNewConversation');
      const name = '新对话';
      const response = await fetch('/api/session', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      const data = await response.json();
      const { data: sessionData, message } = data;

      enqueueSnackbar(message, {
        variant: 'success',
      });

      const { id, created_at } = sessionData || {};

      const newConv: Conversation = {
        id,
        title: name,
        messages: [],
        updatedAt: new Date(created_at),
      };
      setConversations((prev) => [newConv, ...prev]);
      handleChangeActiveConversationId(newConv.id);
    } catch (error) {
      // console.log('error', error);
    }
  };

  const getSessions = async () => {
    try {
      const response = await fetch('/api/sessions');
      const data = await response.json();
      const { data: sessionData, message } = data;

      enqueueSnackbar(message, {
        variant: 'success',
      });

      setConversations(
        (sessionData || []).map((item) => ({
          id: item.id,
          title: item.name,
          messages: [],
          updatedAt: new Date(item.created_at),
        }))
      );
    } catch (error) {
      // console.log('error', error);
      // enqueueSnackbar(message, {
      //   variant: 'error',
      // });
    }
  };

  // 首次加载，获取会话列表
  useEffect(() => {
    const fetchSessions = async () => {
      await getSessions();
    };
    fetchSessions();
  }, []);

  // 当前会话id发生变化时，掉接口获取当前会话id的messages列表
  const getMessages = async (id?: string) => {
    if (!id) return;

    try {
      const res = await fetch(`/api/chat?conversationId=${id}`);
      const data = await res.json();
      const { data: messages } = data;
      const formattedMessages = (messages || []).map((item: any) => {
        const { id, kwargs } = item;
        const isUser = id.includes('HumanMessage');
        const content = kwargs.content;
        const messageId = kwargs.id;
        const message: Message = {
          id: messageId,
          content,
          role: isUser ? 'user' : 'assistant',
        };
        return message;
      });
      setConversations((prev) =>
        prev.map((conv) => (conv.id === id ? { ...conv, messages: formattedMessages } : conv))
      );
      // console.log('messages', messages);
    } catch (error) {}
  };
  useEffect(() => {
    getMessages(activeConversationId);
  }, [activeConversationId]);

  return {
    conversations,
    setConversations,
    activeConversationId,
    setActiveConversationId: handleChangeActiveConversationId,
    activeConversation,
    handleNewConversation,
  };
}
