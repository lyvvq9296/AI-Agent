import { HumanMessage } from "langchain";
import { v4 as uuidv4 } from "uuid";
import { agent } from "./agent.ts";
import { Command } from "@langchain/langgraph";

const config = {
  configurable: {
    thread_id: uuidv4(),
  },
};

async function main() {
  console.log("=== 开始流式调用演示 ===\n");

  // 示例1: 流式查询订单状态
  console.log("1. 流式查询订单状态:");
  const stream = await agent.stream(
    {
      messages: [new HumanMessage("帮我查询一下订单 ORD-001 的状态")],
    },
    { ...config, streamMode: ["updates", "messages"] },
  );

  for await (const [mode, chunk] of stream) {
    const [step, content] = Object.entries(chunk)[0];
    if (mode === "updates") {
      // console.log(`\n--- 步骤: ${step} ---`);
      if (step === "model_request") {
        const msg = (content as any).messages?.[0];

        // 检查是否有工具调用
        if (msg?.tool_calls?.length) {
          const tools = msg.tool_calls.map((tc: any) => tc.name);
          console.log(`工具调用: ${tools.toString()}`);
        }
      }

      if (step === "tools") {
        const msg = (content as any).messages?.[0];
        if (msg?.content) {
          console.log(`工具结果: ${msg.content}`);
        }
      }

      // 检查是否有最终的模型回复 - 在 ModelCallLimitMiddleware.after_agent 步骤中
      if (step === "ModelCallLimitMiddleware.after_agent") {
        // 从 structuredResponse 中获取最终回复
        if ((content as any).structuredResponse?.reply) {
          console.log(`✅ 最终回复: ${(content as any).structuredResponse.reply}`);
        }
      }
    }

    if (mode === "messages") {
      const [token] = chunk;
      if (token?.content) {
        process.stdout.write(token?.content as string);
      }
    }
  }
  console.log("\n");
  /* // 示例2: 流式退款请求
  console.log("\n2. 流式退款请求:");
  const stream2 = await agent.stream(
    {
      messages: [new HumanMessage("我要退掉订单 ORD-001, 商品质量有问题")],
    },
    config,
  );

  for await (const chunk of stream2) {
    if (chunk.event === "on_chat_model_stream") {
      const content = chunk.data?.chunk?.content;
      if (content) {
        process.stdout.write(content);
      }
    } else if (chunk.event === "on_tool_start") {
      console.log(`\n[工具调用开始] ${chunk.name}`);
    } else if (chunk.event === "on_tool_end") {
      console.log(`[工具调用完成] ${chunk.name}`);
    }
  }
  console.log("\n");

  // 示例3: 流式天气查询
  console.log("\n3. 流式天气查询:");
  const stream3 = await agent.stream(
    {
      messages: [new HumanMessage("上海今天天气怎么样?")],
    },
    config,
  );

  for await (const chunk of stream3) {
    if (chunk.event === "on_chat_model_stream") {
      const content = chunk.data?.chunk?.content;
      if (content) {
        process.stdout.write(content);
      }
    }
  }
  console.log("\n");

  // 示例4: 流式处理中断（人工审批）
  console.log("\n4. 流式处理中断场景:");
  const stream4 = await agent.stream(
    {
      messages: [new HumanMessage("我要退掉订单 ORD-002, 商品有损坏")],
    },
    config,
  );

  let hasInterrupt = false;
  for await (const chunk of stream4) {
    if (chunk.event === "on_chat_model_stream") {
      const content = chunk.data?.chunk?.content;
      if (content) {
        process.stdout.write(content);
      }
    } else if (chunk.event === "on_chain_stream" && chunk.name === "hitl") {
      console.log("\n[人工审批触发]");
      hasInterrupt = true;
    }
  }

  if (hasInterrupt) {
    console.log("\n\n=== 处理人工审批中断 ===");

    // 模拟拒绝退款
    const resumeStream = await agent.stream(
      new Command({
        resume: {
          decisions: [
            {
              type: "reject",
              message: "订单已超出退款期限, 请引导用户联系售后",
            },
          ],
        },
      }),
      config,
    );

    console.log("审批结果流式输出:");
    for await (const chunk of resumeStream) {
      if (chunk.event === "on_chat_model_stream") {
        const content = chunk.data?.chunk?.content;
        if (content) {
          process.stdout.write(content);
        }
      }
    }
  }
 */
  console.log("\n\n=== 流式调用演示完成 ===");
}

main().catch(console.error);
