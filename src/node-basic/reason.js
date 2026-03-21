import OpenAI from "openai";
import { config } from "dotenv";

config();

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_BASE_URL,
});

async function streamReasonerChat() {
  const stream = await client.chat.completions.create({
    model: "deepseek-reasoner",
    messages: [{ role: "user", content: "天空为什么是蓝色的" }],
    temperature: 0.7,
    max_tokens: 2048,
    stream: true,
  });

  let hasPrintedReason = false;

  for await (const chunk of stream) {
    const choice = chunk.choices[0];

    if (choice?.delta?.reasoning_content) {
      if (!hasPrintedReason) {
        console.log("=== 推理过程 ===");
        hasPrintedReason = true;
      }
      process.stdout.write(choice.delta.reasoning_content);
    }

    if (choice?.delta?.content) {
      if (hasPrintedReason) {
        console.log("\n\n=== 最终答案 ===");
        hasPrintedReason = false;
      }
      process.stdout.write(choice.delta.content);
    }
  }

  process.stdout.write("\n");
}

async function main() {
  if (!process.env.DEEPSEEK_API_KEY) {
    console.error("请先在 .env 文件中配置 DEEPSEEK_API_KEY");
    return;
  }

  console.log("=== DeepSeek Reasoner 流式输出示例 ===");
  console.log("问题: 天空为什么是蓝色的\n");

  await streamReasonerChat();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { streamReasonerChat };
