import { HumanMessage } from "langchain";
import { agent } from "./agent.ts";

async function main() {
  // 查询订单
  const r1 = await agent.invoke({
    messages: [new HumanMessage("帮我查询一下订单 ORD-001 的状态")],
  });
  console.log(r1.structuredResponse);

  // 查询天气
  const r2 = await agent.invoke({
    messages: [new HumanMessage("上海今天天气怎么样?")],
  });
  console.log(r2.structuredResponse);
}

main();
