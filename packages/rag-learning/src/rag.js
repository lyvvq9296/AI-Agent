import { ChromaClient } from "chromadb";
import { AlibabaTongyiEmbeddings } from "@langchain/community/embeddings/alibaba_tongyi";
import { tool } from "@langchain/core/tools";
import { HumanMessage } from "@langchain/core/messages";
import z from "zod";
import llm from "llm-core";
import "dotenv/config";

class CompleteRAGAgent {
  constructor() {
    this.chromaClient = new ChromaClient();
    this.embedder = new AlibabaTongyiEmbeddings({});
    this.collectionName = "nke-10k-2023"; // 修正collection名称
  }

  // 检索工具 - 从Nike年度报告中检索信息
  async retrieveFromNikeReport(query, nResults = 3) {
    try {
      console.log(`🔍 检索查询: "${query}"`);

      // 获取ChromaDB collection
      const collection = await this.chromaClient.getCollection({
        name: this.collectionName,
      });

      // 生成查询的embedding
      const queryEmbedding = await this.embedder.embedQuery(query);

      // 在向量数据库中检索
      const results = await collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: nResults,
      });

      // 格式化检索结果
      const formattedResults = results.documents[0].map((doc, index) => ({
        id: results.ids[0][index],
        similarity: results.distances[0][index].toFixed(4),
        content: doc.substring(0, 500) + (doc.length > 500 ? "..." : ""),
      }));

      console.log(`✅ 检索到 ${formattedResults.length} 个相关文档`);
      return formattedResults;
    } catch (error) {
      console.error("❌ 检索失败:", error.message);
      throw error;
    }
  }

  // 创建检索工具（用于工具调用）
  createRetrievalTool() {
    return tool(
      async (input) => {
        const { query, nResults = 3 } = input;
        const results = await this.retrieveFromNikeReport(query, nResults);

        // 返回格式化结果
        return {
          success: true,
          query: query,
          results: results,
          totalResults: results.length,
        };
      },
      {
        name: "retrieve_from_nike_report",
        description: "从Nike 2023年度报告中检索相关信息",
        schema: z.object({
          query: z.string().describe("需要检索的问题或关键词"),
          nResults: z.number().optional().default(3).describe("返回的结果数量"),
        }),
      },
    );
  }

  // 方法1：使用工具调用的RAG Agent
  async agentWithTools(question) {
    try {
      console.log(`\n🤖 方法1: 使用工具调用的RAG Agent`);
      console.log(`📝 处理问题: "${question}"`);

      // 创建检索工具
      const retrievalTool = this.createRetrievalTool();

      // 绑定工具到LLM
      const llmWithTools = llm.bindTools([retrievalTool]);

      // 系统提示
      const systemPrompt = `你是一个专业的财务分析师，专门分析Nike公司的年度报告。

你有以下工具可以使用：
- retrieve_from_nike_report: 从Nike 2023年度报告中检索相关信息

请按照以下步骤工作：
1. 首先分析用户的问题，确定需要检索的关键信息
2. 使用检索工具从Nike 2023年度报告中查找相关信息
3. 基于检索到的信息，给出准确、专业的回答
4. 如果信息不足，可以多次检索不同的关键词
5. 在回答中引用具体的数据和事实

请确保你的回答基于Nike 2023年度报告中的真实数据。`;

      // 创建消息
      const messages = [new HumanMessage(systemPrompt + "\n\n用户问题: " + question)];

      // 调用LLM
      const response = await llmWithTools.invoke(messages);

      console.log("✅ Agent处理完成");

      return {
        success: true,
        answer: response.content,
        toolCalls: response.tool_calls || [],
        method: "工具调用",
      };
    } catch (error) {
      console.error("❌ 工具调用方法失败:", error.message);
      return {
        success: false,
        error: error.message,
        method: "工具调用",
      };
    }
  }

  // 方法2：手动RAG流程（更可靠）
  async manualRAG(question) {
    try {
      console.log(`\n🔧 方法2: 手动RAG流程`);
      console.log(`📝 处理问题: "${question}"`);

      // 第一步：检索相关信息
      console.log("1️⃣ 检索相关信息...");
      const retrievalResults = await this.retrieveFromNikeReport(question, 5);

      // 构建上下文
      let context = "基于Nike 2023年度报告的检索结果:\n\n";
      retrievalResults.forEach((result, index) => {
        context += `📄 文档 ${index + 1} (相似度: ${result.similarity}):\n${result.content}\n\n`;
      });

      // 第二步：使用LLM生成回答
      console.log("2️⃣ 生成回答...");
      const prompt = `你是一个专业的财务分析师。请基于以下从Nike 2023年度报告中检索到的信息，回答用户的问题。

${context}

用户问题: ${question}

请给出专业、准确的回答，并引用具体的数据和事实。如果检索到的信息不足以回答问题，请说明需要更多信息。`;

      const response = await llm.invoke([new HumanMessage(prompt)]);

      console.log("✅ 手动RAG流程完成");

      return {
        success: true,
        answer: response.content,
        retrievalResults: retrievalResults,
        contextLength: context.length,
        method: "手动RAG",
      };
    } catch (error) {
      console.error("❌ 手动RAG流程失败:", error.message);
      return {
        success: false,
        error: error.message,
        method: "手动RAG",
      };
    }
  }

  // 完整的RAG演示
  async demonstrateRAG(question = "What was Nike's revenue in 2023?") {
    console.log("🚀 === RAG Agent 演示开始 ===\n");

    try {
      // 首先尝试手动RAG方法（更可靠）
      const result = await this.manualRAG(question);

      if (result.success) {
        console.log("\n📊 === 最终回答 ===");
        console.log(result.answer);

        console.log("\n📋 === 检索结果摘要 ===");
        result.retrievalResults.forEach((result, index) => {
          console.log(`\n📄 文档 ${index + 1}:`);
          console.log(`   📏 相似度: ${result.similarity}`);
          console.log(`   📝 内容预览: ${result.content.substring(0, 150)}...`);
        });

        console.log(`\n📊 上下文长度: ${result.contextLength} 字符`);
        console.log(`🔧 使用方法: ${result.method}`);
      } else {
        console.log("❌ 处理失败:", result.error);
      }

      console.log("\n✅ === RAG Agent 演示完成 ===");

      return result;
    } catch (error) {
      console.error("💥 演示失败:", error);
      throw error;
    }
  }
}

// 使用示例
async function main() {
  try {
    // 创建RAG Agent实例
    const ragAgent = new CompleteRAGAgent();

    // 测试问题
    const testQuestion = "What was Nike's revenue in 2023?";

    // 执行演示
    await ragAgent.demonstrateRAG(testQuestion);
  } catch (error) {
    console.error("💥 主程序失败:", error);
  }
}

// 如果直接运行此文件，执行演示
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default CompleteRAGAgent;
