import { HumanMessage } from "langchain";
import { v4 as uuidv4 } from "uuid";
import { agent } from "./agent.ts";

const config = {
  configurable: {
    thread_id: uuidv4(),
  },
};

async function main() {
  // 查询订单
  const r1 = await agent.invoke(
    {
      messages: [new HumanMessage("帮我查询一下订单 ORD-001 的状态")],
    },
    config,
  );
  console.log(r1.structuredResponse);
  const r2 = await agent.invoke(
    {
      messages: [new HumanMessage("这个订单能退款吗?")],
    },
    config,
  );
  console.log(r2.structuredResponse);

  /* // 查询天气
  const r2 = await agent.invoke(
    {
      messages: [new HumanMessage("上海今天天气怎么样?")],
    },
    config,
  );
  console.log(r2.structuredResponse); */
}

main();
