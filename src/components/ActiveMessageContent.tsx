import { useEffect, useRef, useState } from 'react';
import { Message } from '../../types';
import MarkdownRender from './MarkdownRender';

export default function ActiveMessageContent({ messages }: { messages: Message[] }) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const lastMessageIdRef = useRef<string | undefined>(undefined);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  };

  useEffect(() => {
    const lastId = messages?.[messages.length - 1]?.id;
    if (!lastId) return;

    lastMessageIdRef.current = lastId;

    if (autoScroll) {
      scrollToBottom('smooth');
    }
  }, [messages, autoScroll]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const nearBottom = distanceToBottom < 120; // 阈值：距离底部 120px 内自动滚动
    setAutoScroll(nearBottom);
  };

  return (
    <div className={`relative max-w-4xl mx-auto h-full flex flex-col`}>
      <div className=" backdrop-blur-md flex-1 flex flex-col overflow-hidden">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-6 scroll-smooth"
        >
          <div className="space-y-4">
            {messages?.length === 0 ? (
              <div className="flex items-center justify-center min-h-full text-purple-400">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-2 via-primary-3 to-primary-4 flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <p className="text-xl font-semibold text-title">开始新的对话</p>
                  <p className="text-sm mt-2 text-text">在下方输入框中输入消息开始聊天</p>
                </div>
              </div>
            ) : (
              messages?.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* 头像 */}
                  {message.role !== 'user' && (
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-primary-2 to-primary-4`}
                    >
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                    </div>
                  )}

                  {/* 消息气泡 */}
                  <div
                    className={`${message.role === 'user' ? 'max-w-[75%]' : 'flex-1 w-[0px]'} rounded-3xl px-5 py-3.5 bg-white/55 text-text/80 border border-bd/30 backdrop-blur-sm`}
                  >
                    <div className="whitespace-pre-wrap break-words">
                      <MarkdownRender content={message.content} />
                    </div>
                    {message.isStreaming && (
                      <span className="inline-block w-1.5 h-4 bg-cyan-400 ml-1 align-middle animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        {!autoScroll && messages?.length > 0 && (
          <button
            onClick={() => {
              setAutoScroll(true);
              scrollToBottom('smooth');
            }}
            className="absolute bottom-5 right-5 px-3 py-2 rounded-xl bg-primary-4 text-white text-xs shadow-lg hover:bg-primary-5 transition-all"
          >
            回到底部
          </button>
        )}
      </div>
    </div>
  );
}
