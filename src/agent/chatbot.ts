import { END, MessagesAnnotation, START, StateGraph } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { createLangChainTools } from './utils/tools';
import path from 'path';
import Database from 'better-sqlite3';
import { SupabaseSaver } from '@skroyc/langgraph-supabase-checkpointer';
import { supabase } from '../database/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

const createModel = (model?: string) => {
  const [provider, modelName] = model?.split(':') || ['openai', process.env.OPENAI_MODEL_NAME];
  // console.log('provider-----modelName', provider, modelName);

  if (provider === 'google' && modelName) {
    return new ChatGoogleGenerativeAI({
      model: modelName as string,
      temperature: 0.7,
      apiKey: process.env.GOOGLE_API_KEY,
      streaming: true, //好像不设置也能流式输出
    });
  }

  return new ChatOpenAI({
    model: modelName,
    apiKey: process.env.OPENAI_API_KEY,
    temperature: 0.7,
    streaming: true,
    configuration: {
      baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    },
  });
};

const createWorkflow = async (modelId?: string, toolIds?: string[]) => {
  const model = createModel(modelId);

  const langChainTools = await createLangChainTools(toolIds);

  const modelWithTools = langChainTools?.length ? model.bindTools(langChainTools) : model;
  // console.log('langChainTools', langChainTools, toolIds);
  const llmNode = async (state: typeof MessagesAnnotation.State) => {
    try {
      // console.log('llmNode', state.messages);
      const res = await modelWithTools.invoke(state.messages);

      return { messages: [res] };
    } catch (error) {
      // console.error('chatbotNode 错误详情:', error);
      console.error('错误栈:', error instanceof Error ? error.stack : '无栈信息');
      throw error;
    }
  };

  if (langChainTools?.length) {
    const toolNode = new ToolNode(langChainTools);

    const shouldCallToolNode = async (state: typeof MessagesAnnotation.State) => {
      const lastMessage = state.messages[state.messages.length - 1];
      // console.log('shouldCallToolNode', lastMessage.tool_calls);

      if ((lastMessage as any).tool_calls && (lastMessage as any).tool_calls.length > 0) {
        return 'tool';
      }
      return END;
    };

    return new StateGraph(MessagesAnnotation)
      .addNode('llm', llmNode)
      .addNode('tool', toolNode)
      .addEdge(START, 'llm')
      .addConditionalEdges('llm', shouldCallToolNode, {
        tool: 'tool',
        [END]: END,
      })
      .addEdge('tool', 'llm');
    // .addEdge('llm', END);
  } else {
    return new StateGraph(MessagesAnnotation)
      .addNode('llm', llmNode)
      .addEdge(START, 'llm')
      .addEdge('llm', END);
  }

  // return (
  //   new StateGraph(MessagesAnnotation)
  //     // .addNode('tool', toolNode)
  //     .addNode('firstModel', firstModelNode)
  //     .addNode('tool', toolNode)
  //     .addNode('llm', llmNode)
  //     .addEdge(START, 'firstModel')
  //     .addEdge('firstModel', 'tool')
  //     .addEdge('tool', 'llm')
  //     .addEdge('llm', END)
  // .addEdge(START, 'llm')
  // .addConditionalEdges('llm', shouldCallToolNode)
  // .addEdge('tool', END)
  // .addEdge('tool', 'llm')
  // .addEdge('llm', END)
  // );
};

// 全局存储不同配置的workflow

const workflowCache = new Map<string, ReturnType<typeof createWorkflow>>();
const dbPath = path.resolve(process.cwd(), 'chat_history.db');
export const db = new Database(dbPath);
let checkpointer: SupabaseSaver;
function getCheckpointer(client?: SupabaseClient) {
  if (client) {
    return new SupabaseSaver(client);
  }
  // console.log('判断是否要初始化 SqliteSaver', !checkpointer);
  if (!checkpointer) {
    console.log('初始化 SupabaseSaver');
    try {
      checkpointer = new SupabaseSaver(supabase);
      console.log('SupabaseSaver 初始化成功');
    } catch (error) {
      console.error('SupabaseSaver 初始化失败:', error);
      throw error;
    }
  }

  return checkpointer;
}

export const getAgentApp = async (model?: string, toolIds?: string[]) => {
  // 初始化checkpointer
  const checkpointer = getCheckpointer();
  const sortedToolIds = toolIds?.sort().join(',');
  const cacheKey = `${model || 'default'}-${sortedToolIds || 'none'}`;
  // workflowCache.set(cacheKey, cacheKey);
  // console.log('workflowCache-----keys', cacheKey, Array.from(workflowCache.keys()));
  const cachedWorkflow = workflowCache.get(cacheKey);
  // console.log('cachedWorkflow---------', cachedWorkflow);
  if (cachedWorkflow) {
    return cachedWorkflow;
  }

  const workflow = await createWorkflow(model, toolIds);
  // console.log('workflow---------', workflow);
  const app = workflow.compile({
    checkpointer,
  });

  if (workflowCache.size > 20) {
    const firstKey = workflowCache.keys().next().value;
    workflowCache.delete(firstKey || '');
    // console.log('删除缓存:', firstKey);
  }
  workflowCache.set(cacheKey || '', app as any);

  return app;
};
