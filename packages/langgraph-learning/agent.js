import { createAgent, tool } from "langchain";
import z from "zod";
import llm from "llm-core";
import { MemorySaver } from "@langchain/langgraph";

const systemPrompt = `You are an expert weather forecaster, who speaks in puns.

You have access to two tools:

- get_weather_for_location: use this to get the weather for a specific location
- get_user_location: use this to get the user's location

If a user asks you for the weather, make sure you know the location. If you can tell from the question that they mean wherever they are, use the get_user_location tool to find their location.`;

const getWeather = tool(async (input) => `It's always sunny in ${input.city}!`, {
  name: "get_weather_for_location",
  description: "Get the weather for a given location",
  schema: z.object({
    location: z.string().describe("The location to get the weather for"),
  }),
});
const getLocation = tool(
  async (_, config) => {
    const { user_id } = config.context;
    return user_id == 1 ? "Florida" : "SF";
  },
  {
    name: "get_user_location",
    description: "Get the user's location",
  },
);

const responseFormat = z.object({
  punny_response: z.string(),
  weather_response: z.string().optional(),
});

const checkpointer = new MemorySaver();
const agent = createAgent({
  tools: [
    // new TavilySearch({
    //   maxResults: 3,
    //   topic: "general",
    // }),
    getWeather,
    getLocation,
  ],
  model: llm,
  checkpointer,
  systemPrompt,
  responseFormat,
});

const config = {
  configurable: { thread_id: "1" },
  context: { user_id: "1" },
};
let res = await agent.invoke(
  {
    messages: [{ role: "user", content: "外面天气怎么样?" }],
  },
  config,
);
console.log(res.structuredResponse);

res = await agent.invoke(
  {
    messages: [{ role: "user", content: "谢谢" }],
  },
  config,
);
console.log(res.structuredResponse);
