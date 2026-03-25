import { createAgent } from "langchain";
import z from "zod";
import { MemorySaver } from "@langchain/langgraph";
import llm from "../langchain-learning/llm/index.js";
import { getWeather, processRefund, queryOrder } from "./tools.ts";
import { modelFallback, piiCreditCard, piiEmail, summarization, toolRetry } from "./middlewares.ts";

const systemPrompt = `
你是一个只能客服助手, 负责帮助用户处理以下事务:
1. 查询订单状态
2. 查询天气信息
3. 为订单发起退款操作

回答要简洁明了, 使用中文. 如果用户的请求不在你的能力范围内, 礼貌的告知
`;

const ResponseFormat = z.object({
  reply: z.string().describe("给用户的自然语言回复"),
  actionType: z
    .enum(["order_query", "weather_query", "refund", "general"])
    .describe("本次操作的类型"),
  success: z.boolean().describe("操作是否成功"),
});

const checkpointer = new MemorySaver();
const agent = createAgent({
  systemPrompt,
  model: llm,
  tools: [queryOrder, getWeather, processRefund],
  responseFormat: ResponseFormat as any,
  checkpointer,
  middleware: [summarization, piiEmail, piiCreditCard, modelFallback, toolRetry],
});

export { agent };
