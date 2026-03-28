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

// 专业技能评估节点
export const evaluateSkillsNode = async (state) => {
  console.log("步骤2: 评估专业技能...");

  const toolBoundModel = createToolBoundModel();
  const workYears = extractWorkYears(state.formattedResume.personalInfo);

  const systemPrompt = `你是一个资深的技术面试官。请使用 evaluate_skills 工具评估以下专业技能与工作年限的匹配度：

专业技能：${JSON.stringify(state.formattedResume.technicalSkills)}
工作年限：${workYears}年

请从以下维度评估：
1. 技能深度：是否掌握了核心技术原理和高级用法
2. 技能广度：是否涵盖了相关技术栈的完整生态
3. 匹配度：技能水平是否与工作年限相符

请使用工具来完成评估任务。`;

  const response = await toolBoundModel.invoke([
    { role: "system", content: systemPrompt },
    { role: "user", content: "请评估专业技能" },
  ]);

  let skillsEvaluation = {};
  if (response.tool_calls && response.tool_calls.length > 0) {
    const toolCall = response.tool_calls[0];
    if (toolCall.name === "evaluate_skills") {
      skillsEvaluation = await evaluateSkillsWithModel(
        state.formattedResume.technicalSkills,
        workYears,
      );
    }
  }

  return {
    skillsEvaluation,
    modelResponse: response.content,
    currentStep: "skills_evaluated",
  };
};

// 模型辅助函数 - 技能评估
async function evaluateSkillsWithModel(skills, workYears) {
  const systemPrompt = `请评估专业技能与工作年限的匹配度。返回JSON格式的评估结果。`;

  const response = await llm.invoke([
    { role: "system", content: systemPrompt },
    { role: "user", content: `技能: ${JSON.stringify(skills)}, 年限: ${workYears}` },
  ]);

  return {
    depthAssessment: "模型评估结果",
    breadthAssessment: "模型评估结果",
    matchAssessment: "模型评估结果",
    suggestions: ["基于模型分析的改进建议"],
  };
}

export default evaluateSkillsNode;
