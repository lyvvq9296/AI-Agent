import { createModularResumeOptimizationAgent } from "./agent.js";

// 测试简历文本
const testResume = `
赵六
电话：136-0000-0000 | 邮箱：zhaoliu@email.com | 工作年限：4年

专业技能：
- 前端技术：HTML/CSS (精通), JavaScript (精通), React (精通), Vue.js (熟练)
- 后端技术：Node.js (熟练), Python (了解), Django (了解)
- 数据库：MySQL (熟练), MongoDB (熟练), Redis (了解)
- 工具：Git, Docker, Jenkins, Webpack

项目经验：
1. 大型电商平台 (2022.03-至今)
   - 担任前端技术负责人，带领3人团队
   - 使用 React + TypeScript 重构前端架构
   - 实现微前端架构，提升开发效率和系统可维护性
   - 优化性能，减少首屏加载时间40%

2. 企业内部管理系统 (2020.08-2022.02)
   - 负责全栈开发，使用 Vue.js + Node.js
   - 设计并实现权限管理系统
   - 集成第三方API，实现数据同步功能
   - 带领2名初级开发人员完成项目

3. 移动端应用开发 (2019.01-2020.07)
   - 使用 React Native 开发跨平台应用
   - 实现用户认证、数据同步等核心功能
   - 优化应用性能，提升用户体验
`;

async function testModularAgent() {
  console.log("开始测试模块化架构的简历优化 Agent...\n");
  
  try {
    // 创建优化 Agent
    const agent = createModularResumeOptimizationAgent();
    
    // 获取工作流信息
    const workflowInfo = agent.getWorkflowInfo();
    console.log("1. 工作流信息：");
    console.log("   节点数量:", workflowInfo.nodes.length);
    console.log("   节点列表:", workflowInfo.nodes);
    console.log("   已编译:", workflowInfo.compiled);
    
    console.log("\n2. 测试完整优化流程...");
    const result = await agent.optimizeResume(testResume);
    
    console.log("✅ 优化流程执行成功！");
    
    // 验证结果结构
    console.log("\n3. 验证结果结构...");
    
    if (result.formattedResume) {
      console.log("✅ 简历格式化成功");
      console.log("   个人信息字段:", Object.keys(result.formattedResume.personalInfo || {}));
      console.log("   技能数量:", (result.formattedResume.technicalSkills || []).length);
      console.log("   项目数量:", (result.formattedResume.projectExperience || []).length);
    }
    
    if (result.skillsEvaluation) {
      console.log("✅ 技能评估成功");
      console.log("   评估维度:", Object.keys(result.skillsEvaluation));
    }
    
    if (result.projectsEvaluation) {
      console.log("✅ 项目评估成功");
      console.log("   评估维度:", Object.keys(result.projectsEvaluation));
    }
    
    if (result.finalSuggestions) {
      console.log("✅ 建议生成成功");
      console.log("   建议结构:", Object.keys(result.finalSuggestions));
    }
    
    if (result.summary) {
      console.log("✅ 总结生成成功");
      console.log("   总结长度:", result.summary.length, "字符");
    }
    
    if (result.modelResponse) {
      console.log("✅ 模型响应记录成功");
    }
    
    console.log("\n4. 显示部分优化结果...");
    console.log("=" .repeat(50));
    
    // 显示关键评估结果
    if (result.skillsEvaluation) {
      console.log("\n专业技能评估:");
      console.log("深度:", result.skillsEvaluation.depthAssessment?.substring(0, 50) + "...");
      console.log("匹配度:", result.skillsEvaluation.matchAssessment?.substring(0, 50) + "...");
    }
    
    if (result.projectsEvaluation) {
      console.log("\n项目经验评估:");
      console.log("复杂度:", result.projectsEvaluation.complexityAssessment?.substring(0, 50) + "...");
      console.log("匹配度:", result.projectsEvaluation.matchAssessment?.substring(0, 50) + "...");
    }
    
    if (result.summary) {
      console.log("\n综合总结 (前200字符):");
      console.log(result.summary.substring(0, 200) + "...");
    }
    
    console.log("\n" + "=" .repeat(50));
    console.log("✅ 模块化架构测试完成！");
    
  } catch (error) {
    console.error("❌ 测试过程中出现错误:", error);
    console.error("错误堆栈:", error.stack);
  }
}

// 运行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  testModularAgent().catch(console.error);
}

export default testModularAgent;