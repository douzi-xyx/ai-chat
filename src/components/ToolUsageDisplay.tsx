// Note: MUI needs to be installed: pnpm add @mui/material @emotion/react @emotion/styled @mui/icons-material
// Temporarily using a simple collapsible implementation until MUI is installed
import { useState } from 'react';
import { toolSets } from '@/agent/tools/toolSets';

// Import getToolIcon function from index.tsx
// Note: This function is defined in pages/index.tsx, we'll need to extract it or duplicate the logic
function getToolIcon(toolId: string): string {
  const iconMap: Record<string, string> = {
    calculator: '🔢',
    weather: '🌤️',
    get_date_time: '🕐',
    search: '🔍',
    search_nearby: '🔍',
    get_location: '📍',
    route_plan: '🗺️',
  };
  return iconMap[toolId] || '🛠️';
}

interface ToolUsageDisplayProps {
  toolsUsed: string[];
}

export default function ToolUsageDisplay({ toolsUsed }: ToolUsageDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Error handling: Return null if toolsUsed is missing or empty
  if (!toolsUsed || !Array.isArray(toolsUsed) || toolsUsed.length === 0) {
    return null;
  }

  // Deduplicate tools (T010: tool deduplication logic)
  const uniqueTools = Array.from(
    new Set(toolsUsed.filter((tool) => tool && typeof tool === 'string'))
  );

  if (uniqueTools.length === 0) {
    return null;
  }

  // Map tool IDs to display information with fallback handling (T011: fallback for unknown tool IDs)
  const toolInfo = uniqueTools.map((toolId) => {
    // Handle missing or invalid tool IDs
    if (!toolId || typeof toolId !== 'string') {
      return {
        id: 'unknown',
        name: '未知工具',
        icon: '🛠️',
        description: '',
      };
    }

    const toolConfig = toolSets[toolId as keyof typeof toolSets];
    return {
      id: toolId,
      name: toolConfig?.name || toolId, // Fallback to toolId if name not found
      icon: getToolIcon(toolId),
      description: toolConfig?.description || '',
    };
  });

  return (
    <div className="mb-4">
      <div className="bg-surface/50 border border-bd/20 rounded-lg overflow-hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-3 hover:bg-surface/70 transition-colors text-left"
          aria-expanded={isExpanded}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text/90">使用的工具 ({toolInfo.length})</span>
            <div className="flex gap-1">
              {toolInfo.slice(0, 3).map((tool) => (
                <span key={tool.id} className="text-lg" title={tool.name}>
                  {tool.icon}
                </span>
              ))}
              {toolInfo.length > 3 && (
                <span className="text-sm text-text/60">+{toolInfo.length - 3}</span>
              )}
            </div>
          </div>
          <svg
            className={`w-5 h-5 text-text/70 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isExpanded && (
          <div className="pt-2 pb-4 px-3 border-t border-bd/20">
            <div className="space-y-2">
              {toolInfo.map((tool) => (
                <div
                  key={tool.id}
                  className="flex items-center gap-3 p-2 rounded-md bg-surface/30 hover:bg-surface/50 transition-colors"
                >
                  <span className="text-xl" title={tool.name}>
                    {tool.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text/90 truncate" title={tool.name}>
                      {tool.name}
                    </div>
                    {tool.description && (
                      <div className="text-xs text-text/60 line-clamp-1" title={tool.description}>
                        {tool.description}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
