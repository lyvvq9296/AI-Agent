import { createServer } from "http";
import { readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import { config } from "dotenv";

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_BASE_URL,
});

const server = createServer(async (req, res) => {
  // 处理根路径，返回聊天页面
  if (req.method === "GET" && req.url === "/chat.html") {
    try {
      const htmlPath = join(__dirname, "chat.html");
      const htmlContent = await readFile(htmlPath, "utf-8");

      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
      });
      res.write(htmlContent);
      res.end();
    } catch (error) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.write("无法加载聊天页面");
      res.end();
    }
    return;
  }

  // 处理聊天接口
  if (req.method === "POST" && req.url === "/api/chat") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      try {
        const { message } = JSON.parse(body);

        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
        });

        const stream = await client.chat.completions.create({
          model: "deepseek-chat",
          messages: [{ role: "user", content: message }],
          temperature: 0.7,
          max_tokens: 2048,
          stream: true,
        });

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
          }
        }

        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
      } catch (error) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.write(JSON.stringify({ error: error.message }));
        res.end();
      }
    });
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.write(JSON.stringify({ error: "接口不存在" }));
    res.end();
  }
});

const port = 3000;
server.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
  console.log("聊天页面: http://localhost:3000/");
  console.log("聊天接口: POST http://localhost:3000/api/chat");
});
