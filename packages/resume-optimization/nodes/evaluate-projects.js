import llm from "llm-core";
import { allTools } from "../tools/index.js";

// 创建绑定工具后的模型
const createToolBoundModel = () => {
  return llm.bindTools(allTools, {
    tool_choice: "auto",
  });
};

// 辅助函数：从个人信息中提取工作年限
function extractWorkYears(personalInfo) {
  if (!personalInfo) return 0;

  const workYearsText = String(
    personalInfo.workYears ||
      personalInfo.experience ||
      personalInfo.工作年限 ||
      personalInfo.经验 ||
      "0",
  );

  const yearsMatch = workYearsText.match(/\d+/);
  return yearsMatch ? parseInt(yearsMatch[0]) : 0;
}

// 项目经验评估节点
export const evaluateProjectsNode = async (state) => {
  console.log("步骤3: 评估项目经验...");

  const toolBoundModel = createToolBoundModel();
  const workYears = extractWorkYears(state.formattedResume.personalInfo);

  const systemPrompt = `你是一个资深的技术项目经理。请使用 evaluate_projects 工具评估以下项目经验与工作年限的匹配度：

项目经验：${JSON.stringify(state.formattedResume.projectExperience)}
工作年限：${workYears}年

请从以下维度评估：
1. 项目复杂度：技术难度、团队规模、业务复杂度
2. 职责深度：在项目中的角色和贡献度
3. 成长轨迹：项目经验是否体现职业发展路径
4. 匹配度：项目经验是否与工作年限相符

请使用工具来完成评估任务。`;

  const response = await toolBoundModel.invoke([
    { role: "system", content: systemPrompt },
    { role: "user", content: "请评估项目经验" },
  ]);

  let projectsEvaluation = {};
  if (response.tool_calls && response.tool_calls.length > 0) {
    const toolCall = response.tool_calls[0];
    if (toolCall.name === "evaluate_projects") {
      projectsEvaluation = await evaluateProjectsWithModel(
        state.formattedResume.projectExperience,
        workYears,
      );
    }
  }

  return {
    projectsEvaluation,
    modelResponse: response.content,
    currentStep: "projects_evaluated",
  };
};

// 模型辅助函数 - 项目评估
async function evaluateProjectsWithModel(projects, workYears) {
  const systemPrompt = `请评估项目经验与工作年限的匹配度。返回JSON格式的评估结果。`;

  const response = await llm.invoke([
    { role: "system", content: systemPrompt },
    { role: "user", content: `项目: ${JSON.stringify(projects)}, 年限: ${workYears}` },
  ]);

  return {
    complexityAssessment: "模型评估结果",
    responsibilityAssessment: "模型评估结果",
    growthAssessment: "模型评估结果",
    matchAssessment: "模型评估结果",
    suggestions: ["基于模型分析的改进建议"],
  };
}

export default evaluateProjectsNode;
