import { ChatPromptTemplate } from "@langchain/core/prompts";
import llm from "./llm/index.js";

// import { SystemMessage, HumanMessage } from "langchain";
// const messages = [new SystemMessage("把下面的中文翻译成意大利语"), new HumanMessage("你好啊")];

// const response = await llm.invoke(messages);
// console.log(response);

// const resStream = await llm.stream(messages);
// for await (const chunk of resStream) {
//   console.log(chunk.content);
// }

const systemTemplate = `Translate the following from English into {language}`;
const promptTemplate = ChatPromptTemplate.fromMessages([
  ["system", systemTemplate],
  ["user", "{text}"],
]);

const prompt = await promptTemplate.invoke({ language: "Chinese", text: "hi, how are you" });

const res = await llm.invoke(prompt);
console.log(res.content);
