import { useEffect, useRef, useState } from 'react';
import { Message, MessageContent, MessageContentItem } from '@/types';
import MarkdownRender from './MarkdownRender';
import { useSnackbar } from 'notistack';
import ToolUsageDisplay from './ToolUsageDisplay';

// 复制按钮组件
function CopyButton({ content }: { content: string }) {
  const { enqueueSnackbar } = useSnackbar();

  // 直接复制内容（优先文本，如果没有文本则复制图片）
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      enqueueSnackbar('内容已复制', { variant: 'success' });
      return;
    } catch {
      enqueueSnackbar('复制失败', { variant: 'error' });
      return;
    }
  };

  const hasContent = content.length > 0;

  if (!hasContent) {
    return null;
  }

  // 对于 assistant 消息，按钮放在消息气泡右上角（绝对定位）
  const isAssistant = true;

  return (
    <div className={isAssistant ? 'absolute top-2 left z-10' : 'relative'}>
      <button
        onClick={handleCopy}
        className={`cursor-pointer flex items-center justify-center rounded-md transition-all ${
          isAssistant
            ? 'w-6 h-6 bg-surface/90 hover:bg-surface border border-bd/20 text-text/70 hover:text-primary-4 opacity-0 group-hover:opacity-100'
            : 'w-7 h-7 bg-surface/80 hover:bg-surface border border-bd/30 text-text/60 hover:text-primary-4 opacity-0 group-hover:opacity-100 mb-1'
        }`}
        title="复制"
      >
        <svg
          className={isAssistant ? 'w-3.5 h-3.5' : 'w-4 h-4'}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      </button>
    </div>
  );
}

// 编辑按钮组件
function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="cursor-pointer w-6 h-6 flex items-center justify-center rounded-md bg-surface/90 hover:bg-surface border border-bd/20 text-text/70 hover:text-primary-4 opacity-0 group-hover:opacity-100 transition-all absolute top-2 left z-10"
      title="编辑"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
    </button>
  );
}

// 用户消息展示
function UserMessage({
  content,
  isEditing,
  onUpdate,
  onCancel,
}: {
  content: MessageContent;
  isEditing: boolean;
  onUpdate?: (newContent: string) => void;
  onCancel?: () => void;
}) {
  // 初始化编辑内容
  const getInitialText = () => {
    if (typeof content === 'string') {
      return content;
    }
    const textItems = content.filter((item) => item.type === 'text');
    return textItems.map((item) => (item.type === 'text' ? item.text : '')).join('\n');
  };

  const getInitialImages = () => {
    if (typeof content === 'string') {
      return [];
    }
    const imageItems = content.filter((item) => item.type === 'image_url');
    return imageItems.map((item) => (item.type === 'image_url' ? item.image_url.url : ''));
  };

  const [editText, setEditText] = useState(getInitialText);
  const [editImages, setEditImages] = useState<string[]>(getInitialImages);
  const textStyle = {
    fontSize: '0.875rem',
  };

  // 当进入编辑模式时，重新初始化编辑内容
  useEffect(() => {
    if (isEditing) {
      setEditText(getInitialText());
      setEditImages(getInitialImages());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  // 保存编辑
  const handleSave = () => {
    if (!onUpdate || !editText.trim()) return;

    const newContent = editText.trim() || '';

    onUpdate(newContent);
  };

  // 取消编辑
  const handleCancel = () => {
    onCancel?.();
  };

  // 删除图片
  const handleRemoveImage = (index: number) => {
    setEditImages((prev) => prev.filter((_, i) => i !== index));
  };

  if (isEditing) {
    return (
      <div className="space-y-3">
        {/* 文本输入框 */}
        <textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-surface border border-bd/50 rounded-lg text-text outline-none focus:border-primary-4 resize-none"
          rows={4}
          placeholder="输入消息..."
          autoFocus
        />

        {/* 图片预览 */}
        {editImages.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {editImages.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`预览 ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg border border-bd/30"
                />
                {/* <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                >
                  ×
                </button> */}
              </div>
            ))}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 text-sm text-text/60 hover:text-text border border-bd/30 rounded-lg hover:bg-surface transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 text-sm bg-primary-4 text-white rounded-lg hover:bg-primary-5 transition-colors"
          >
            发送
          </button>
        </div>
      </div>
    );
  }

  // 正常显示模式
  if (typeof content === 'string') {
    return (
      <div className="text-text/90" style={textStyle}>
        {content}
      </div>
    );
  }

  if (Array.isArray(content)) {
    return (
      <div>
        {content.map((item: MessageContentItem, index: number) => {
          return item.type === 'text' ? (
            <div className="text-text/90" style={textStyle} key={index}>
              {item.text}
            </div>
          ) : (
            <div key={index} className="mt-2">
              <img
                src={item.image_url.url}
                alt={`图片 ${index + 1}`}
                className="max-w-full max-h-80 rounded-lg border border-bd/30 object-contain w-[120px]"
              />
            </div>
          );
        })}
      </div>
    );
  }

  return null;
}

// AI消息展示
function AssistantMessage({ content }: { content: string }) {
  return <MarkdownRender content={content} />;
}

export default function ActiveMessageContent({
  messages,
  onMessageUpdate,
}: {
  messages: Message[];
  onMessageUpdate?: (messageId: string, newContent: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const lastMessageIdRef = useRef<string | undefined>(undefined);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

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
                  className={`group flex items-start gap-3 ${
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

                  {/* 消息气泡容器 */}
                  <div
                    className={`${
                      message.role === 'user'
                        ? 'relative flex flex-col max-w-[75%]'
                        : 'relative flex-1 w-[0px]'
                    }`}
                  >
                    {/* 消息气泡 */}
                    <div className="rounded-3xl px-5 py-3.5 bg-white/55 text-text/80 border border-bd/30 backdrop-blur-sm">
                      {/* Tool usage display for assistant messages */}
                      {message.role === 'assistant' &&
                        message.toolsUsed &&
                        message.toolsUsed.length > 0 && (
                          <div className="mb-3 -mx-2">
                            <ToolUsageDisplay toolsUsed={message.toolsUsed} />
                          </div>
                        )}
                      <div className="whitespace-pre-wrap break-words">
                        {message.role === 'assistant' ? (
                          <AssistantMessage content={message.content as string} />
                        ) : (
                          <UserMessage
                            content={message.content}
                            isEditing={editingMessageId === message.id}
                            onUpdate={(newContent) => {
                              onMessageUpdate?.(message.id, newContent);
                              setEditingMessageId(null);
                              scrollToBottom();
                            }}
                            onCancel={() => setEditingMessageId(null)}
                          />
                        )}
                      </div>
                      {message.isStreaming && (
                        <span className="inline-block w-1.5 h-4 bg-cyan-400 ml-1 align-middle animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
                      )}
                    </div>

                    {/* 消息工具栏 */}
                    <div className="relative min-h-[30px] px-2">
                      {/* 复制按钮（助手消息）或编辑按钮（用户消息） */}
                      {message.role === 'assistant' && (
                        <CopyButton content={message.content as string} />
                      )}
                      {message.role === 'user' && editingMessageId !== message.id && (
                        <EditButton onClick={() => setEditingMessageId(message.id)} />
                      )}
                    </div>
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
