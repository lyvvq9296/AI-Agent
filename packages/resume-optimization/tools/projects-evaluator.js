import { tool } from "langchain";
import { z } from "zod";

// 项目经验评估工具
const evaluateProjectsSchema = z.object({
  projects: z.array(z.any()).describe("项目经验列表"),
  workYears: z.number().describe("工作年限")
});

export const evaluateProjectsTool = tool(
  async ({ projects, workYears }) => {
    return {
      status: "ready_for_evaluation",
      projectsCount: projects.length,
      workYears,
      evaluationDimensions: ["complexity", "responsibility", "growth", "match"],
      toolName: "evaluate_projects"
    };
  },
  {
    name: "evaluate_projects",
    description: "评估项目经验复杂度、职责与工作年限的匹配度",
    schema: evaluateProjectsSchema
  }
);

export default evaluateProjectsTool;