import { tool } from "langchain";
import { z } from "zod";

// 生成最终建议工具
const generateSuggestionsSchema = z.object({
  formattedResume: z.object({}).describe("格式化后的简历数据"),
  skillsEvaluation: z.object({}).describe("技能评估结果"),
  projectsEvaluation: z.object({}).describe("项目评估结果")
});

export const generateSuggestionsTool = tool(
  async ({ formattedResume, skillsEvaluation, projectsEvaluation }) => {
    return {
      status: "ready_for_suggestions",
      hasFormattedResume: !!formattedResume,
      hasSkillsEvaluation: !!skillsEvaluation,
      hasProjectsEvaluation: !!projectsEvaluation,
      toolName: "generate_suggestions"
    };
  },
  {
    name: "generate_suggestions",
    description: "基于评估结果生成最终的简历优化建议",
    schema: generateSuggestionsSchema
  }
);

export default generateSuggestionsTool;