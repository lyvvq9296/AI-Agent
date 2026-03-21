import { tool } from "@langchain/core/tools";
import z from "zod";
import llm from "./llm/index.js";

const calculatorSchema = z.object({
  operation: z
    .enum(["add", "subtract", "multiply", "divide"])
    .describe("The type of operation to execute."),
  num1: z.number().describe("The first number to use in the operation."),
  num2: z.number().describe("The second number to use in the operation."),
});

const calculatorTool = tool(
  async ({ operation, num1, num2 }) => {
    switch (operation) {
      case "add":
        return `${num1 + num2}`;
      case "subtract":
        return `${num1 - num2}`;
      case "multiply":
        return `${num1 * num2}`;
      case "divide":
        return `${num1 / num2}`;
      default:
        return "Invalid operation.";
    }
  },
  {
    name: "calculator",
    description: "Can perform mathematical operations.",
    schema: calculatorSchema,
  },
);

const llmWithTools = llm.bindTools([calculatorTool]);
const res = await llmWithTools.invoke("Add 2 and 3.");
console.log(res);
