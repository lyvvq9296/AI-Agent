# LangGraph Server

一个基于 TypeScript 和 Node.js 构建的 LangGraph 服务器。

## 特性

- ✅ TypeScript 支持
- ✅ Express.js 服务器
- ✅ 环境变量配置
- ✅ CORS 和安全性中间件
- ✅ 健康检查端点
- ✅ 开发热重载

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 环境配置

复制环境变量示例文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置您的环境变量。

### 开发模式

```bash
pnpm dev
```

服务器将在 http://localhost:3001 启动。

### 构建和运行

```bash
pnpm build
pnpm start
```

## 可用脚本

- `pnpm dev` - 启动开发服务器（带热重载）
- `pnpm build` - 构建 TypeScript 代码
- `pnpm start` - 运行构建后的代码
- `pnpm lint` - 运行 ESLint 检查
- `pnpm check-types` - 检查 TypeScript 类型

## API 端点

- `GET /` - 服务器状态信息
- `GET /health` - 健康检查端点

## 项目结构

```
langgraph-server/
├── src/
│   └── index.ts          # 主入口文件
├── dist/                 # 构建输出目录
├── .env.example          # 环境变量示例
├── .gitignore           # Git 忽略文件
├── package.json          # 项目配置
├── tsconfig.json        # TypeScript 配置
└── README.md            # 项目说明
```