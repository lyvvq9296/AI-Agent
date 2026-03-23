import { ChatPromptTemplate } from "@langchain/core/prompts";
import llm from "./llm/index.js";
import { StringOutputParser } from "@langchain/core/output_parsers";

const prompt = ChatPromptTemplate.fromTemplate(`讲一个关于{topic}的笑话`);
const chain = prompt.pipe(llm).pipe(new StringOutputParser());

// const res = await chain.invoke({ topic: "熊猫" });
// console.log(res);
const stream = await chain.stream({ topic: "熊猫" });
for await (const chunk of stream) {
  console.log(`${chunk}`);
}
