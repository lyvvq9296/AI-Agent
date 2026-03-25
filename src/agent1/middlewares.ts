import { modelFallbackMiddleware, piiMiddleware, summarizationMiddleware } from "langchain";

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

export { summarization, piiEmail, piiCreditCard, modelFallback };
