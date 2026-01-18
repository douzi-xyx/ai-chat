import { useState } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import useSendMessage from '../hooks/useSendMessage';
import useConversation from '@/hooks/useConversation';
import ActiveMessageContent from '@/components/ActiveMessageContent';
import Header from '@/components/Header';
import UserInput from '@/components/UserInput';
import ConversationList from '@/components/ConversationList';
import { getEnabledTools } from '@/agent/config/unified-tool.config';
import { withAuth } from '@/lib/withAuth';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const modelList = [
  {
    name: 'qwen3-next-80b-a3b-instruct',
    value: 'openai:qwen3-next-80b-a3b-instruct',
  },
  {
    name: 'qwen3-max',
    value: 'openai:qwen3-max',
  },
  {
    name: 'qwen-image-plus',
    value: 'openai:qwen-image-plus',
  },
  {
    name: 'gemini-3-pro-preview',
    value: 'google:gemini-3-pro-preview',
  },
  {
    name: 'gemini-3-pro-preview',
    value: 'google:gemini-3-pro-preview',
  },
];

const toolList = getEnabledTools();

export default function Home() {
  const {
    conversations,
    setConversations,
    handleNewConversation,
    activeConversationId,
    setActiveConversationId,
    activeConversation,
    handleEditConversation,
    handleDeleteConversation,
  } = useConversation();

  const { handleKeyPress, handleSendMessage } = useSendMessage({
    activeConversationId,
    setActiveConversationId,
    setConversations,
  });

  const [model, setModel] = useState(modelList[0]?.value);

  // 更新消息内容
  const handleMessageUpdate = (messageId: string, newContent: string) => {
    if (!activeConversationId) return;

    handleSendMessage({ inputValue: newContent }, model, []);
  };

  // console.log('activeConversation', activeConversation);
  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} flex flex-col h-screen font-sans relative overflow-hidden`}
    >
      {/* 导航栏 */}
      <div className="border-b border-bd/50 py-4">
        <Header />
      </div>
      {/* 内容区域，分为左侧会话列表和右侧内容区域 */}
      <div className="flex flex-1 min-h-0">
        {/* 左侧会话列表 */}
        <ConversationList
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelect={setActiveConversationId}
          onNewConversation={handleNewConversation}
          onEdit={handleEditConversation}
          onDelete={handleDeleteConversation}
        />

        {/* 右侧内容区域 */}
        <div className="flex-1 flex flex-col">
          {/* 历史对话记录列表 */}
          <div className="flex-1 p-6 min-h-0 pb-0">
            <ActiveMessageContent
              messages={activeConversation?.messages || []}
              onMessageUpdate={handleMessageUpdate}
            />
          </div>

          {/* 对话输入框 */}
          <UserInput
            toolList={toolList}
            list={modelList}
            model={model}
            setModel={setModel}
            handleKeyPress={handleKeyPress}
            handleSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
}

export const  getServerSideProps = withAuth(async ({auth})  => {
  console.log('auth-----', auth);
  if (!auth.user) {
      return {
          redirect: {
              destination: '/login',
              permanent: false,
          },
      };
  }
  
  return { props: {user: auth.user} };
})
