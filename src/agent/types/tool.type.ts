import { z } from 'zod';

export type ToolType = 'custom' | 'langchain' | 'mcp';

export type LangChainToolConfig = {
  importPath: string; // 工具导入路径
  className?: string; // 工具导出的类，如果不传，则使用默认导出项
  options?: Record<string, unknown>; //工具初始化选项
};

export type MCPServerConfig = {
  command: string;
  args: string[];
  transport?: 'stdio' | 'sse' | 'http';
  env?: Record<string, string>;
};

export type MCPToolConfig = {
  /**
   * MCP构建工具
   */
  mcpServer?: string; // MCP服务器的名称
  mcpConfig?: MCPServerConfig; // MCP服务器的配置
};

/**
 * 所有工具配置的类型定义，包括：自定义工具、Langchain生态工具、MCP工具
 */
export type UnifiedToolConfig = {
  id: string;
  name: string;
  description: string;
  icon?: string;
  enabled?: boolean;
  type: ToolType;

  /**
   * 自定义工具的参数定义
   */
  schema?: z.ZodSchema;
  handler?: (params?: any) => Promise<string> | string;
  options?: Record<string, unknown>;

  /**
   * langchain构建工具
   */
  langchainTool?: LangChainToolConfig;
} & MCPToolConfig;

export type CustomToolConfig<T = Record<string, unknown>> = {
  name: string;
  description: string;
  schema: z.ZodSchema;
  handler: (params?: T) => Promise<string> | string;
  options?: Record<string, unknown>;
  enabled?: boolean;
};
