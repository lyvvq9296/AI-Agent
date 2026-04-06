import { StateGraph, END, START } from "@langchain/langgraph";
import { ChatDeepSeek } from "@langchain/deepseek";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

// Define the state structure for our agent
type AgentState = {
  messages: (HumanMessage | AIMessage)[];
};

// Create the DeepSeek LLM instance
// DeepSeek uses OpenAI-compatible API
const llm = new ChatDeepSeek({
  model: "deepseek-chat",
  temperature: 0,
});

// Define the agent node function
async function agentNode(state: AgentState) {
  const { messages } = state;

  // Generate response using DeepSeek
  const response = await llm.invoke(messages);

  return {
    messages: [...messages, response],
  };
}

// Create a simple workflow with proper typing
const workflow = new StateGraph<AgentState>({
  channels: {
    messages: {
      reducer: (x: (HumanMessage | AIMessage)[], y: (HumanMessage | AIMessage)[]) => x.concat(y),
      default: () => [],
    },
  },
});

workflow.addNode("agent", agentNode).addEdge(START, "agent").addEdge("agent", END);

// Compile the graph
const app = workflow.compile();

export default app;
