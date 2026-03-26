import { SystemMessage, tool } from "langchain";
import z from "zod";
import llm from "../langchain-learning/llm/index.js";
import { registry } from "@langchain/langgraph/zod";
import { END, MemorySaver, MessagesZodMeta, START, StateGraph } from "@langchain/langgraph";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { v4 as uuidv4 } from "uuid";

const TOOL_NODE = "toolNode";
const LLM_CALL = "llmCall";

// Define tools
const add = tool(async ({ num1, num2 }) => num1 + num2, {
  name: "add",
  description: "Add two numbers together",
  schema: z.object({
    num1: z.number().describe("First number"),
    num2: z.number().describe("Second number"),
  }),
});

const multiply = tool(async ({ num1, num2 }) => num1 * num2, {
  name: "multiply",
  description: "Multiply two numbers together",
  schema: z.object({
    num1: z.number().describe("First number"),
    num2: z.number().describe("Second number"),
  }),
});

const divide = tool(async ({ num1, num2 }) => num1 / num2, {
  name: "divide",
  description: "Divide two numbers together",
  schema: z.object({
    num1: z.number().describe("First number"),
    num2: z.number().describe("Second number"),
  }),
});

const toolsByName = {
  [add.name]: add,
  [multiply.name]: multiply,
  [divide.name]: divide,
};
const tools = Object.values(toolsByName);
const modelWithTools = llm.bindTools(tools);

// 定义 model 节点
// llmCall是流程图的一个节点,是一个函数,定义了这个节点的执行逻辑
const llmCall = async (state) => {
  const newMessages = await modelWithTools.invoke([
    new SystemMessage(
      "You are a helpful assistant tasked with performing arithmetic on a set of inputs.",
    ),
    ...state.messages,
  ]);
  const newLlmCalls = (state.llmCalls ?? 0) + 1;

  return {
    messages: newMessages,
    llmCalls: newLlmCalls,
  };
};

// 定义 tool 节点
const toolNode = async (state) => {
  const lastMessage = state.messages[state.messages.length - 1];
  if (lastMessage == null || !AIMessage.isInstance(lastMessage)) {
    return { messages: [] };
  }

  const result = [];
  for (const toolCall of lastMessage.tool_calls ?? []) {
    const tool = toolsByName[toolCall.name];
    const observation = await tool.invoke(toolCall);
    result.push(observation);
  }

  return { messages: result };
};

// 定义条件判断
const shouldContinue = async (state) => {
  const lastMessage = state.messages[state.messages.length - 1];
  if (lastMessage == null || !AIMessage.isInstance(lastMessage)) {
    return END;
  }

  // If the LLM makes a tool call, then perform an action
  if (lastMessage.tool_calls?.length) {
    return TOOL_NODE;
  }

  // Otherwise, we stop (reply to the user)
  return END;
};

// 定义 state
// 定义 MessagesState 它将用于存储 AI messages 消息列表，和 llmCalls llm 调用的次数
const MessageState = z.object({
  messages: z.array(z.custom()).register(registry, MessagesZodMeta),
  llmCalls: z.number().optional(),
});
// 定义 workflow
const graph = new StateGraph(MessageState)
  .addNode(TOOL_NODE, toolNode)
  .addNode(LLM_CALL, llmCall)
  .addEdge(START, LLM_CALL)
  .addConditionalEdges(LLM_CALL, shouldContinue, [TOOL_NODE, END])
  .addEdge(TOOL_NODE, END);

const checkpointer = new MemorySaver();
// 调用 agent
const agent = graph.compile({ checkpointer });
// Invoke
const config = { configurable: { thread_id: uuidv4() } };
let result = await agent.invoke(
  {
    messages: [new HumanMessage("Add 3 and 4.")],
  },
  config,
);

for (const message of result.messages) {
  console.log(`[${message.getType()}]: ${message.text}`);
}
result = await agent.invoke(
  {
    messages: [new HumanMessage("What do I let you do just now?")],
  },
  config,
);

for (const message of result.messages) {
  console.log(`[${message.getType()}]: ${message.text}`);
}
