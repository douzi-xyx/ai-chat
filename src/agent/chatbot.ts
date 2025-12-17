import {
  END,
  MessageGraph,
  MessagesAnnotation,
  START,
  StateGraph,
  MemorySaver,
} from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { AIMessage, BaseMessage } from '@langchain/core/messages';
import { db, initSessionTable } from './db';
import { SqliteSaver } from '@langchain/langgraph-checkpoint-sqlite';

const llm = new ChatOpenAI({
  model: process.env.OPENAI_MODEL_NAME,
  temperature: 0.7,
});

const llmNode = async (state: typeof MessagesAnnotation.State) => {
  const res = await llm.invoke(state.messages);

  return { messages: [res] };
};

const mockLLLMNode = async (state: BaseMessage[]) => {
  const lastMessage = state[state.length - 1];

  const response = new AIMessage({
    content: `你好，我是小爱同学，很高兴认识你。`,
  });

  return [response];
};

const workflow = new StateGraph(MessagesAnnotation)
  .addNode('llm', llmNode)
  .addEdge(START, 'llm')
  .addEdge('llm', END);
// .compile({
//   checkpointer: new MemorySaver(),
// });

let app: ReturnType<typeof workflow.compile>;

export const getAgentApp = () => {
  if (!app) {
    initSessionTable();
    app = workflow.compile({
      checkpointer: new SqliteSaver(db),
    });
  }

  return app;
};
