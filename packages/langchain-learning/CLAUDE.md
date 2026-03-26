# langchain-learning - LangChain 学习示例

## 项目描述
这是一个 LangChain 学习项目，包含多个基础到高级的示例，帮助理解 LangChain 的核心概念和功能。

## 技术栈
- LangChain 核心库
- DeepSeek LLM
- JavaScript (ES Modules)

## 示例文件说明

### 核心示例
1. `chain.js` - 基础链式调用，包含提示模板、LLM、输出解析器
   - 演示如何创建简单的链式调用
   - 包含组合链的示例（生成笑话并分析）

2. `simple-llm-app.js` - 最简单的 LLM 调用示例
   - 直接调用 LLM 的基本用法

3. `chatbot.js` - 聊天机器人示例
   - 演示多轮对话的实现

4. `few-shot.js` - 少样本学习示例
   - 使用示例来引导模型生成特定格式的输出

5. `cot.js` - 思维链 (Chain of Thought) 示例
   - 演示如何让模型展示推理过程

6. `structure-output.js` - 结构化输出示例
   - 使用 Zod 定义输出格式，确保结构化响应

7. `tools.js` - 工具调用示例
   - 演示如何定义和使用工具

8. `tavily.js` - Tavily 搜索集成示例
   - 演示如何集成 Tavily 搜索工具
   - 需要 TAVILY_API_KEY 环境变量

9. `parallel.js` - 并行处理示例
   - 演示同时处理多个任务

### 共享组件
- `llm/index.js` - LLM 配置
  - 配置 DeepSeek Chat 模型
  - 被其他包（如 agent1）引用

## 重要注意事项

### 环境变量
- 需要 `.env` 文件包含 `DEEPSEEK_API_KEY` 和 `DEEPSEEK_BASE_URL`
- Tavily 示例还需要 `TAVILY_API_KEY`
- 环境变量文件位于项目根目录（../.env）

### 跨包引用
- `llm/index.js` 被 agent1 包引用
- 确保此文件保持稳定，避免破坏依赖

### 运行方式
```bash
# 运行特定示例
node chain.js
node chatbot.js
node tavily.js

# 从根目录运行
pnpm --filter langchain-learning start  # 默认运行 chain.js
```

## 学习路径建议

### 初学者
1. 从 `simple-llm-app.js` 开始，了解基础 LLM 调用
2. 学习 `chain.js` 理解链式调用
3. 尝试 `chatbot.js` 实现简单对话

### 中级
1. 学习 `few-shot.js` 和 `cot.js` 提升提示工程
2. 掌握 `structure-output.js` 确保输出格式
3. 学习 `tools.js` 扩展功能

### 高级
1. 学习 `tavily.js` 集成外部工具
2. 学习 `parallel.js` 优化性能

## 开发指导

### 添加新示例
1. 创建新的 `.js` 文件
2. 从 `llm/index.js` 导入配置好的 LLM
3. 保持代码简洁，专注于单一概念
4. 添加适当的注释说明

### 修改 LLM 配置
- 只在 `llm/index.js` 中修改 LLM 配置
- 注意更改可能影响依赖此配置的其他包
- 考虑向后兼容性

### 测试新功能
1. 先在小示例中测试
2. 确保环境变量正确设置
3. 验证输出是否符合预期

## 调试建议
1. 检查环境变量是否正确加载
2. 验证 API 密钥是否有有效
3. 使用 console.log 调试中间结果
4. 注意异步/等待语法的正确使用