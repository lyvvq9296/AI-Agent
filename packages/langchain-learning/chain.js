import { ChatPromptTemplate } from "@langchain/core/prompts";
import llm from "llm-core";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableLambda } from "@langchain/core/runnables";

const prompt = ChatPromptTemplate.fromTemplate(`讲一个关于{topic}的笑话`);
const chain = prompt.pipe(llm).pipe(new StringOutputParser());

// const res = await chain.invoke({ topic: "熊猫" });
// console.log(res);
// const stream = await chain.stream({ topic: "熊猫" });
// for await (const chunk of stream) {
// console.log(`${chunk}`);
// }

const analysisPrompt = ChatPromptTemplate.fromTemplate(`这个笑话好笑吗? {joke}`);
const composedChain = new RunnableLambda({
  func: async (input) => {
    const res = await chain.invoke(input);
    return { joke: res };
  },
})
  .pipe(analysisPrompt)
  .pipe(llm)
  .pipe(new StringOutputParser());
const res = await composedChain.invoke({ topic: "熊猫" });
console.log(res);
