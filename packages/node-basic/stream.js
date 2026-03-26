import OpenAI from "openai";
import { config } from "dotenv";

config();

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_BASE_URL,
});

async function streamChat(messages) {
  const stream = await client.chat.completions.create({
    model: "deepseek-chat",
    messages,
    temperature: 0.7,
    max_tokens: 2048,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || "";
    if (content) {
      process.stdout.write(content);
    }
  }
  process.stdout.write("\n");
}

async function main() {
  if (!process.env.DEEPSEEK_API_KEY) {
    console.error("请先在 .env 文件中配置 DEEPSEEK_API_KEY");
    return;
  }

  const messages = [{ role: "user", content: "请用中文介绍一下人工智能的发展历史" }];

  console.log("=== DeepSeek 流式输出示例 ===");
  await streamChat(messages);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { streamChat };
