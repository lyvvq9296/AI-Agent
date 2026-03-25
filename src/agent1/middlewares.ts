import { END } from "@langchain/langgraph";
import {
  modelCallLimitMiddleware,
  modelFallbackMiddleware,
  piiMiddleware,
  summarizationMiddleware,
  toolRetryMiddleware,
} from "langchain";

const summarization = summarizationMiddleware({
  model: "gpt-4o-mimi",
  trigger: { tokens: 300 },
  keep: { messages: 2 },
});

const piiEmail = piiMiddleware("email", {
  strategy: "redact",
  applyToInput: true,
  applyToOutput: false,
});

const piiCreditCard = piiMiddleware("credit_card", {
  strategy: "redact",
  applyToInput: true,
});

const modelFallback = modelFallbackMiddleware("gpt-4.1", "gpt-4.1-mini");

const toolRetry = toolRetryMiddleware({
  maxRetries: 2,
  backoffFactor: 2,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  jitter: true,
  onFailure: "continue",
});

const callLimit = modelCallLimitMiddleware({
  runLimit: 10,
  threadLimit: 100,
  exitBehavior: "end",
});

export { summarization, piiEmail, piiCreditCard, modelFallback, toolRetry, callLimit };
