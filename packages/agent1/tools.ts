import { tool } from "langchain";
import z from "zod";

const queryOrder = tool(
  async ({ orderId }) => {
    const orders: Record<string, string> = {
      "ORD-001": "已发货, 预计明天送达",
      "ORD-002": "待付款",
      "ORD-003": "已完成",
    };

    return orders[orderId] || `未查到订单 ${orderId}`;
  },
  {
    name: "query_order",
    description: "根据订单号查询订单当前状态",
    schema: z.object({
      orderId: z.string().describe("订单号, 格式如 ORD-001"),
    }),
  },
);

const getWeather = tool(async ({ city }) => `${city}: 晴, 28℃, 湿度 45%`, {
  name: "get_weather",
  description: "查询指定城市当前的天气信息",
  schema: z.object({
    city: z.string().describe("城市名称"),
  }),
});

const processRefund = tool(
  async ({ orderId, reason }) =>
    `订单 ${orderId} 已发起退款操作, 退款原因: ${reason}, 预计 3 个工作日到账`,
  {
    name: "process_refund",
    description: "为指定订单发起退款操作, 需要提供订单号和退款原因",
    schema: z.object({
      orderId: z.string().describe("要退款的订单号"),
      reason: z.string().describe("退款原因"),
    }),
  },
);

export { queryOrder, getWeather, processRefund };
