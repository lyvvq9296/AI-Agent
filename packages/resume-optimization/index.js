import llm from "llm-core";
import { createAgent, tool } from "langchain";
import * as z from "zod";
import { MemorySaver } from "@langchain/langgraph";
import { StateGraph, START, END } from "@langchain/langgraph";

// 定义工具：解析简历
const parseResume = tool(
  async ({ resumeText }) => {
    // 简单解析简历文本，提取关键信息
    console.log(`正在解析简历，长度: ${resumeText.length} 字符`);

    // 这里可以添加更复杂的解析逻辑
    // 暂时返回模拟数据，但基于输入简历的内容
    const lines = resumeText.split('\n').slice(0, 10);
    const personalInfo = lines[0] || "未找到个人信息";

    return {
      personalInfo: personalInfo,
      skills: ["JavaScript", "TypeScript", "React", "Vue.js", "Node.js"],
      projects: [
        {
          name: "示例项目",
          description: "基于简历内容解析的项目",
          duration: "6个月",
          technologies: ["React", "Node.js"]
        }
      ],
      workExperience: 3  // 改为数字类型，与其他工具匹配
    };
  },
  {
    name: "parse_resume",
    description: "解析简历文本，提取结构化信息",
    schema: z.object({
      resumeText: z.string().describe("程序员简历的完整文本内容")
    })
  }
);

// 定义工具：分析专业技能
const analyzeSkills = tool(
  async ({ skills, workExperience }) => {
    // 分析技能深度、广度与工作年限的匹配度
    const depth = skills.length > 5 ? "高" : "中";
    const breadth = skills.length > 8 ? "广" : "适中";
    const matchWithExperience = workExperience >= 3 && skills.length >= 5 ? "匹配" : "待提升";

    return {
      skillDepth: depth,
      skillBreadth: breadth,
      experienceMatch: matchWithExperience,
      suggestions: skills.length < 3 ? "建议增加更多专业技能" : "专业技能结构合理"
    };
  },
  {
    name: "analyze_skills",
    description: "分析专业技能的深度、广度，判断是否与工作年限相匹配",
    schema: z.object({
      skills: z.array(z.string()).describe("专业技能列表"),
      workExperience: z.number().describe("工作年限（年）")
    })
  }
);

// 定义工具：分析项目经验
const analyzeProjects = tool(
  async ({ projects, workExperience }) => {
    // 分析项目内容的深度和难度
    const projectCount = projects.length;
    const avgDuration = projects.reduce((sum, p) => {
      const months = parseInt(p.duration) || 6;
      return sum + months;
    }, 0) / projectCount;

    const complexity = avgDuration > 12 ? "高" : avgDuration > 6 ? "中" : "低";
    const matchWithExperience = workExperience >= 3 && projectCount >= 3 ? "匹配" : "待提升";

    return {
      projectCount,
      averageDuration: avgDuration.toFixed(1) + "个月",
      complexity,
      experienceMatch: matchWithExperience,
      suggestions: projectCount < 2 ? "建议增加项目经验描述" : "项目经验丰富"
    };
  },
  {
    name: "analyze_projects",
    description: "分析项目经验的内容、难度，判断是否与工作经验相匹配",
    schema: z.object({
      projects: z.array(z.object({
        name: z.string(),
        description: z.string(),
        duration: z.string(),
        technologies: z.array(z.string())
      })).describe("项目经验列表"),
      workExperience: z.number().describe("工作年限（年）")
    })
  }
);

// 定义工具：生成建议
const generateSuggestions = tool(
  async ({ personalInfo, skillAnalysis, projectAnalysis }) => {
    // 汇总所有分析结果，生成最终建议
    const suggestions = [
      `个人信息分析：${personalInfo}`,
      `专业技能分析：深度${skillAnalysis.skillDepth}，广度${skillAnalysis.skillBreadth}，与工作年限${skillAnalysis.experienceMatch}`,
      `项目经验分析：${projectAnalysis.projectCount}个项目，平均${projectAnalysis.averageDuration}，复杂度${projectAnalysis.complexity}，与经验${projectAnalysis.experienceMatch}`,
      `优化建议：${skillAnalysis.suggestions}；${projectAnalysis.suggestions}`
    ];

    return {
      summary: "简历优化分析完成",
      suggestions: suggestions.join("\n"),
      recommendations: [
        "1. 确保简历格式清晰，突出关键技能",
        "2. 量化项目成果，使用具体数字",
        "3. 根据目标职位调整技能描述",
        "4. 突出与岗位要求最匹配的项目经验"
      ]
    };
  },
  {
    name: "generate_suggestions",
    description: "汇总所有分析结果，生成最终的简历优化建议",
    schema: z.object({
      personalInfo: z.string().describe("个人信息"),
      skillAnalysis: z.object({
        skillDepth: z.string(),
        skillBreadth: z.string(),
        experienceMatch: z.string(),
        suggestions: z.string()
      }).describe("技能分析结果"),
      projectAnalysis: z.object({
        projectCount: z.number(),
        averageDuration: z.string(),
        complexity: z.string(),
        experienceMatch: z.string(),
        suggestions: z.string()
      }).describe("项目分析结果")
    })
  }
);

// ==================== LangGraph 工作流定义 ====================

import { registry } from "@langchain/langgraph/zod";

// 定义状态模式
const ResumeAnalysisState = z.object({
  // 输入
  resumeText: z.string().describe("原始简历文本"),

  // 解析结果
  parsedData: z.object({
    personalInfo: z.string().optional(),
    skills: z.array(z.string()).optional(),
    projects: z.array(z.object({
      name: z.string(),
      description: z.string(),
      duration: z.string(),
      technologies: z.array(z.string())
    })).optional(),
    workExperience: z.number().optional()
  }).optional(),

  // 分析结果
  skillAnalysis: z.object({
    skillDepth: z.string().optional(),
    skillBreadth: z.string().optional(),
    experienceMatch: z.string().optional(),
    suggestions: z.string().optional()
  }).optional(),

  projectAnalysis: z.object({
    projectCount: z.number().optional(),
    averageDuration: z.string().optional(),
    complexity: z.string().optional(),
    experienceMatch: z.string().optional(),
    suggestions: z.string().optional()
  }).optional(),

  // 最终输出
  finalSuggestions: z.object({
    summary: z.string().optional(),
    suggestions: z.string().optional(),
    recommendations: z.array(z.string()).optional()
  }).optional(),

  // 控制流
  currentStep: z.string().optional()
});

// 定义节点函数
const parseResumeNode = async (state) => {
  console.log("步骤1: 解析简历...");

  const parsedResult = await parseResume.invoke({
    resumeText: state.resumeText
  });

  return {
    parsedData: parsedResult,
    currentStep: "resume_parsed"
  };
};

const analyzeSkillsNode = async (state) => {
  console.log("步骤2: 分析专业技能...");

  if (!state.parsedData) {
    throw new Error("需要先解析简历才能分析技能");
  }

  const skillResult = await analyzeSkills.invoke({
    skills: state.parsedData.skills || [],
    workExperience: state.parsedData.workExperience || 0
  });

  return {
    skillAnalysis: skillResult,
    currentStep: "skills_analyzed"
  };
};

const analyzeProjectsNode = async (state) => {
  console.log("步骤3: 分析项目经验...");

  if (!state.parsedData) {
    throw new Error("需要先解析简历才能分析项目");
  }

  const projectResult = await analyzeProjects.invoke({
    projects: state.parsedData.projects || [],
    workExperience: state.parsedData.workExperience || 0
  });

  return {
    projectAnalysis: projectResult,
    currentStep: "projects_analyzed"
  };
};

const generateSuggestionsNode = async (state) => {
  console.log("步骤4: 生成优化建议...");

  if (!state.parsedData || !state.skillAnalysis || !state.projectAnalysis) {
    throw new Error("需要先完成所有分析才能生成建议");
  }

  const suggestionsResult = await generateSuggestions.invoke({
    personalInfo: state.parsedData.personalInfo || "未提供",
    skillAnalysis: state.skillAnalysis,
    projectAnalysis: state.projectAnalysis
  });

  return {
    finalSuggestions: suggestionsResult,
    currentStep: "suggestions_generated"
  };
};

// 创建状态图
const workflow = new StateGraph(ResumeAnalysisState)
  .addNode("parse_resume", parseResumeNode)
  .addNode("analyze_skills", analyzeSkillsNode)
  .addNode("analyze_projects", analyzeProjectsNode)
  .addNode("generate_suggestions", generateSuggestionsNode)

  // 定义边
  .addEdge(START, "parse_resume")
  .addEdge("parse_resume", "analyze_skills")
  .addEdge("analyze_skills", "analyze_projects")
  .addEdge("analyze_projects", "generate_suggestions")
  .addEdge("generate_suggestions", END);

const checkpointer = new MemorySaver();
const graph = workflow.compile({ checkpointer });

// 创建 agent（兼容原有接口）
const agent = {
  invoke: async (input, config) => {
    const initialState = {
      resumeText: input.messages[0]?.content || "",
      currentStep: "start"
    };

    const result = await graph.invoke(initialState, config);

    // 转换为与原来类似的格式
    const lastMessage = {
      role: "assistant",
      content: result.finalSuggestions?.suggestions || "无结果"
    };

    return {
      messages: [lastMessage],
      finalState: result
    };
  }
};

// 主函数：处理简历优化
async function optimizeResume(resumeText) {
  console.log("开始分析简历...");
  console.log("简历文本长度:", resumeText.length, "字符");

  try {
    const config = { configurable: { thread_id: "resume_optimization_" + Date.now() } };

    // 直接使用图进行调用
    const initialState = {
      resumeText: resumeText,
      currentStep: "start"
    };

    console.log("\n=== 开始 LangGraph 工作流 ===");
    const result = await graph.invoke(initialState, config);

    console.log("\n=== 简历优化分析结果 ===");
    if (result.finalSuggestions) {
      console.log("总结:", result.finalSuggestions.summary);
      console.log("\n具体建议:");
      console.log(result.finalSuggestions.suggestions);
      console.log("\n推荐优化步骤:");
      result.finalSuggestions.recommendations?.forEach((rec, i) => {
        console.log(`${i + 1}. ${rec}`);
      });
    } else {
      console.log("无分析结果");
    }

    console.log("\n=== 分析状态 ===");
    console.log("完成步骤:", result.currentStep);
    console.log("解析数据:", result.parsedData ? "✓" : "✗");
    console.log("技能分析:", result.skillAnalysis ? "✓" : "✗");
    console.log("项目分析:", result.projectAnalysis ? "✓" : "✗");

    return result;
  } catch (error) {
    console.error("简历分析出错:", error);
    throw error;
  }
}

// 示例简历
const sampleResume = `
张三
电话：13800138000 | 邮箱：zhangsan@email.com | GitHub: github.com/zhangsan

求职意向：高级前端开发工程师

专业技能：
- 熟练掌握 JavaScript、TypeScript、HTML5、CSS3
- 熟悉 React、Vue.js、Next.js 框架
- 了解 Webpack、Vite 构建工具
- 掌握 Node.js、Express 后端开发
- 了解 Docker、Kubernetes 容器化技术

工作经历：
- ABC科技有限公司，前端开发工程师，2021年7月 - 至今（3年）
- XYZ软件公司，前端开发实习生，2020年6月 - 2021年6月（1年）

项目经验：
1. 电商平台前端重构
   - 使用 React + TypeScript 重构旧版电商平台
   - 实现组件化开发，提升代码复用率 40%
   - 优化页面加载速度，首屏加载时间减少 30%
   - 项目周期：8个月

2. 企业内部管理系统
   - 使用 Vue.js + Element UI 开发管理系统
   - 实现权限管理、数据可视化等功能
   - 支持 500+ 用户同时在线使用
   - 项目周期：6个月

3. 移动端 H5 应用
   - 使用 React Native 开发跨平台移动应用
   - 集成第三方支付、地图等 SDK
   - 应用上线后获得 10万+ 下载
   - 项目周期：4个月

教育背景：
- 某某大学，计算机科学与技术，本科，2016年9月 - 2020年6月
`;

// 如果是直接运行此文件，则执行示例
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("运行简历优化示例...");
  optimizeResume(sampleResume)
    .then(() => console.log("\n分析完成！"))
    .catch(console.error);
}

export {
  agent,
  optimizeResume,
  parseResume,
  analyzeSkills,
  analyzeProjects,
  generateSuggestions,
  graph,
  workflow,
  ResumeAnalysisState
};