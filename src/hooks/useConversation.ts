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

  // 编辑会话标题
  const handleEditConversation = async (id: string, newTitle: string) => {
    try {
      const response = await fetch(`/api/session/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTitle }),
      });
      const data = await response.json();

      if (response.ok) {
        setConversations((prev) =>
          prev.map((conv) => (conv.id === id ? { ...conv, title: newTitle } : conv))
        );
        enqueueSnackbar(data.message || '修改成功', { variant: 'success' });
      } else {
        enqueueSnackbar(data.message || '修改失败', { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar('修改失败', { variant: 'error' });
    }
  };

  // 删除会话
  const handleDeleteConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/session/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (response.ok) {
        // 如果删除的是当前激活的会话，切换到上一个会话
        if (activeConversationId === id) {
          const currentIndex = conversations.findIndex((conv) => conv.id === id);
          const remaining = conversations.filter((conv) => conv.id !== id);
          if (remaining.length > 0) {
            // 优先切换到上一个会话，如果没有上一个则切换到下一个（即新的当前位置）
            const newIndex = currentIndex > 0 ? currentIndex - 1 : 0;
            handleChangeActiveConversationId(remaining[newIndex].id);
          } else {
            setActiveConversationId(undefined);
            localStorage.removeItem(ACTIVE_CONVERSATION_KEY);
          }
        }
        setConversations((prev) => prev.filter((conv) => conv.id !== id));
        enqueueSnackbar(data.message || '删除成功', { variant: 'success' });
      } else {
        enqueueSnackbar(data.message || '删除失败', { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar('删除失败', { variant: 'error' });
    }
  };

  return {
    conversations,
    setConversations,
    activeConversationId,
    setActiveConversationId: handleChangeActiveConversationId,
    activeConversation,
    handleNewConversation,
    handleEditConversation,
    handleDeleteConversation,
  };
}
