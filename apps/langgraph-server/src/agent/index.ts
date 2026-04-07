import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { ChatDeepSeek } from "@langchain/deepseek";
import { BaseMessage, ToolMessage } from "@langchain/core/messages";
import { TavilySearch } from "@langchain/tavily";

// Initialize Tavily search tool
const tavilySearchTool = new TavilySearch({
  maxResults: 3,
  topic: "general",
});

const tools = [tavilySearchTool];

// Create tools map for lookup
const toolsByName = Object.fromEntries(tools.map((tool) => [tool.name, tool]));

// Define MessagesAnnotation using Annotation.Root
const MessagesAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
    default: () => [],
  }),
});

// Define ConfigurationSchema using Annotation.Root
const ConfigurationSchema = Annotation.Root({});

// Define state type
type State = typeof MessagesAnnotation.State & typeof ConfigurationSchema.State;

// Create LLM model instance and bind tools
const model = new ChatDeepSeek({
  model: "deepseek-chat",
  temperature: 0,
}).bindTools(tools);

// Define callModel node
async function callModel(state: State) {
  const messages = state.messages;
  const response = await model.invoke(messages);
  return { messages: [response] };
}

// Define tools node - custom implementation to handle tool calls
async function toolsNode(state: State) {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1];
  const toolMessages: ToolMessage[] = [];

  if (lastMessage && "tool_calls" in lastMessage && Array.isArray(lastMessage.tool_calls)) {
    // Execute all tool calls
    for (const toolCall of lastMessage.tool_calls) {
      const tool = toolsByName[toolCall.name];
      if (tool) {
        const result = await tool.invoke(toolCall.args);
        toolMessages.push(
          new ToolMessage({
            content: JSON.stringify(result),
            tool_call_id: toolCall.id,
          }),
        );
      }
    }
  }

  return { messages: toolMessages };
}

// Define routeModelOutput function
function routeModelOutput(state: State): "tools" | typeof END {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1];

  // Check if the last message has tool calls
  if (
    lastMessage &&
    "tool_calls" in lastMessage &&
    Array.isArray(lastMessage.tool_calls) &&
    lastMessage.tool_calls.length > 0
  ) {
    return "tools";
  }

  // Otherwise end the workflow
  return END;
}

// Create the workflow using MessagesAnnotation and ConfigurationSchema
const workflow = new StateGraph(MessagesAnnotation, ConfigurationSchema)
  // Define the two nodes we will cycle between
  .addNode("callModel", callModel)
  .addNode("tools", toolsNode)
  // Set the entrypoint as `callModel`
  // This means that this node is the first one called
  .addEdge(START, "callModel")
  .addConditionalEdges(
    // First, we define the edges' source node. We use `callModel`.
    // This means these are the edges taken after the `callModel` node is called.
    "callModel",
    // Next, we pass in the function that will determine the sink node(s), which
    // will be called after the source node is called.
    routeModelOutput,
  )
  // This means that after `tools` is called, `callModel` node is called next.
  .addEdge("tools", "callModel");

// Compile the graph
const app = workflow.compile();

export default app;

export const graph = app;
