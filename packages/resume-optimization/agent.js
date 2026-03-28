import { StateGraph, START, END } from "@langchain/langgraph";
import { MemorySaver } from "@langchain/langgraph";
import { Annotation } from "@langchain/langgraph";
import {
  formatResumeNode,
  evaluateSkillsNode,
  evaluateProjectsNode,
  generateSuggestionsNode,
  summarizeResultsNode
} from "./nodes/index.js";

// 定义 Agent 状态
const AgentState = Annotation.Root({
  resumeText: Annotation({
    description: "原始简历文本"
  }),
  formattedResume: Annotation({
    description: "格式化后的简历数据"
  }),
  skillsEvaluation: Annotation({
    description: "专业技能评估结果"
  }),
  projectsEvaluation: Annotation({
    description: "项目经验评估结果"
  }),
  finalSuggestions: Annotation({
    description: "最终优化建议"
  }),
  summary: Annotation({
    description: "综合总结"
  }),
  currentStep: Annotation({
    description: "当前处理步骤"
  }),
  modelResponse: Annotation({
    description: "模型响应内容"
  })
});

// 创建状态图
const workflow = new StateGraph(AgentState);

// 添加各个节点到工作流
workflow.addNode("format_resume", async (state) => {
  const result = await formatResumeNode(state);
  return { ...state, ...result };
});

workflow.addNode("evaluate_skills", async (state) => {
  const result = await evaluateSkillsNode(state);
  return { ...state, ...result };
});

workflow.addNode("evaluate_projects", async (state) => {
  const result = await evaluateProjectsNode(state);
  return { ...state, ...result };
});

workflow.addNode("generate_suggestions", async (state) => {
  const result = await generateSuggestionsNode(state);
  return { ...state, ...result };
});

workflow.addNode("summarize_results", async (state) => {
  const result = await summarizeResultsNode(state);
  return { ...state, ...result };
});

// 定义流程边
workflow.addEdge(START, "format_resume");
workflow.addEdge("format_resume", "evaluate_skills");
workflow.addEdge("evaluate_skills", "evaluate_projects");
workflow.addEdge("evaluate_projects", "generate_suggestions");
workflow.addEdge("generate_suggestions", "summarize_results");
workflow.addEdge("summarize_results", END);

// 编译工作流
const memory = new MemorySaver();
const app = workflow.compile({
  checkpointer: memory
});

// 创建模块化的简历优化 Agent
export const createModularResumeOptimizationAgent = () => {
  return {
    async optimizeResume(resumeText) {
      console.log("开始简历优化流程（模块化架构）...");
      
      const config = { configurable: { thread_id: `resume_modular_${Date.now()}` } };
      
      const result = await app.invoke({
        resumeText
      }, config);
      
      return {
        formattedResume: result.formattedResume,
        skillsEvaluation: result.skillsEvaluation,
        projectsEvaluation: result.projectsEvaluation,
        finalSuggestions: result.finalSuggestions,
        summary: result.summary,
        modelResponse: result.modelResponse,
        status: "completed"
      };
    },
    
    // 获取工作流信息
    getWorkflowInfo() {
      return {
        nodes: Object.keys(workflow.nodes),
        edges: workflow.edges,
        compiled: !!app
      };
    }
  };
};

export default createModularResumeOptimizationAgent;