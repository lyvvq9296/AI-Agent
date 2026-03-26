import { z } from "zod";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import llm from "./llm/index.js";

// 定义结构化输出的 Zod schema
const PersonSchema = z.object({
  name: z.string().describe("姓名"),
  age: z.number().int().min(0).max(120).describe("年龄"),
  gender: z.enum(["男", "女", "其他"]).describe("性别"),
  skills: z.array(z.string()).describe("技能列表"),
});

async function extractPersonInfo() {
  try {
    // 示例个人介绍
    const introduction = `
      我叫张三，今年28岁，男性。我是一名全栈工程师，擅长 JavaScript、Python、React、Node.js 等技术。
      我有多年的 Web 开发经验，熟悉前后端分离架构，能够独立完成项目开发。
      此外，我还对机器学习有一定了解，会使用 TensorFlow 和 PyTorch。
    `;

    console.log("=== 输入的个人介绍 ===");
    console.log(introduction);
    console.log("\n=== AI 结构化输出 ===");

    // 创建消息数组
    const messages = [
      new SystemMessage(`
        你是一个信息提取助手，专门从文本中提取结构化信息。
        请从个人介绍中提取信息。
      `),
      new HumanMessage(`请从以下个人介绍中提取结构化信息：\n\n${introduction}`),
    ];

    // 使用 withStructuredOutput API
    const structuredLlm = llm.withStructuredOutput(PersonSchema);

    // 调用 LLM
    const response = await structuredLlm.invoke(messages);

    console.log("✅ 结构化输出：");
    console.log(JSON.stringify(response, null, 2));
  } catch (error) {
    console.error("发生错误:", error.message);
    console.error("错误详情:", error);
  }
}

// 执行
if (import.meta.url === `file://${process.argv[1]}`) {
  extractPersonInfo();
}
