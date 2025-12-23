import { useState } from 'react';
import { Conversation } from '@/types';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onSelect: (id: string) => void;
  onNewConversation: () => void;
  onEdit?: (id: string, newTitle: string) => void;
  onDelete?: (id: string) => void;
}

export default function ConversationList({
  conversations,
  activeConversationId,
  onSelect,
  onNewConversation,
  onEdit,
  onDelete,
}: ConversationListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleStartEdit = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditValue(conv.title);
  };

  const handleSaveEdit = (id: string) => {
    if (editValue.trim()) {
      onEdit?.(id, editValue.trim());
    }
    setEditingId(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这个会话吗？')) {
      onDelete?.(id);
    }
  };

  return (
    <div
      className={`relative border-r border-bd/50 bg-background/20 backdrop-blur-md flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* 展开/收起按钮 */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 z-10 w-6 h-6 bg-surface border border-bd/50 rounded-full flex items-center justify-center text-text/60 hover:text-primary-4 hover:border-primary-4 transition-all shadow-sm"
        title={isCollapsed ? '展开侧边栏' : '收起侧边栏'}
      >
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* 新建对话按钮 */}
      <div className="p-4 border-b border-bd/30">
        <button
          onClick={onNewConversation}
          className={`cursor-pointer bg-primary-4 text-white rounded-2xl transition-all font-medium active:scale-[0.98] hover:bg-primary-5 ${
            isCollapsed ? 'w-8 h-8 p-0 flex items-center justify-center' : 'w-full px-4 py-2.5'
          }`}
          title={isCollapsed ? '新建对话' : undefined}
        >
          {isCollapsed ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          ) : (
            '+ 新建对话'
          )}
        </button>
      </div>

      {/* 会话列表 */}
      <div className="flex-1 overflow-y-auto bg-background">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`group relative cursor-pointer border-b border-bd/20 hover:bg-primary-5 transition-all hover:text-white ${
              isCollapsed ? 'p-2 flex items-center justify-center' : 'p-3'
            } ${
              activeConversationId === conv.id ? 'bg-primary-4 border-l-2 text-white' : 'text-title'
            }`}
            title={isCollapsed ? conv.title : undefined}
          >
            {isCollapsed ? (
              // 收起模式 - 显示首字母或图标
              <div className="w-8 h-8 rounded-full bg-primary-3/30 flex items-center justify-center text-sm font-medium">
                {conv.title.charAt(0).toUpperCase()}
              </div>
            ) : editingId === conv.id ? (
              // 编辑模式
              <div className="-my-1">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit(conv.id);
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                  onBlur={() => handleSaveEdit(conv.id)}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                  className="w-full px-2 py-1 text-sm bg-surface border border-bd/50 rounded text-text outline-none focus:border-primary-4"
                />
              </div>
            ) : (
              // 正常显示模式
              <>
                <div className="font-medium text-sm truncate pr-14">
                  {conv.title === '新对话' ? `新对话-${conv.id}` : conv.title}
                </div>

                {/* 悬停显示的操作按钮 */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* 编辑按钮 */}
                  <button
                    onClick={(e) => handleStartEdit(conv, e)}
                    className="p-1.5 rounded hover:bg-white/20 transition-colors"
                    title="编辑"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>

                  {/* 删除按钮 */}
                  <button
                    onClick={(e) => handleDelete(conv.id, e)}
                    className="p-1.5 rounded hover:bg-red-500/30 transition-colors"
                    title="删除"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
