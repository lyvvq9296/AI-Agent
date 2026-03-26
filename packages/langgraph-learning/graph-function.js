import { HumanMessage, SystemMessage, ToolMessage, tool } from "langchain";
import llm from "llm-core";
import { addMessages, entrypoint, getPreviousState, MemorySaver, task } from "@langchain/langgraph";
import z from "zod";
import { v4 as uuidv4 } from "uuid";

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

const CALL_MODE = "callLlm";
const CALL_TOOL = "callTool";

const config = {
  configurable: { thread_id: uuidv4() },
};
const checkpointer = new MemorySaver();

// 定义 callModel task
const callModel = task({ name: CALL_MODE }, async (messages) =>
  modelWithTools.invoke([
    new SystemMessage(
      "You are a helpful assistant tasked with performing arithmetic on a set of inputs.",
    ),
    ...messages,
  ]),
);

// 定义 callTool task
const callTool = task({ name: CALL_TOOL }, async (toolCall) => {
  const tool = toolsByName[toolCall.name];
  const result = await tool.invoke(toolCall.args || toolCall);

  const toolMessage = new ToolMessage({
    content: String(result),
    tool_call_id: toolCall.id,
  });

  return toolMessage;
});

// 定义 Agent
const agent = entrypoint(
  {
    name: "agent",
    checkpointer,
  },
  async (messages) => {
    // 将新消息添加到历史记录
    let conversationHistory = addMessages(getPreviousState() || [], messages);

    // 先调用 llm，使用完整的历史记录
    let modelResponse = await callModel(conversationHistory);

    // 一个无限循环
    while (true) {
      // 看是否需要 tool call
      if (!modelResponse.tool_calls?.length) {
        // 不需要则退出循环
        break;
      }

      // 执行 tool
      const toolResults = await Promise.all(
        modelResponse.tool_calls.map((toolCall) => callTool(toolCall)),
      );

      // 将 tool 执行结果再调用 llm
      conversationHistory = addMessages(conversationHistory, [modelResponse, ...toolResults]);
      modelResponse = await callModel(conversationHistory);
    }

    // 将 AI 回复添加到历史记录
    conversationHistory = addMessages(conversationHistory, [modelResponse]);

    // 返回包含 AI 回复的完整消息列表
    return conversationHistory;
  },
);

console.log("=== 第一轮对话 ===");
let result = await agent.invoke([new HumanMessage("Add 3 and 4.")], config);
for (const message of result) {
  console.log(`[${message.getType()}]: ${message.text}`);
}

console.log("\n=== 第二轮对话（测试记忆）===");
result = await agent.invoke([new HumanMessage("What did I ask you to do just now?")], config);
for (const message of result) {
  console.log(`[${message.getType()}]: ${message.text}`);
}
