import {
  getLangChainToolsConfig,
  getMCPServerConfig,
  getToolConfigById,
} from '../config/unified-tool.config';
import { DynamicStructuredTool, StructuredTool } from '@langchain/core/tools';
import { UnifiedToolConfig } from '../types/tool.type';

/**
 * LangChain工具缓存
 */
const langChainToolsCache = new Map<string, StructuredTool>();

/**
 * 预加载LangChain工具
 */
const preloadLangChainTools = async () => {
  const langChainToolConfigs = getLangChainToolsConfig();
  if (langChainToolConfigs.length === 0) {
    console.log('[工具预加载] 没有找到LangChain工具');
  } else {
    console.log('[工具预加载] 找到LangChain工具');
    for (const langChainToolConfig of langChainToolConfigs) {
      try {
        const { importPath, className, options } = langChainToolConfig.langchainTool!;
        console.log(`[预加载] 正在加载: ${langChainToolConfig.name} from ${importPath}`);

        // 使用条件导入，让 webpack 能够静态分析
        // eslint-disable-next-line @next/next/no-assign-module-variable
        let module: any;
        switch (importPath) {
          case '@langchain/tavily':
            module = await import('@langchain/tavily');
            break;
          // 添加其他可能的导入路径
          default:
            console.error(`[预加载] 不支持的导入路径: ${importPath}`);
            continue;
        }

        let ToolClass: any;
        if (className) {
          ToolClass = module[className];
        } else {
          ToolClass =
            module.default || Object.values(module).find((v: any) => typeof v === 'function');
        }

        if (!ToolClass) {
          console.error(`[预加载] 无法找到工具类: ${importPath}`);
          continue;
        }

        const toolInstance = new ToolClass(options);
        langChainToolsCache.set(langChainToolConfig.id, toolInstance);
        console.log(`[预加载] 成功加载: ${langChainToolConfig.name}`);
      } catch (error) {
        console.error(`[预加载] 加载${langChainToolConfig.name}失败:`, error);
      }
    }
    console.log(`[工具预加载]完成，成功加载${langChainToolsCache.size}个LangChain工具`);
  }
};

let mcpToolsCache: DynamicStructuredTool[] | null = [];
/**
 * 预加载MCP工具
 */
const preloadMCPTools = async () => {
  if (mcpToolsCache && mcpToolsCache.length > 0) {
    console.log('[工具预加载] 已经加载了${mcpToolsCache.size}个MCP工具');
    return;
  }

  const mcpToolConfigs = getMCPServerConfig();
  const serverName = Object.keys(mcpToolConfigs);
  if (serverName.length === 0) {
    console.log('[工具预加载] 没有找到MCP服务器');
    return;
  }

  try {
    console.log(`[工具预加载] 开始加载${serverName.length}个MCP服务器`);
    const { MultiServerMCPClient } = await import('@langchain/mcp-adapters');
    const MCP_TIMEOUT = 15000;
    const mcpClient = new MultiServerMCPClient({
      mcpServers: mcpToolConfigs,
    });

    const timeoutPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('MCP服务器连接超时'));
      }, MCP_TIMEOUT);
    });

    const tools = await Promise.race([timeoutPromise, mcpClient.getTools()]);

    mcpToolsCache = tools as DynamicStructuredTool[];
    console.log(`[工具预加载] 成功加载${mcpToolsCache.length}个MCP工具`);
  } catch (error) {
    console.error(`[工具预加载] 加载MCP服务器失败:`, error);
  }
};

/**
 * 预加载工具
 */
const preloadTools = async () => {
  /**
   * LangChain工具预加载
   */
  await preloadLangChainTools();

  /**
   * MCP工具预加载
   */
  await preloadMCPTools();
};

let isInitialized = false;
const ensureToolsInitialized = async () => {
  if (isInitialized) return;
  isInitialized = true;

  await preloadTools();
};

/**
 * 转换自定义工具配置为langChain工具
 */
const createCustomToolsToLangChainTools = (toolConfig?: UnifiedToolConfig) => {
  if (!toolConfig) {
    console.error(`工具配置不存在`);
    return null;
  }
  return new DynamicStructuredTool({
    name: toolConfig.id,
    description: toolConfig.description,
    schema: toolConfig.schema,
    func: async (input: any) => {
      try {
        console.log(`工具${toolConfig.name}执行:`, input);
        const result = await toolConfig.handler!(input);
        console.log(`工具${toolConfig.name}执行结果:`, result);
        return result;
      } catch (error) {
        console.error(`工具${toolConfig.name}执行失败:`, error);
        return `工具${toolConfig.name}执行失败: ${error}`;
      }
    },
  });
};

export const createLangChainTools = async (toolIds?: string[]) => {
  await ensureToolsInitialized();

  if (!toolIds || toolIds.length === 0) {
    console.log('没有选择工具');
    return [];
  }

  const langChainTools: DynamicStructuredTool[] = [];

  for (const toolId of toolIds) {
    const toolConfig = getToolConfigById(toolId);

    if (!toolConfig) {
      console.error(`工具${toolId}不存在`);
      continue;
    }

    const isToolEnabled = toolConfig?.enabled;
    if (!isToolEnabled) {
      console.log(`工具${toolId}未启用`);
      continue;
    }

    if (toolConfig?.type === 'mcp') {
      continue;
    }

    if (toolConfig?.type === 'custom') {
      const customLangChainTool = createCustomToolsToLangChainTools(toolConfig);
      if (customLangChainTool) {
        langChainTools.push(customLangChainTool as DynamicStructuredTool);
      }
    } else if (toolConfig?.type === 'langchain' && toolConfig?.langchainTool) {
      const langChainTool = langChainToolsCache.get(toolId);
      if (langChainTool) {
        langChainTools.push(langChainTool as DynamicStructuredTool);
      } else {
        console.error(`工具${toolId}不存在`);
      }
    }
  }

  const needMCPTools = toolIds.filter((toolId) => getToolConfigById(toolId)?.type === 'mcp');
  if (needMCPTools) {
    const mcpTools = mcpToolsCache || [];
    if (mcpTools.length > 0) {
      langChainTools.push(...mcpTools);
      console.log(`成功加载${mcpTools.length}个MCP工具`);
    } else {
      console.error(`MCP工具未加载`);
    }
  }

  return langChainTools;
};
