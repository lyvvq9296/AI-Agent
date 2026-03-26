# AI Agent Monorepo - 根目录配置

## 项目概述
这是一个 AI Agent 学习项目的 monorepo，包含多个相关但独立的子项目，使用 pnpm workspace 进行管理。

## 项目结构
```
ai-agent-monorepo/
├── package.json              # 根项目配置
├── pnpm-workspace.yaml      # pnpm workspace 配置
├── CLAUDE.md                # 本文件
├── packages/                # 所有子包
│   ├── agent1/              # 智能客服订单助手
│   │   ├── CLAUDE.md        # 包特定配置
│   │   ├── package.json
│   │   └── ...
│   ├── langchain-learning/  # LangChain 学习示例
│   │   ├── CLAUDE.md
│   │   ├── package.json
│   │   └── ...
│   ├── langgraph-learning/  # LangGraph 学习示例
│   │   ├── CLAUDE.md
│   │   ├── package.json
│   │   └── ...
│   ├── node-basic/          # Node.js 基础示例
│   │   ├── CLAUDE.md
│   │   ├── package.json
│   │   └── ...
│   └── resume-optimization/ # 简历优化工具（规划中）
│       ├── CLAUDE.md
│       └── package.json
└── .env                     # 环境变量（共享）
```

## 技术栈
- **包管理**：pnpm workspace
- **语言**：TypeScript + JavaScript (ES Modules)
- **AI 框架**：LangChain, LangGraph
- **LLM**：DeepSeek（通过 OpenAI SDK 兼容接口）
- **运行时**：Node.js

## 环境配置

### 环境变量
- 根目录下的 `.env` 文件包含所有共享环境变量
- 主要变量：
  - `DEEPSEEK_API_KEY`：DeepSeek API 密钥
  - `DEEPSEEK_BASE_URL`：DeepSeek API 端点
  - `TAVILY_API_KEY`：Tavily 搜索 API 密钥（可选）

### 安装依赖
```bash
# 安装 pnpm（如果尚未安装）
npm install -g pnpm

# 安装所有工作空间依赖
pnpm install

# 安装特定包的依赖
pnpm --filter <package-name> install
```

## 开发工作流

### 启动项目
```bash
# 启动特定包
cd packages/<package-name>
pnpm start

# 或从根目录启动
pnpm --filter <package-name> start
```

### 包间依赖
- `agent1` 和 `langgraph-learning` 依赖 `langchain-learning` 的 LLM 配置
- 跨包引用使用相对路径：`../langchain-learning/llm/index.js`
- 共享依赖在根目录的 `devDependencies` 中声明

### 添加新包
1. 在 `packages/` 目录下创建新包
2. 添加 `package.json` 和 `CLAUDE.md`
3. 在包中实现功能
4. 如果需要，更新跨包引用

### 更新共享依赖
1. 在根目录 `package.json` 的 `devDependencies` 中更新版本
2. 运行 `pnpm install` 同步到所有包

## 包详细信息

### agent1
- **功能**：智能客服订单助手
- **特点**：多中间件支持、人机协同、流式输出
- **入口**：`packages/agent1/run.ts`
- **依赖**：TypeScript, tsx, LangChain, LangGraph

### langchain-learning
- **功能**：LangChain 学习示例集合
- **特点**：从基础到高级的完整示例
- **核心**：`llm/index.js` 提供共享 LLM 配置
- **示例**：链式调用、工具使用、Tavily 搜索等

### langgraph-learning
- **功能**：LangGraph 学习示例
- **特点**：有状态工作流、图计算
- **示例**：状态图、函数式图、高级代理

### node-basic
- **功能**：Node.js 基础示例
- **特点**：HTTP 服务器、SSE 流式响应、前端界面
- **入口**：`packages/node-basic/server.js`

### resume-optimization
- **功能**：简历优化工具（规划中）
- **状态**：初始阶段，需要实现
- **规划**：AI 简历分析、优化建议、模板生成

## 开发规范

### 代码风格
- 使用 ES Modules 导入导出
- TypeScript 项目使用严格类型检查
- 保持代码简洁，添加必要注释
- 遵循现有项目的代码组织模式

### 提交规范
- 提交信息清晰描述变更内容
- 关联具体包或全局变更
- 避免提交 `.env` 文件等敏感信息

### 测试建议
- 每个包可以有自己的测试策略
- 优先测试核心功能
- 确保跨包引用正常工作

## 故障排除

### 常见问题
1. **环境变量未加载**：确认 `.env` 文件在根目录且格式正确
2. **跨包引用错误**：检查相对路径是否正确
3. **依赖安装失败**：尝试删除 `node_modules` 和 `pnpm-lock.yaml` 后重新安装
4. **TypeScript 错误**：检查 tsconfig 配置和类型定义

### 调试建议
1. 从最简单的示例开始测试
2. 验证环境变量是否正确加载
3. 使用 console.log 调试关键步骤
4. 检查网络连接和 API 密钥

## 扩展建议

### 添加新功能
1. 评估功能属于现有包还是需要新包
2. 遵循现有架构模式
3. 更新相关文档
4. 测试跨包兼容性

### 性能优化
1. 共享依赖版本保持一致
2. 避免重复的依赖声明
3. 合理设计包边界
4. 考虑构建优化（如需要）

### 文档维护
1. 每个包的 `CLAUDE.md` 保持更新
2. 根目录文档反映整体结构变化
3. 添加示例代码和使用说明
4. 记录重要的架构决策