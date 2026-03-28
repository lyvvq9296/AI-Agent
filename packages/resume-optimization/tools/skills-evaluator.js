import { tool } from "langchain";
import { z } from "zod";

// 专业技能评估工具
const evaluateSkillsSchema = z.object({
  skills: z.array(z.any()).describe("专业技能列表"),
  workYears: z.number().describe("工作年限")
});

export const evaluateSkillsTool = tool(
  async ({ skills, workYears }) => {
    // 工具只负责技能评估的接口定义
    return {
      status: "ready_for_evaluation",
      skillsCount: skills.length,
      workYears,
      evaluationDimensions: ["depth", "breadth", "match"],
      toolName: "evaluate_skills"
    };
  },
  {
    name: "evaluate_skills",
    description: "评估专业技能深度、广度与工作年限的匹配度",
    schema: evaluateSkillsSchema
  }
);

export default evaluateSkillsTool;