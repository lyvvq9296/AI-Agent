import { summarizationMiddleware } from "langchain";
import llm from "../langchain-learning/llm/index.js";

const summarization = summarizationMiddleware({
  model: llm,
  trigger: { tokens: 300 },
  keep: { messages: 10 },
});

export { summarization };
