# DeepSeek API 流式输出示例

本项目演示如何使用 OpenAI npm 插件访问 DeepSeek API 并实现流式输出功能。

## 功能特性

- ✅ 使用 OpenAI SDK 兼容 DeepSeek API
- ✅ 支持流式输出，实时显示响应内容
- ✅ 内置错误处理和重试机制
- ✅ 支持超时控制和取消请求
- ✅ 提供多种使用方式（基础流式、回调方式、自定义处理）

## 安装依赖

```bash
npm install
# 或使用 pnpm
pnpm install
```

## 配置

1. 复制 `.env` 文件并配置你的 DeepSeek API 密钥：

```bash
cp .env .env.local
```

2. 编辑 `.env.local` 文件，设置正确的 API 密钥：

```env
DEEPSEEK_API_KEY=your_actual_deepseek_api_key_here
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

## 使用方法

### 基础流式输出

```javascript
const DeepSeekStream = require('./src/stream');

const deepseek = new DeepSeekStream();
const messages = [
  { role: 'user', content: '请用中文介绍一下人工智能的发展历史' }
];

// 基础流式输出
await deepseek.streamChat(messages);
```

### 带回调的流式输出

```javascript
await deepseek.streamWithCallback(
  messages,
  (chunk) => {
    // 实时处理每个数据块
    process.stdout.write(chunk);
  },
  (fullResponse) => {
    // 流式输出完成后的回调
    console.log('\n总字符数:', fullResponse.length);
  }
);
```

### 自定义流式处理

```javascript
const stream = await deepseek.createStreamingResponse(messages);
let responseText = '';

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content || '';
  if (content) {
    // 自定义处理逻辑
    process.stdout.write(`[${new Date().toLocaleTimeString()}] ${content}`);
    responseText += content;
  }
}
```

### 配置选项

```javascript
const deepseek = new DeepSeekStream({
  maxRetries: 3,      // 最大重试次数
  retryDelay: 1000,   // 重试延迟（毫秒）
  timeout: 30000      // 请求超时时间（毫秒）
});

// 调用时也可以传递选项
await deepseek.streamChat(messages, {
  model: 'deepseek-chat',
  temperature: 0.7,
  max_tokens: 2048
});
```

## 运行示例

```bash
node src/stream.js
```

## API 参考

### DeepSeekStream 类

#### 构造函数
- `new DeepSeekStream(options)`
- 参数 `options`: 配置对象
  - `maxRetries`: 最大重试次数（默认：3）
  - `retryDelay`: 重试延迟（默认：1000ms）
  - `timeout`: 请求超时时间（默认：30000ms）

#### 方法

**streamChat(messages, options)**
- 基础流式输出方法
- 参数 `messages`: 对话消息数组
- 参数 `options`: 模型配置选项
- 返回: 完整的响应文本

**streamWithCallback(messages, onChunk, onComplete, options)**
- 带回调的流式输出方法
- 参数 `onChunk`: 每个数据块的回调函数
- 参数 `onComplete`: 完成时的回调函数
- 返回: 完整的响应文本

**createStreamingResponse(messages, options)**
- 创建原始流式响应对象
- 返回: 可迭代的流对象

## 错误处理

代码内置了完善的错误处理机制：

- 自动重试机制（指数退避）
- 超时控制（可取消请求）
- 详细的错误日志
- 网络异常处理

## 注意事项

1. 确保在 `.env` 文件中配置正确的 API 密钥
2. 流式输出会实时显示响应内容，适合需要即时反馈的场景
3. 默认使用 `deepseek-chat` 模型，可根据需要调整
4. 建议在生产环境中设置合理的超时和重试参数

## 许可证

MIT License