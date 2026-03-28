import llm from "llm-core";
import { allTools } from "../tools/index.js";

// 创建绑定工具后的模型
const createToolBoundModel = () => {
  return llm.bindTools(allTools, {
    tool_choice: "auto"
  });
};

// 简历格式化节点
export const formatResumeNode = async (state) => {
  console.log("步骤1: 格式化简历内容...");
  
  const toolBoundModel = createToolBoundModel();
  
  const systemPrompt = `你是一个专业的简历解析专家。请使用 format_resume 工具将以下简历内容格式化为结构化的JSON格式。

简历内容：${state.resumeText}

请确保解析出以下部分：
1. 个人信息 (personalInfo) - 包含姓名、电话、邮箱、工作年限等
2. 专业技能 (technicalSkills) - 按技术栈分类
3. 项目经验 (projectExperience) - 包含项目名称、时间、职责、技术栈

请使用工具来完成解析任务。`;

  const response = await toolBoundModel.invoke([
    { role: "system", content: systemPrompt },
    { role: "user", content: "请解析这份简历" }
  ]);
  
  // 处理工具调用结果
  let formattedResume = {};
  if (response.tool_calls && response.tool_calls.length > 0) {
    const toolCall = response.tool_calls[0];
    if (toolCall.name === "format_resume") {
      formattedResume = await parseResumeWithModel(state.resumeText);
    }
  }
  
  return {
    formattedResume,
    modelResponse: response.content,
    currentStep: "resume_formatted"
  };
};

// 模型辅助函数 - 简历解析
async function parseResumeWithModel(resumeText) {
  const systemPrompt = `你是一个专业的简历解析专家。请将以下简历内容格式化为结构化的JSON格式。

返回格式：
{
  "personalInfo": {"name": "", "phone": "", "email": "", "workYears": 0},
  "technicalSkills": [],
  "projectExperience": []
}`;

  const response = await llm.invoke([
    { role: "system", content: systemPrompt },
    { role: "user", content: resumeText }
  ]);

  try {
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
  } catch (error) {
    return {};
  }
}

export default formatResumeNode;