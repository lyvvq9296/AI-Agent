import llm from "llm-core";

// 结果总结节点
export const summarizeResultsNode = async (state) => {
  console.log("步骤5: 总结评估结果...");
  
  const systemPrompt = `你是一个专业的职业顾问。请基于以下完整的评估结果，为用户提供一个简洁明了的总结：

简历结构：${JSON.stringify(state.formattedResume, null, 2)}
技能评估：${JSON.stringify(state.skillsEvaluation, null, 2)}
项目评估：${JSON.stringify(state.projectsEvaluation, null, 2)}
优化建议：${JSON.stringify(state.finalSuggestions, null, 2)}

请用中文提供一个结构化的总结，包含：
1. 整体评估等级（优秀/良好/一般/需要改进）
2. 主要优势
3. 关键改进点
4. 下一步行动建议`;

  const response = await llm.invoke([
    { role: "system", content: systemPrompt },
    { role: "user", content: "请生成总结报告" }
  ]);
  
  return {
    summary: response.content,
    currentStep: "completed"
  };
};

export default summarizeResultsNode;