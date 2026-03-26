# langgraph-learning - LangGraph 学习示例

## 项目描述
这是一个 LangGraph 学习项目，演示如何使用 LangGraph 构建复杂的代理工作流和有状态应用程序。LangGraph 是 LangChain 的扩展，专注于构建多步骤、有状态的工作流。

## 技术栈
- LangGraph（基于 LangChain）
- DeepSeek LLM
- JavaScript (ES Modules)

## 示例文件说明

### 核心示例
1. `graph.js` - 基础图工作流示例
   - 演示如何创建状态图（StateGraph）
   - 定义节点（LLM 调用、工具调用）
   - 条件边和边连接
   - 内存检查点（MemorySaver）实现状态持久化
   - 简单算术代理：加法、乘法、除法

2. `graph-function.js` - 函数式图定义示例
   - 演示使用函数式风格定义图
   - 更复杂的工具调用流程
   - 展示不同的图设计模式

3. `agent.js` - 高级代理示例
   - 更完整的代理实现
   - 可能包含更复杂的工作流逻辑

## 重要概念

### 状态图（StateGraph）
- 定义应用程序的状态结构
- 使用 Zod 进行状态类型定义
- 包含消息历史和 LLM 调用计数

### 节点（Nodes）
- `llmCall`：LLM 调用节点，处理用户输入并决定是否调用工具
- `toolNode`：工具调用节点，执行具体的工具操作

### 边（Edges）
- `START` → `LLM_CALL`：初始边
- 条件边：根据 LLM 输出决定下一步（继续工具调用或结束）
- `TOOL_NODE` → `LLM_CALL`：工具执行后返回 LLM

### 检查点（Checkpointer）
- `MemorySaver`：内存中的状态保存
- 支持多轮对话的状态保持
- 线程 ID 管理不同会话

## 重要注意事项

### 环境变量
- 需要 `.env` 文件包含 `DEEPSEEK_API_KEY` 和 `DEEPSEEK_BASE_URL`
- 环境变量文件位于项目根目录（../.env）

### 跨包引用
- 从 `llm-core` 导入 LLM 配置
- 确保 langchain-learning 包已正确配置

### 运行方式
```bash
# 运行基础图示例
node graph.js

# 运行函数式图示例
node graph-function.js

# 运行高级代理示例
node agent.js

# 从根目录运行
pnpm --filter langgraph-learning start  # 默认运行 graph.js
```

## 学习路径建议

### 初学者
1. 从 `graph.js` 开始，理解基本概念
2. 学习状态定义、节点创建、边连接
3. 理解条件边的使用场景

### 中级
1. 学习 `graph-function.js` 的不同设计模式
2. 理解函数式图定义的优点
3. 学习如何组织更复杂的工作流

### 高级
1. 学习 `agent.js` 的完整代理实现
2. 理解如何结合多种工具和逻辑
3. 学习状态管理和持久化最佳实践

## 开发指导

### 创建新图
1. 定义状态结构（使用 Zod）
2. 创建节点函数
3. 构建图并添加节点
4. 连接边（包括条件边）
5. 编译图并创建检查点

### 添加新工具
1. 在工具对象中定义新工具
2. 在 `toolsByName` 映射中添加
3. 确保工具函数正确处理输入输出

### 状态管理
1. 合理设计状态结构
2. 使用检查点保持会话状态
3. 注意状态清理和内存管理

### 错误处理
1. 在节点函数中添加适当的错误处理
2. 考虑工具调用失败的情况
3. 实现重试逻辑（如果需要）

## 调试建议
1. 使用 console.log 检查状态变化
2. 验证工具调用参数和返回值
3. 检查条件边的逻辑判断
4. 确认检查点正确保存和恢复状态

## 性能优化
1. 避免在状态中存储大量数据
2. 合理设计图结构，减少不必要的节点
3. 考虑异步操作的并行处理