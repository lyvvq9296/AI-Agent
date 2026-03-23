import { PromptTemplate } from "@langchain/core/prompts";
import llm from "./llm/index.js";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableMap } from "@langchain/core/runnables";

const jokeChain = PromptTemplate.fromTemplate(`讲一个关于{topic}的笑话`)
  .pipe(llm)
  .pipe(new StringOutputParser());
const introChain = PromptTemplate.fromTemplate(`介绍一下关于{topic}的基本知识, 30 字以内`)
  .pipe(llm)
  .pipe(new StringOutputParser());

const mapChain = RunnableMap.from({ joke: jokeChain, intro: introChain });
const res = await mapChain.invoke({ topic: "熊猫" });
console.log(res);
