import formatResumeTool from "./resume-parser.js";
import evaluateSkillsTool from "./skills-evaluator.js";
import evaluateProjectsTool from "./projects-evaluator.js";
import generateSuggestionsTool from "./suggestions-generator.js";

// 导出所有工具
const allTools = [
  formatResumeTool,
  evaluateSkillsTool,
  evaluateProjectsTool,
  generateSuggestionsTool
];

export {
  formatResumeTool,
  evaluateSkillsTool,
  evaluateProjectsTool,
  generateSuggestionsTool,
  allTools
};

export default allTools;