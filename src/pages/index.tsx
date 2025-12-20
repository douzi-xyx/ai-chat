import { useState } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import ButtonGlobal from '../components/AnimationButton';
import styles from '../styles/index.module.css';
import ThemeSwitcher from '../components/ThemeSwitcher';
import useSendMessage from '../hooks/useSendMessage';
import useConversation from '@/hooks/useConversation';
import ActiveMessageContent from '@/components/ActiveMessageContent';
import Header from '@/components/Header';
import UserInput from '@/components/UserInput';
import { toolSets } from '@/agent/tools/toolSets';

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

/**
 * 根据工具 ID 返回对应的图标
 */
function getToolIcon(toolId: string): string {
  const iconMap: Record<string, string> = {
    calculator: '🔢',
    weather: '🌤️',
    get_date_time: '🕐',
    search: '🔍',
  };
  return iconMap[toolId] || '🛠️';
}

const toolList = Object.entries(toolSets)
  .filter(([_, tool]) => tool.enabled)
  .map(([toolId, tool]) => ({
    id: toolId,
    name: tool.name,
    icon: getToolIcon(toolId),
    description: tool.description,
  }));

export default function Home() {
  const {
    conversations,
    setConversations,
    handleNewConversation,
    activeConversationId,
    setActiveConversationId,
    activeConversation,
  } = useConversation();

  const { handleKeyPress, handleSendMessage, inputValue, setInputValue } = useSendMessage({
    activeConversationId,
    setActiveConversationId,
    setConversations,
  });

  const [model, setModel] = useState(modelList[0]?.value);
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
        <div className="w-64 border-r border-bd/50 bg-background/20 backdrop-blur-md flex flex-col">
          <div className="p-4 border-b border-bd/30">
            <button
              onClick={handleNewConversation}
              className="cursor-pointer w-full px-4 py-2.5  bg-primary-4 text-white rounded-2xl transition-all font-medium active:scale-[0.98]"
            >
              + 新建对话
            </button>
            {/* <ButtonGlobal>
              
            </ButtonGlobal> */}
          </div>
          <div className="flex-1 overflow-y-auto bg-background">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`p-3 cursor-pointer border-b border-bd/20 hover:bg-primary-5 transition-all hover:text-white ${
                  activeConversationId === conv.id
                    ? 'bg-primary-4 border-l border-l-teal-300/60 text-white'
                    : 'text-title'
                }`}
              >
                <div className={`font-medium text-sm truncate`}>{conv.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 右侧内容区域 */}
        <div className="flex-1 flex flex-col">
          {/* 历史对话记录列表 */}
          <div className="flex-1 p-6 min-h-0 pb-0">
            <ActiveMessageContent messages={activeConversation?.messages || []} />
          </div>

          {/* 对话输入框 */}
          <UserInput
            toolList={toolList}
            list={modelList}
            model={model}
            setModel={setModel}
            inputValue={inputValue}
            setInputValue={setInputValue}
            handleKeyPress={handleKeyPress}
            handleSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
}
