import { UnifiedToolConfig } from '../types/tool.type';
import { calculatorTool } from '../tools/calculator.tool';
import { getDateTimeTool } from '../tools/getDateTime.tool';
import { weatherTool } from '../tools/weather.tool';

export const unifiedToolConfig: UnifiedToolConfig[] = [
  {
    id: calculatorTool.name,
    name: '计算器',
    icon: '🔢',
    description: calculatorTool.description,
    type: 'custom',
    schema: calculatorTool.schema,
    enabled: calculatorTool.enabled,
    handler: calculatorTool.handler,
  },
  {
    id: getDateTimeTool.name,
    name: '获取当前日期和时间',
    icon: '🕐',
    description: getDateTimeTool.description,
    type: 'custom',
    schema: getDateTimeTool.schema,
    enabled: getDateTimeTool.enabled,
    handler: getDateTimeTool.handler,
  },
  {
    id: weatherTool.name,
    name: '查询天气',
    icon: '🌤️',
    description: weatherTool.description,
    type: 'custom',
    schema: weatherTool.schema,
    enabled: weatherTool.enabled,
    handler: weatherTool.handler,
  },

  /**
   * LangChain预构建的工具
   */
  {
    id: 'tavily_search',
    name: 'Tavily实时搜索工具',
    icon: '🔍',
    description: '使用Tavily搜索引擎进行实时搜索',
    type: 'langchain',
    enabled: true,
    langchainTool: {
      importPath: '@langchain/tavily',
      className: 'TavilySearch',
      options: {
        maxResults: 5,
        searchDepth: 'basic',
        includeAnswer: true,
        includeImages: false,
        includeRawContent: false,
      },
    },
  },

  /**
   * MCP工具
   */
  {
    id: 'mui-mcp',
    name: '获取最新mui文档内容',
    icon: '📚',
    description: '使用mui-mcp获取mui文档内容',
    type: 'mcp',
    enabled: true,
    mcpServer: 'mui-mcp',
    mcpConfig: {
      command: 'npx',
      args: ['-y', '@mui/mcp@latest'],
      transport: 'stdio',
    },
  },
  // {
  //   id: 'amap-maps',
  //   name: '高的地图获取位置信息',
  //   icon: '🗺️',
  //   description: '使用amap-maps获取位置信息',
  //   type: 'mcp',
  //   enabled: true,
  //   mcpServer: 'amap-maps',
  //   mcpConfig: {
  //     args: ['-y', '@amap/amap-maps-mcp-server'],
  //     command: 'npx',
  //     env: {
  //       AMAP_MAPS_API_KEY: '',
  //     },
  //   },
  // },
  {
    id: 'filesystem',
    name: '文件系统',
    icon: '📂',
    description: '使用文件系统获取文件信息',
    type: 'mcp',
    enabled: true,
    mcpServer: 'filesystem',
    mcpConfig: {
      transport: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem', process.cwd()],
    },
  },
  {
    id: 'figma-mcp',
    name: '获取figma设计稿信息',
    icon: '🎨',
    description: '使用figma-mcp获取figma设计稿信息',
    type: 'mcp',
    enabled: true,
    mcpServer: 'figma-mcp',
    mcpConfig: {
      command: 'npx',
      args: [
        '-y',
        'figma-developer-mcp',
        `--figma-api-key=${process.env.FIGMA_API_KEY || ''}`,
        '--port=3333',
        '--stdio',
      ],
    },
  },
];

/**
 * 获取所有启用的工具
 */
export const getEnabledTools = () => {
  return unifiedToolConfig.filter((tool) => tool.enabled);
};

/**
 * 获取所有启用的LangChain工具配置
 */
export const getLangChainToolsConfig = () => {
  return unifiedToolConfig.filter(
    (tool) => tool.type === 'langchain' && tool.enabled && tool.langchainTool
  );
};

/**
 * 获取所有启用的MCP工具配置
 */
export const getMCPToolConfigs = () => {
  return unifiedToolConfig.filter(
    (tool) => tool.type === 'mcp' && tool.enabled && tool.mcpServer && tool.mcpConfig
  );
};

/**
 * 获取所有启用的MCP服务器配置
 */
export const getMCPServerConfig = () => {
  const mcpToolConfigs = getMCPToolConfigs();
  const config: Record<string, any> = {};

  for (const mcpToolConfig of mcpToolConfigs) {
    const { mcpServer, mcpConfig } = mcpToolConfig;
    config[mcpServer!] = {
      command: mcpConfig!.command,
      args: mcpConfig!.args,
      transport: mcpConfig!.transport || 'stdio',
    };
  }

  return config;
};

/**
 * 获取工具配置by id
 */
export const getToolConfigById = (toolId?: string) => {
  if (!toolId) return null;
  return unifiedToolConfig.find((tool) => tool.id === toolId);
};
