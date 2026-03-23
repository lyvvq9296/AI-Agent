import { createAgent, tool } from "langchain";
import z from "zod";
import llm from "../langchain-learning/llm/index.js";

const getWeather = tool(async (input) => `It's always sunny in ${input.city}!`, {
  name: "get_weather",
  description: "Get the weather for a given city",
  schema: z.object({
    city: z.string().describe("The city to get the weather for"),
  }),
});

const agent = createAgent({
  tools: [getWeather],
  model: llm,
});

const res = await agent.invoke({
  messages: [{ role: "user", content: "What's the weather in Shanghai?" }],
});
console.log(res);
