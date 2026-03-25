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
  // 查询订单
  /* await agent.invoke(
    {
      messages: [new HumanMessage("帮我查询一下订单 ORD-001 的状态")],
    },
    config,
  );
  await agent.invoke(
    {
      messages: [new HumanMessage("这个订单能退款吗?")],
    },
    config,
  ); */

  const res = await agent.invoke(
    {
      messages: [new HumanMessage("我要退掉订单 ORD-001, 商品质量有问题")],
    },
    config,
  );
  if (res.__interrupt__) {
    console.log("== 需要人工审批 ==");

    const interrupt = res.__interrupt__[0];

    const action = (interrupt.value as any)?.actionRequests?.[0];
    console.log(`工具: ${action.name}`);
    console.log(`参数: ${JSON.stringify(action.args)}`);

    // 同意退款
    /* const approved = await agent.invoke(
      new Command({
        resume: {
          decisions: [{ type: "approve" }],
        },
      }),
      config,
    );
    console.log("审批结果:", approved.structuredResponse); */

    // 修改后批准
    /* const approved = await agent.invoke(
      new Command({
        resume: {
          decisions: [
            {
              type: "edit",
              editedAction: {
                name: action.name,
                args: {
                  ...action.args,
                  reason: "商品质量问题-已核实",
                },
              },
            },
          ],
        },
      }),
      config,
    );
    console.log("审批结果:", approved.structuredResponse); */

    // 拒绝退款
    const approved = await agent.invoke(
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
    console.log("审批结果:", approved.structuredResponse);
  }
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
