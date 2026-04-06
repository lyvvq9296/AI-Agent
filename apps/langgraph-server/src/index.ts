import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || "development";

console.log("🚀 LangGraph Server starting...");
console.log(`Environment: ${NODE_ENV}`);
console.log(`Port: ${PORT}`);

// Your application code here
function main() {
  console.log("✅ Server initialized successfully!");
}

main();
