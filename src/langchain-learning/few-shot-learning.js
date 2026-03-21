import { FewShotPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import llm from "./llm/index.js";

const examples = [
  {
    question: `
      给以下 JS 函数写注释
      function add(a, b) {{
        return a + b;
      }}
`,
    answer: `
      /**
      * 两个数字相加求和
      * @param {{number}} a - 第一个数字
      * @param {{number}} b - 第二个数字
      * @returns {{number}} 两个数字的和
      */`,
  },
  {
    question: `
      给以下 JS 函数写注释
      function getUser(id) {{
        return db.findUserById(id);
      }}
    `,
    answer: `
      /**
      * 根据用户ID从数据库中获取用户信息
      * @param {{string}} id - 唯一的用户 id
      * @returns {{Object|null}} 返回用户对象，如果未找到则返回 null
      */`,
  },
];

const examplePrompt = PromptTemplate.fromTemplate("Question: {question}\nAnswer: {answer}");
const fewShotPrompt = new FewShotPromptTemplate({
  examples,
  examplePrompt,
  suffix: "Question: {input}",
  inputVariables: ["input"],
});

async function generateComment() {
  try {
    // 构建提示
    const formatted = await fewShotPrompt.format({
      input: `
      给以下 JS 函数写注释
      function formatDate(date) {{
        return date.toISOString().split('T')[0];
      }}
      `,
    });

    console.log("=== 构建的提示 ===");
    console.log(formatted);
    console.log("\n=== AI 生成的注释 ===");

    // 创建消息数组，包含 system prompt
    const messages = [
      new SystemMessage(`
        你是一名资深的 Node.js 工程师，请为给定的函数写中文文档注释。
        格式要求：
        1. 使用 JSDoc 风格。
        2. 每个参数必须有描述。
        3. 结尾要有返回值说明。
      `),
      new HumanMessage(formatted),
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
  generateComment();
}
