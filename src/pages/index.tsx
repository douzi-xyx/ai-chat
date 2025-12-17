import { useState } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import ButtonGlobal from '../components/AnimationButton';
import styles from '../styles/index.module.css';
import ThemeSwitcher from '../components/ThemeSwitcher';
import useSendMessage from '../hooks/useSendMessage';
import useConversation from '@/hooks/useConversation';
import ActiveMessageContent from '@/components/ActiveMessageContent';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

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
  console.log('activeConversation', activeConversation);
  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} flex flex-col h-screen font-sans relative overflow-hidden`}
    >
      {/* 导航栏 */}
      <div className="border-b border-bd/50 py-4">
        <div className="flex flex-row justify-between pl-[276px] pr-[20px] mx-auto">
          <div className="flex items-center gap-4">
            <span className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-3 to-primary-4 text-white font-medium text-sm">
              LangGraph
            </span>
            <span className="text-primary-5">•</span>
            <span className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-3 to-primary-4 text-white font-medium text-sm">
              AI Chat
            </span>
          </div>
          <ThemeSwitcher />
        </div>
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
          <div className="p-4 pt-0">
            <div className="max-w-4xl mx-auto">
              {/* 输入框容器 - 带动画边框 */}
              <div className="relative">
                {/* 动画边框效果 */}
                <div
                  className={`absolute ${styles['message-content-area-border-aimation']} border-bd/30`}
                >
                  <div
                    className={`w-[100px] h-[100px] absolute bg-gradient-to-l from-primary-5 via-primary-4 to-primary-2 ${styles['animation-rect-line-block']}`}
                  ></div>
                </div>

                {/* 美观的输入框外观 */}
                <div className="relative bg-surface/80 backdrop-blur-md rounded-2xl border border-bd/30 shadow-lg hover:shadow-xl transition-all duration-300 focus-within:border-primary-4/50 focus-within:shadow-primary-3/20">
                  {/* 顶部渐变装饰线 */}
                  <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-primary-4/30 to-transparent rounded-full" />

                  {/* 输入区域 */}
                  <div className="p-4">
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="输入消息... (按 Enter 发送，Shift+Enter 换行)"
                      className="w-full bg-transparent border-none outline-none resize-none text-text placeholder-text/40 text-sm leading-relaxed"
                      rows={3}
                    />
                  </div>

                  {/* 底部操作栏 */}
                  <div className="flex items-center justify-between px-4 py-3 border-t border-bd/20">
                    {/* 左侧提示 */}
                    <div className="flex items-center gap-2 text-xs text-text/50">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      <span>Enter 发送 · Shift+Enter 换行</span>
                    </div>

                    {/* 发送按钮 */}
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-4 to-primary-5 hover:from-primary-5 hover:to-primary-5 disabled:from-bd disabled:to-bd disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 font-medium text-sm shadow-md hover:shadow-lg active:scale-[0.98]"
                    >
                      <span>发送</span>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
