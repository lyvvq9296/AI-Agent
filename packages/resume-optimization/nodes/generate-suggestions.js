import llm from "llm-core";
import { allTools } from "../tools/index.js";

// 创建绑定工具后的模型
const createToolBoundModel = () => {
  return llm.bindTools(allTools, {
    tool_choice: "auto"
  });
};

// 生成建议节点
export const generateSuggestionsNode = async (state) => {
  console.log("步骤4: 生成优化建议...");
  
  const toolBoundModel = createToolBoundModel();
  
  const systemPrompt = `你是一个专业的职业发展顾问。请使用 generate_suggestions 工具基于以下评估结果，为程序员简历提供优化建议：

简历结构：${JSON.stringify(state.formattedResume)}
技能评估：${JSON.stringify(state.skillsEvaluation)}
项目评估：${JSON.stringify(state.projectsEvaluation)}

请提供：
1. 整体评估总结
2. 具体的优化建议（按优先级排序）
3. 技能提升方向
4. 项目经验改进建议

请使用工具来完成建议生成任务。`;

  const response = await toolBoundModel.invoke([
    { role: "system", content: systemPrompt },
    { role: "user", content: "请生成优化建议" }
  ]);
  
  let finalSuggestions = {};
  if (response.tool_calls && response.tool_calls.length > 0) {
    const toolCall = response.tool_calls[0];
    if (toolCall.name === "generate_suggestions") {
      finalSuggestions = await generateSuggestionsWithModel(
        state.formattedResume,
        state.skillsEvaluation,
        state.projectsEvaluation
      );
    }
  }
  
  return {
    finalSuggestions,
    modelResponse: response.content,
    currentStep: "suggestions_generated"
  };
};

// 模型辅助函数 - 建议生成
async function generateSuggestionsWithModel(formattedResume, skillsEvaluation, projectsEvaluation) {
  const systemPrompt = `请基于评估结果生成优化建议。`;

  const response = await llm.invoke([
    { role: "system", content: systemPrompt },
    { role: "user", content: `简历: ${JSON.stringify(formattedResume)}, 技能评估: ${JSON.stringify(skillsEvaluation)}, 项目评估: ${JSON.stringify(projectsEvaluation)}` }
  ]);

  return {
    summary: "模型生成的建议总结",
    detailedSuggestions: response.content,
    priority: "高"
  };
}

export default generateSuggestionsNode;