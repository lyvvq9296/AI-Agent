import { TavilySearch } from "@langchain/tavily";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import llm from "llm-core";

// 创建 Tavily 搜索工具
const tavilyTool = new TavilySearch({
  maxResults: 3,
  topic: "general",
});
console.log(tavilyTool);

async function searchWithTavily() {
  try {
    // 绑定工具到 LLM
    const llmWithTools = llm.bindTools([tavilyTool]);

    // 搜索查询
    const searchQuery = "2024年人工智能领域的最新发展趋势";

    console.log("=== 搜索查询 ===");
    console.log(searchQuery);
    console.log("\n=== LLM 调用工具搜索 ===");

    // 创建消息，让 LLM 决定是否使用搜索工具
    const messages = [
      new SystemMessage(`
        你是一名人工智能领域的分析师。
        当用户询问需要最新信息的问题时，你可以使用搜索工具获取实时数据。
        请根据问题的时效性决定是否使用搜索工具。
      `),
      new HumanMessage(`
        请帮我查找关于"${searchQuery}"的最新信息。
        如果这个问题需要最新的网络信息，请使用搜索工具。
      `),
    ];

    // 调用 LLM（LLM 会自动决定是否调用工具）
    const response = await llmWithTools.invoke(messages);

    console.log("LLM 响应:");
    console.log(response);

    // 检查是否有工具调用
    if (response.tool_calls && response.tool_calls.length > 0) {
      console.log("\n=== 检测到工具调用 ===");

      for (const toolCall of response.tool_calls) {
        if (toolCall.name === "tavily_search_results_json") {
          console.log("执行搜索工具...");

          // 执行搜索工具
          const searchResults = await tavilyTool.invoke(toolCall.args);

          console.log("\n=== 搜索结果 ===");
          console.log(JSON.stringify(searchResults, null, 2));

          // 让 LLM 分析搜索结果
          console.log("\n=== AI 分析总结 ===");

          const analysisMessages = [
            ...messages,
            response,
            new HumanMessage(`
              这是搜索工具返回的结果：
              ${JSON.stringify(searchResults, null, 2)}
              
              请基于这些搜索结果，总结2024年人工智能领域的最新发展趋势。
            `),
          ];

          const finalResponse = await llm.invoke(analysisMessages);
          console.log(finalResponse.content);
        }
      }
    }
  } catch (error) {
    console.error("发生错误:", error.message);
    console.error("错误详情:", error);
  }
}

// 执行
if (import.meta.url === `file://${process.argv[1]}`) {
  searchWithTavily();
}
