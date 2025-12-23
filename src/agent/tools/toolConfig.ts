import { toolSets } from './toolSets';
import { DynamicStructuredTool } from '@langchain/core/tools';

export const createLangChainTools = (toolIds?: string[]) => {
  if (!toolIds || toolIds.length === 0) {
    // console.log('没有选择工具');
    return [];
  }

  const langChainTools: DynamicStructuredTool[] = [];
  for (const toolId of toolIds) {
    const toolConfig = toolSets[toolId];
    const isToolEnabled = toolConfig.enabled;
    if (isToolEnabled) {
      langChainTools.push(
        new DynamicStructuredTool({
          name: toolConfig.name,
          description: toolConfig.description,
          schema: toolConfig.schema,
          func: async (input: any) => {
            try {
              const result = await toolConfig.handler(input);
              return result;
            } catch (error) {
              // console.error(`工具${toolConfig.name}执行失败:`, error);
              return `工具${toolConfig.name}执行失败: ${error}`;
            }
          },
        })
      );
    }
  }
  return langChainTools;
};
