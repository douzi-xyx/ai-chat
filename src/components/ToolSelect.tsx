import { useEffect, useRef, useState } from 'react';
import { Tool } from '@/types';

interface ToolSelectProps {
  toolList: Tool[];
  selectedTools: string[];
  onSelectedToolsChange: (tools: string[]) => void;
}

export default function ToolSelect({
  toolList,
  selectedTools,
  onSelectedToolsChange,
}: ToolSelectProps) {
  const [toolOpen, setToolOpen] = useState(false);
  const toolDropdownRef = useRef<HTMLDivElement | null>(null);

  // 点击外部关闭下拉
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        toolOpen &&
        toolDropdownRef.current &&
        !toolDropdownRef.current.contains(e.target as Node)
      ) {
        setToolOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [toolOpen]);

  // 切换工具选择
  const toggleTool = (toolId: string) => {
    const newSelectedTools = selectedTools.includes(toolId)
      ? selectedTools.filter((id) => id !== toolId)
      : [...selectedTools, toolId];
    onSelectedToolsChange(newSelectedTools);
  };

  return (
    <div className="relative ml-4" ref={toolDropdownRef}>
      <div
        className="flex items-center gap-1 px-2 py-1 rounded-md cursor-pointer hover:bg-primary-3/10 text-xs text-text/70 hover:text-primary-5 transition-colors"
        onClick={() => setToolOpen((v) => !v)}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <span>工具</span>
        {selectedTools.length > 0 && (
          <span className="px-1.5 py-0.5 rounded-full bg-primary-4 text-white text-[10px] min-w-[18px] text-center">
            {selectedTools.length}
          </span>
        )}
        <svg
          className={`w-3 h-3 transition-transform ${toolOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {toolOpen && (
        <div className="absolute bottom-[110%] left-0 w-[280px] max-h-[300px] overflow-y-auto rounded-lg border border-bd/30 bg-surface/95 shadow-xl backdrop-blur-md z-20">
          <div className="p-2">
            <div className="text-xs font-medium text-text/70 mb-2 px-2">选择工具</div>
            <div className="space-y-1">
              {toolList.map((tool) => {
                const isSelected = selectedTools.includes(tool.id);
                return (
                  <div
                    key={tool.id}
                    className={`px-3 py-2 rounded-md cursor-pointer flex items-center gap-2 hover:bg-primary-3/20 transition-colors ${
                      isSelected ? 'bg-primary-3/15' : ''
                    }`}
                    onClick={() => toggleTool(tool.id)}
                  >
                    <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                      {isSelected ? (
                        <svg
                          className="w-4 h-4 text-primary-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <div className="w-4 h-4 rounded border border-bd/40" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{tool.icon}</span>
                        <span
                          className={`text-sm truncate ${
                            isSelected ? 'text-primary-5 font-medium' : 'text-text'
                          }`}
                        >
                          {tool.name}
                        </span>
                      </div>
                      {tool.description && (
                        <div className="text-xs text-text/60 mt-0.5 truncate">
                          {tool.description}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
