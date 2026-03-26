# agent1 - 智能客服订单助手

## 项目描述
这是一个基于 LangChain 的智能客服订单助手，具备以下功能：
- 查询订单状态
- 查询天气信息
- 处理订单退款操作
- 包含多种中间件：人机协同、调用限制、模型降级、工具重试、PII信息保护等

## 技术栈
- LangChain
- LangGraph（用于状态管理和检查点）
- DeepSeek LLM
- TypeScript + tsx
- Zod（用于类型验证）

## 文件结构
- `agent.ts` - 主要代理配置，包含系统提示、工具和中间件
- `tools.ts` - 工具函数定义（查询订单、获取天气、处理退款）
- `middlewares.ts` - 中间件实现
- `run.ts` - 运行示例，演示人机协同审批流程
- `run-stream.ts` - 流式输出示例

## 重要注意事项

### 环境变量
- 需要 `.env` 文件包含 `DEEPSEEK_API_KEY` 和 `DEEPSEEK_BASE_URL`
- 环境变量文件位于项目根目录（../.env）

### 跨包引用
- LLM 实例从 `../langchain-learning/llm/index.js` 导入
- 确保 langchain-learning 包已正确配置

### 中间件功能
1. **PII 保护**：检测并处理电子邮件和信用卡号
2. **调用限制**：限制工具调用次数
3. **模型降级**：在主要模型失败时使用备选模型
4. **人机协同**：需要人工审批的操作会触发中断
5. **工具重试**：失败时自动重试工具调用
6. **摘要生成**：生成对话摘要

### 运行方式
```bash
# 从 agent1 目录
pnpm start

# 从根目录
pnpm --filter agent1 start
```

## 开发指导

### 添加新工具
1. 在 `tools.ts` 中定义新工具函数
2. 在 `agent.ts` 的 `tools` 数组中添加工具
3. 更新系统提示以包含新功能描述

### 添加新中间件
1. 在 `middlewares.ts` 中实现中间件逻辑
2. 在 `agent.ts` 的 `middleware` 数组中添加中间件
3. 注意中间件执行顺序

### 测试人机协同
- `run.ts` 中包含了完整的人机协同审批示例
- 可以测试批准、编辑后批准、拒绝三种审批场景

### 流式输出
- `run-stream.ts` 演示了流式输出功能
- 适用于实时交互场景

## 调试建议
1. 检查环境变量是否正确设置
2. 确认 langchain-learning 包的 LLM 配置
3. 查看中间件日志了解处理流程
4. 使用 TypeScript 类型检查确保类型安全