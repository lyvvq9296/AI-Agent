import createModularResumeOptimizationAgent from "./agent.js";
import readline from "readline";

// 创建命令行界面
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// 示例简历文本（用于测试）
const sampleResume = `
张三
电话：138-0000-0000 | 邮箱：zhangsan@email.com | 工作年限：3年

专业技能：
- 编程语言：JavaScript (熟练), TypeScript (熟练), Python (了解)
- 前端框架：React (熟练), Vue.js (了解)
- 后端技术：Node.js (熟练), Express (熟练)
- 数据库：MySQL (熟练), MongoDB (了解)
- 工具：Git, Webpack, Docker

项目经验：
1. 电商平台开发 (2022.03-2023.06)
   - 负责前端页面开发，使用 React + TypeScript
   - 实现用户登录、商品展示、购物车功能
   - 优化页面加载性能，减少首屏加载时间30%

2. 内部管理系统 (2021.07-2022.02)
   - 使用 Vue.js + Element UI 开发管理后台
   - 实现数据可视化图表和报表功能
   - 与后端团队协作完成 API 接口对接

3. 个人博客系统 (2020.10-2021.06)
   - 使用 Node.js + Express 搭建后端服务
   - 前端使用原生 JavaScript 开发
   - 实现文章发布、评论功能
`;

// 主函数
async function main() {
  console.log("=== 程序员简历优化工具 ===\n");

  // 询问用户选择
  rl.question(
    "请选择输入方式：\n1. 使用示例简历\n2. 输入自定义简历文本\n3. 从文件读取简历\n请选择 (1/2/3): ",
    async (choice) => {
      let resumeText = "";

      switch (choice) {
        case "1":
          resumeText = sampleResume;
          console.log("\n使用示例简历进行优化...\n");
          break;

        case "2":
          resumeText = await new Promise((resolve) => {
            rl.question("\n请输入简历文本（输入完成后按回车）：\n", resolve);
          });
          break;

        case "3":
          console.log("文件读取功能暂未实现，使用示例简历...\n");
          resumeText = sampleResume;
          break;

        default:
          console.log("无效选择，使用示例简历...\n");
          resumeText = sampleResume;
          break;
      }

      if (!resumeText.trim()) {
        console.log("简历内容为空，使用示例简历...\n");
        resumeText = sampleResume;
      }

      try {
        // 创建优化 Agent
        const agent = createModularResumeOptimizationAgent();

        console.log("开始分析简历...\n");

        // 执行优化流程
        const result = await agent.optimizeResume(resumeText);

        // 显示优化结果
        displayOptimizationResult(result);
      } catch (error) {
        console.error("简历优化过程中出现错误：", error);
      } finally {
        rl.close();
      }
    },
  );
}

// 显示优化结果
function displayOptimizationResult(result) {
  console.log("\n" + "=".repeat(60));
  console.log("简历优化结果报告");
  console.log("=".repeat(60));

  // 显示格式化后的简历
  console.log("\n1. 简历结构分析：");
  console.log(JSON.stringify(result.formattedResume, null, 2));

  // 显示技能评估
  console.log("\n2. 专业技能评估：");
  if (result.skillsEvaluation) {
    console.log("深度评估：", result.skillsEvaluation.depthAssessment);
    console.log("广度评估：", result.skillsEvaluation.breadthAssessment);
    console.log("匹配度：", result.skillsEvaluation.matchAssessment);
    console.log("改进建议：");
    result.skillsEvaluation.suggestions?.forEach((suggestion, index) => {
      console.log(`  ${index + 1}. ${suggestion}`);
    });
  }

  // 显示项目评估
  console.log("\n3. 项目经验评估：");
  if (result.projectsEvaluation) {
    console.log("复杂度评估：", result.projectsEvaluation.complexityAssessment);
    console.log("职责评估：", result.projectsEvaluation.responsibilityAssessment);
    console.log("成长评估：", result.projectsEvaluation.growthAssessment);
    console.log("匹配度：", result.projectsEvaluation.matchAssessment);
    console.log("改进建议：");
    result.projectsEvaluation.suggestions?.forEach((suggestion, index) => {
      console.log(`  ${index + 1}. ${suggestion}`);
    });
  }

  // 显示最终建议
  console.log("\n4. 优化建议：");
  if (result.finalSuggestions) {
    console.log("总结：", result.finalSuggestions.summary);
    console.log("详细建议：");
    console.log(result.finalSuggestions.detailedSuggestions);
  }

  // 显示总结
  console.log("\n5. 综合总结：");
  console.log(result.summary || "总结生成中...");

  console.log("\n" + "=".repeat(60));
  console.log("简历优化完成！");
  console.log("=".repeat(60));
}

// 导出主要功能供其他模块使用
export { createModularResumeOptimizationAgent };

// 如果直接运行此文件，启动命令行界面
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
