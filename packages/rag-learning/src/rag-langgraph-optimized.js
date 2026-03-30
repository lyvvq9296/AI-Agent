import { ChromaClient } from "chromadb";
import { AlibabaTongyiEmbeddings } from "@langchain/community/embeddings/alibaba_tongyi";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StateGraph, START, END } from "@langchain/langgraph";
import z from "zod";
import llm from "llm-core";
import "dotenv/config";

// 定义工作流状态
const RAGState = z.object({
  question: z.string().default(""),
  retrievalResults: z.array(z.any()).default([]),
  context: z.string().default(""),
  finalAnswer: z.string().default(""),
  needsMoreInfo: z.boolean().default(false),
  retrievalCount: z.number().default(0),
});

class OptimizedRAGLangGraphWorkflow {
  constructor() {
    this.chromaClient = new ChromaClient();
    this.embedder = new AlibabaTongyiEmbeddings({});
    this.collectionName = "nke-10k-2023";
    this.workflow = null;
    this.initializeWorkflow();
  }

  // 节点1: 直接检索节点（不使用LLM）
  async directRetrievalNode(state) {
    console.log("\n🔍 节点1: 直接检索");

    try {
      // 获取ChromaDB collection
      const collection = await this.chromaClient.getCollection({
        name: this.collectionName,
      });

      // 直接使用用户问题作为查询
      console.log(`🔍 检索查询: "${state.question}"`);

      // 生成查询的embedding
      const queryEmbedding = await this.embedder.embedQuery(state.question);

      // 在向量数据库中检索
      const results = await collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: 5,
      });

      // 格式化检索结果
      const formattedResults = results.documents[0].map((doc, index) => ({
        id: results.ids[0][index],
        similarity: results.distances[0][index].toFixed(4),
        content: doc.substring(0, 500) + (doc.length > 500 ? "..." : ""),
      }));

      console.log(`✅ 检索到 ${formattedResults.length} 个相关文档`);

      return {
        retrievalResults: formattedResults,
        retrievalCount: formattedResults.length,
      };
    } catch (error) {
      console.error("❌ 检索失败:", error.message);
      return {
        retrievalResults: [],
        retrievalCount: 0,
      };
    }
  }

  // 节点2: 上下文构建节点（不使用LLM）
  async contextBuildingNode(state) {
    console.log("\n📚 节点2: 上下文构建");

    if (state.retrievalResults.length === 0) {
      console.log("⚠️ 无检索结果，跳过上下文构建");
      return {
        context: "",
        needsMoreInfo: true,
      };
    }

    // 构建上下文内容
    const context = state.retrievalResults
      .map((result, index) => `文档 ${index + 1} (相似度: ${result.similarity}): ${result.content}`)
      .join("\n\n");

    // 简单的信息充足性检查（不使用LLM）
    // 基于检索结果的相似度和内容长度判断
    const averageSimilarity =
      state.retrievalResults.reduce((sum, result) => sum + parseFloat(result.similarity), 0) /
      state.retrievalResults.length;

    const hasRelevantContent = averageSimilarity < 0.8; // 相似度越低越好
    const hasSufficientLength = context.length > 1000;

    const needsMoreInfo = !hasRelevantContent || !hasSufficientLength;

    console.log(`✅ 构建上下文长度: ${context.length} 字符`);
    console.log(`📊 平均相似度: ${averageSimilarity.toFixed(4)}`);
    console.log(`📋 信息充足性: ${needsMoreInfo ? "不足" : "充足"}`);

    return {
      context: context,
      needsMoreInfo: needsMoreInfo,
    };
  }

  // 节点3: 补充检索节点（不使用LLM）
  async supplementaryRetrievalNode(state) {
    console.log("\n🔍 节点3: 补充检索");

    try {
      // 获取ChromaDB collection
      const collection = await this.chromaClient.getCollection({
        name: this.collectionName,
      });

      // 基于原始问题生成补充查询
      const supplementaryQueries = this.generateSupplementaryQueries(state.question);

      let allResults = [...state.retrievalResults];

      for (const query of supplementaryQueries) {
        console.log(`🔍 补充检索: "${query}"`);

        const queryEmbedding = await this.embedder.embedQuery(query);
        const results = await collection.query({
          queryEmbeddings: [queryEmbedding],
          nResults: 3,
        });

        const formattedResults = results.documents[0].map((doc, index) => ({
          id: results.ids[0][index],
          similarity: results.distances[0][index].toFixed(4),
          content: doc.substring(0, 500) + (doc.length > 500 ? "..." : ""),
        }));

        // 去重合并结果
        formattedResults.forEach((newResult) => {
          const exists = allResults.some(
            (existing) =>
              existing.id === newResult.id ||
              existing.content.substring(0, 100) === newResult.content.substring(0, 100),
          );
          if (!exists) {
            allResults.push(newResult);
          }
        });
      }

      console.log(`✅ 补充检索完成，总文档数: ${allResults.length}`);

      return {
        retrievalResults: allResults,
        retrievalCount: allResults.length,
        needsMoreInfo: false, // 假设补充检索后信息充足
      };
    } catch (error) {
      console.error("❌ 补充检索失败:", error.message);
      return {
        retrievalResults: state.retrievalResults,
        retrievalCount: state.retrievalCount,
        needsMoreInfo: true,
      };
    }
  }

  // 生成补充查询（不使用LLM）
  generateSupplementaryQueries(question) {
    // 基于问题类型生成相关查询
    const queries = [];

    // 基础查询
    queries.push(question);

    // 针对财务问题的补充查询
    if (question.toLowerCase().includes("revenue") || question.toLowerCase().includes("income")) {
      queries.push("Nike financial results 2023");
      queries.push("Nike revenue growth 2023");
    }

    // 针对产品问题的补充查询
    if (question.toLowerCase().includes("product") || question.toLowerCase().includes("shoe")) {
      queries.push("Nike product portfolio 2023");
      queries.push("Nike brand performance 2023");
    }

    // 针对战略问题的补充查询
    if (question.toLowerCase().includes("strategy") || question.toLowerCase().includes("plan")) {
      queries.push("Nike business strategy 2023");
      queries.push("Nike corporate plan 2023");
    }

    // 通用补充查询
    queries.push("Nike 2023 annual report");
    queries.push("Nike Form 10-K 2023");

    return [...new Set(queries)]; // 去重
  }

  // 节点4: 答案生成节点（唯一使用LLM的节点）
  async answerGenerationNode(state) {
    console.log("\n🤖 节点4: 答案生成（使用LLM）");

    if (state.context.length === 0) {
      console.log("⚠️ 无上下文信息，无法生成答案");
      return {
        finalAnswer: "抱歉，无法从Nike 2023年度报告中找到相关信息来回答您的问题。",
      };
    }

    const systemPrompt = `你是一个专业的财务分析师。请基于以下从Nike 2023年度报告中检索到的信息，给出准确、专业的回答。

要求：
1. 基于事实和数据回答
2. 引用具体的数据和来源
3. 回答要专业且易懂
4. 如果信息不足，请明确说明`;

    const prompt = `问题：${state.question}

检索到的信息：
${state.context}

请基于以上信息给出专业回答。`;

    const response = await llm.invoke([new SystemMessage(systemPrompt), new HumanMessage(prompt)]);

    console.log("✅ 答案生成完成");

    return {
      finalAnswer: response.content,
    };
  }

  // 初始化工作流
  initializeWorkflow() {
    console.log("🚀 初始化优化版LangGraph RAG工作流...");

    // 创建状态图
    const workflow = new StateGraph(RAGState);

    // 添加节点（大多数节点不使用LLM）
    workflow.addNode("direct_retrieval", this.directRetrievalNode.bind(this));
    workflow.addNode("context_building", this.contextBuildingNode.bind(this));
    workflow.addNode("supplementary_retrieval", this.supplementaryRetrievalNode.bind(this));
    workflow.addNode("answer_generation", this.answerGenerationNode.bind(this));

    // 添加边
    workflow.addEdge(START, "direct_retrieval");
    workflow.addEdge("direct_retrieval", "context_building");

    // 条件边：根据信息充足性决定是否进行补充检索
    workflow.addConditionalEdges(
      "context_building",
      (state) => {
        return state.needsMoreInfo ? "supplementary_retrieval" : "answer_generation";
      },
      {
        supplementary_retrieval: "supplementary_retrieval",
        answer_generation: "answer_generation",
      },
    );

    workflow.addEdge("supplementary_retrieval", "answer_generation");
    workflow.addEdge("answer_generation", END);

    // 编译工作流
    this.workflow = workflow.compile();

    console.log("✅ 优化版LangGraph RAG工作流初始化完成");
  }

  // 执行工作流
  async execute(question) {
    if (!this.workflow) {
      throw new Error("工作流未初始化");
    }

    console.log(`\n🎯 === 开始执行优化版RAG工作流 ===`);
    console.log(`📝 问题: "${question}"`);

    try {
      // 初始化状态
      const initialState = {
        question: question,
      };

      // 执行工作流
      const finalState = await this.workflow.invoke(initialState);

      console.log("\n✅ === 优化版RAG工作流执行完成 ===");

      // 返回结果
      return {
        success: true,
        question: question,
        finalAnswer: finalState.finalAnswer,
        retrievalCount: finalState.retrievalCount,
        needsMoreInfo: finalState.needsMoreInfo,
        retrievalResults: finalState.retrievalResults,
      };
    } catch (error) {
      console.error("❌ 工作流执行失败:", error);
      return {
        success: false,
        error: error.message,
        question: question,
      };
    }
  }

  // 性能分析
  analyzePerformance() {
    console.log("\n📊 === 工作流性能分析 ===");
    console.log("🔧 优化特点:");
    console.log("   • 4个节点中只有1个使用LLM");
    console.log("   • 移除了定制化的关键词提取节点");
    console.log("   • 直接使用用户问题作为检索查询");
    console.log("   • 基于规则的补充查询生成");
    console.log("   • 大幅减少LLM调用次数和成本");
  }
}

// 使用示例
async function main() {
  try {
    // 创建优化版RAG工作流实例
    const ragWorkflow = new OptimizedRAGLangGraphWorkflow();

    // 等待工作流初始化完成
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 测试问题
    const testQuestion = "What was Nike's revenue in 2023?";

    console.log("🚀 === 优化版LangGraph RAG工作流演示开始 ===\n");

    // 性能分析
    ragWorkflow.analyzePerformance();

    // 执行工作流
    const result = await ragWorkflow.execute(testQuestion);

    if (result.success) {
      console.log("\n📊 === 工作流执行结果 ===");
      console.log(`📝 问题: ${result.question}`);
      console.log(`🔍 检索文档数量: ${result.retrievalCount}`);
      console.log(`📋 信息充足性: ${result.needsMoreInfo ? "不足" : "充足"}`);

      console.log("\n🤖 === 最终回答 ===");
      console.log(result.finalAnswer);

      console.log("\n📋 === 检索结果摘要 ===");
      result.retrievalResults.forEach((result, index) => {
        console.log(`\n📄 文档 ${index + 1}:`);
        console.log(`   📏 相似度: ${result.similarity}`);
        console.log(`   📝 内容预览: ${result.content.substring(0, 150)}...`);
      });
    } else {
      console.log("❌ 工作流执行失败:", result.error);
    }

    console.log("\n✅ === 优化版LangGraph RAG工作流演示完成 ===");
  } catch (error) {
    console.error("💥 演示失败:", error);
  }
}

// 如果直接运行此文件，执行演示
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default OptimizedRAGLangGraphWorkflow;
