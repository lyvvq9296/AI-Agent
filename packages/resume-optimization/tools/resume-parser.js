import { tool } from "langchain";
import { z } from "zod";

// 简历内容格式化工具
const formatResumeSchema = z.object({
  resumeText: z.string().describe("原始简历文本内容")
});

export const formatResumeTool = tool(
  async ({ resumeText }) => {
    // 工具只负责简历解析的接口定义
    // 实际的解析逻辑将由绑定工具后的模型处理
    return {
      status: "ready_for_parsing",
      resumeLength: resumeText.length,
      estimatedSections: ["personalInfo", "technicalSkills", "projectExperience"],
      toolName: "format_resume"
    };
  },
  {
    name: "format_resume",
    description: "将原始简历文本格式化为结构化的个人信息、专业技能和项目经验",
    schema: formatResumeSchema
  }
);

export default formatResumeTool;