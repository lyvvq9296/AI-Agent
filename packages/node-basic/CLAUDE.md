# node-basic - Node.js 基础示例

## 项目描述
这是一个基础的 Node.js 项目，演示如何使用 OpenAI/DeepSeek API 构建简单的 Web 服务器和流式聊天应用。包含 HTTP 服务器、HTML 页面服务和 SSE（Server-Sent Events）流式响应。

## 技术栈
- Node.js 原生 HTTP 模块
- OpenAI SDK（配置为 DeepSeek）
- HTML/CSS/JavaScript（前端）
- Server-Sent Events (SSE) 用于流式响应

## 文件结构说明

### 核心文件
1. `server.js` - 主服务器文件
   - HTTP 服务器实现
   - 静态文件服务（chat.html）
   - 聊天 API 端点（/api/chat）
   - SSE 流式响应实现

2. `chat.html` - 聊天界面
   - 前端 HTML/CSS/JavaScript
   - 使用 Fetch API 和 SSE
   - 实时消息显示

3. `stream.js` - 流式响应示例
   - 演示直接使用 OpenAI SDK 的流式功能
   - 命令行流式输出

4. `reason.js` - 推理示例
   - 可能包含更复杂的推理逻辑
   - 演示思考过程或链式调用

### 依赖关系
- `openai`：配置为使用 DeepSeek API
- `dotenv`：环境变量管理

## 重要注意事项

### 环境变量
- 需要 `.env` 文件包含：
  - `DEEPSEEK_API_KEY`：DeepSeek API 密钥
  - `DEEPSEEK_BASE_URL`：DeepSeek API 端点
- 环境变量文件位于项目根目录（../.env）

### API 配置
- OpenAI SDK 被配置为使用 DeepSeek
- 模型使用 "deepseek-chat"
- 温度设置为 0.7，max_tokens 为 2048

### 运行方式
```bash
# 启动 Web 服务器
node server.js
# 服务器将在 http://localhost:3000 启动

# 运行流式示例
node stream.js

# 运行推理示例
node reason.js

# 从根目录运行
pnpm --filter node-basic start  # 默认运行 server.js
```

## 功能特性

### Web 服务器功能
1. **静态文件服务**：提供 chat.html 页面
2. **聊天 API**：POST /api/chat 处理用户消息
3. **流式响应**：使用 SSE 实时返回 AI 响应
4. **CORS 支持**：允许跨域请求
5. **错误处理**：基本的错误处理和状态码返回

### 前端功能
1. **实时聊天界面**：输入框和消息显示区域
2. **流式显示**：逐字显示 AI 响应
3. **滚动管理**：自动滚动到最新消息
4. **基本样式**：简洁的聊天界面设计

### 命令行功能
1. `stream.js`：命令行流式输出演示
2. 可能包含其他实用示例

## 开发指导

### 修改服务器配置
1. 端口配置：修改 `server.js` 中的 `port` 变量
2. API 路径：修改路由处理逻辑
3. 模型参数：调整 temperature、max_tokens 等

### 添加新路由
1. 在 `server.js` 的请求处理函数中添加新路由
2. 实现对应的处理逻辑
3. 添加适当的错误处理

### 修改前端界面
1. 编辑 `chat.html` 文件
2. 可以修改样式、布局或交互逻辑
3. 注意保持与后端 API 的兼容性

### 添加新示例
1. 创建新的 `.js` 文件
2. 导入必要的模块（openai, dotenv）
3. 实现特定功能
4. 添加使用说明

## 安全注意事项

### CORS 配置
- 当前配置允许所有来源（`*`）
- 生产环境应限制为特定域名

### 错误处理
- 客户端错误应返回适当的 HTTP 状态码
- 避免泄露敏感错误信息到客户端
- 记录服务器端错误以便调试

### 输入验证
- 验证用户输入格式
- 限制输入长度防止滥用
- 清理可能的恶意输入

## 调试建议

### 服务器调试
1. 检查环境变量是否正确加载
2. 验证 API 密钥是否有有效
3. 使用 console.log 记录请求处理过程
4. 测试不同端点的响应

### 前端调试
1. 使用浏览器开发者工具
2. 检查网络请求和响应
3. 查看控制台错误信息
4. 测试 SSE 连接状态

### 性能优化
1. 考虑添加请求限流
2. 优化前端资源加载
3. 实现连接超时处理
4. 考虑添加缓存机制

## 扩展建议

### 功能扩展
1. 添加用户认证
2. 实现对话历史保存
3. 添加多模型支持
4. 实现文件上传功能

### 架构改进
1. 使用 Express.js 替代原生 HTTP 模块
2. 添加中间件支持
3. 实现更好的错误处理中间件
4. 添加日志记录系统