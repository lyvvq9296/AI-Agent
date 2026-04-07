import dotenv from "dotenv";
// @ts-ignore
import app from "./agent/index.ts";

// Load environment variables
dotenv.config();

// Check if DeepSeek API key is available
if (!process.env.DEEPSEEK_API_KEY) {
  console.error("❌ DEEPSEEK_API_KEY environment variable is required");
  console.error("Please set DEEPSEEK_API_KEY in your .env file");
  process.exit(1);
}

// Check if Tavily API key is available
if (!process.env.TAVILY_API_KEY) {
  console.error("❌ TAVILY_API_KEY environment variable is required");
  console.error("Please set TAVILY_API_KEY in your .env file");
  process.exit(1);
}

console.log("🚀 LangGraph Agent Server starting...");
console.log("✅ Agent workflow compiled successfully!");

// Export the app for langgraph-cli
export default app;
