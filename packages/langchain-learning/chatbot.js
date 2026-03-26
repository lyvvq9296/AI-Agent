import { END, MemorySaver, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";
import { v4 as uuidv4 } from "uuid";
import llm from "llm-core";
import { trimMessages } from "langchain";

const trimmer = trimMessages({
  maxTokens: 10,
  strategy: "last",
  tokenCounter: (msgs) => msgs.length,
  includeSystem: true,
  allowPartial: false,
  startOn: "human",
});

const callModel = async (state) => {
  console.log("Input messages length: ", state.messages.length);
  const trimmedMessages = trimmer(state.messages);
  console.log("Trimmed messages length: ", trimmedMessages.length);
  const res = await llm.invoke(trimmedMessages);
  return { messages: res };
};

const workflow = new StateGraph(MessagesAnnotation)
  .addNode("model", callModel)
  .addEdge(START, "model")
  .addEdge("model", END);

const memory = new MemorySaver();
const app = workflow.compile({
  checkpointer: memory,
});

const config = { configurable: { thread_id: uuidv4() } };

let input = [{ role: "user", content: "你好,我是 lyvvq" }];
let output = await app.invoke({ messages: input }, config);
console.log("output", output.messages[output.messages.length - 1]);

input = [{ role: "user", content: "我叫什么名字" }];
output = await app.invoke({ messages: input }, config);
console.log("output", output.messages[output.messages.length - 1]);
