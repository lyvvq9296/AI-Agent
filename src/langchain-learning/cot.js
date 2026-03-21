import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import "dotenv/config";

// 创建 LLM 实例（使用 OpenAI 兼容接口）
const llm = new ChatOpenAI({
  model: "deepseek-chat",
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_BASE_URL,
  temperature: 0.3,
});

async function analyzePageLoadPerformance() {
  try {
    const question = "如果一个网页加载速度慢，该如何处理？";

    // Chain-of-Thought 引导提示
    const cotPrompt = `
请按照以下 Chain-of-Thought 步骤来分析和回答这个问题：

**问题：** ${question}

**思考步骤：**

**步骤1：性能监控，确定是否慢？慢多少？**
- 使用哪些工具来监控网页加载性能？
- 需要关注哪些关键性能指标？
- 如何量化"慢"的程度？

**步骤2：性能数据分析，分析哪里慢？瓶颈在哪里？**
- 分析网络请求的时间线
- 检查资源加载顺序和依赖关系
- 识别性能瓶颈的具体位置

**步骤3：找到瓶颈，分析它的原因，找出解决方案**
- 针对每个瓶颈分析根本原因
- 提出具体的优化方案
- 评估每种方案的可行性和效果

**步骤4：解决问题**
- 实施优化措施
- 验证优化效果
- 建立持续监控机制

请严格按照以上四个步骤进行思考，并在每个步骤中提供详细的分析和具体的解决方案。
`;

    console.log("=== 问题 ===");
    console.log(question);
    console.log("\n=== AI 分析过程 ===");

    // 创建消息数组
    const messages = [
      new SystemMessage(`
        你是一名资深的前端性能优化专家。请使用 Chain-of-Thought 方法系统地分析和解决问题。
        你的回答应该：
        1. 严格按照给定的思考步骤
        2. 每个步骤都要有详细的分析
        3. 提供具体可行的解决方案
        4. 使用专业术语但解释清晰
      `),
      new HumanMessage(cotPrompt),
    ];

    // 调用 LLM
    const response = await llm.invoke(messages);
    console.log(response.content);
  } catch (error) {
    console.error("发生错误:", error.message);
  }
}

// 执行
if (import.meta.url === `file://${process.argv[1]}`) {
  analyzePageLoadPerformance();
}
