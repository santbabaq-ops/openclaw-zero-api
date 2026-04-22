# OpenClaw-Zero-API

**首个自动化爬取浏览器 Token 并转换为 OpenAI 兼容 API 接口的项目** - 通过浏览器登录方式免费使用各大 AI 平台。

## 灵感来源

本项目借鉴自 [openclaw-zero-token](https://github.com/linuxhsj/openclaw-zero-token)，基于其核心思想重新实现。

### 借鉴与创新

| openclaw-zero-token | WebAgent-Proxy |
|---------------------|----------------|
| OpenClaw Agent 框架 | 轻量级 Fastify API |
| 复杂的多层架构 | 简洁的单体设计 |
| 内置 AI 模型路由 | 纯浏览器自动化 + Token 提取 |
| 完整的 Agent 生态 | 专注 DOM 操作能力 |

**核心思路**：通过 Playwright 控制浏览器，用户只需登录一次，后续自动加载保存的登录凭证（Cookie/LocalStorage），无需重复登录。

## 功能

- 🌐 **浏览器自动化** - Playwright 非无头浏览器控制，第一次登录后自动保存凭证
- 🔑 **Token 持久化** - 登录成功后自动保存 Cookie/LocalStorage/SessionStorage，下次无需重复登录
- 🔄 **OpenAI 兼容** - 以 OpenAI chat completions 格式提供 DOM 操作能力
- 🤖 **多平台支持** - DeepSeek、Claude、ChatGPT、Gemini、Qwen、Kimi、Doubao、Grok、GLM

## 支持的平台

| 平台 | 状态 | 默认模型 |
|------|------|----------|
| DeepSeek | ✅ | deepseek-chat |
| Claude Web | ✅ | claude-sonnet-4-6 |
| ChatGPT | ✅ | gpt-4 |
| Gemini | ✅ | gemini-pro |
| Qwen | ✅ | qwen-max |
| Kimi | ✅ | moonshot-v1-32k |
| Doubao | ✅ | doubao-seed-2.0 |
| Grok | ✅ | grok-2 |
| GLM (智谱清言) | ✅ | glm-4-plus |

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式运行
npm run dev
```

## 使用流程

### 1. 打开登录页面

```bash
curl -X POST http://localhost:3000/v1/browser/login \
  -H "Content-Type: application/json" \
  -d '{"providerId": "claude"}'
```

这会打开浏览器并访问 Claude 登录页面。

### 2. 在浏览器中完成登录

手动在浏览器中完成登录。

### 3. 保存登录状态

```bash
curl -X POST http://localhost:3000/v1/profiles/claude/save
```

### 4. 后续使用

下次运行时，会自动加载已保存的登录状态，无需再次登录。

## API 端点

### OpenAI 兼容接口

```
POST /v1/chat/completions
GET  /v1/models
POST /v1/sessions
GET  /v1/sessions
DELETE /v1/sessions/:id
```

### 浏览器控制

```
POST /v1/browser/launch      # 启动浏览器
POST /v1/browser/login      # 打开登录页面
POST /v1/browser/navigate   # 访问 URL
POST /v1/browser/save       # 保存登录状态
GET  /v1/browser/screenshot # 截图
GET  /v1/browser/status     # 状态
```

### Token 管理

```
GET /v1/tokens/cookies      # 获取 cookies
GET /v1/tokens/localStorage # 获取 localStorage
GET /v1/tokens/sessionStorage # 获取 sessionStorage
GET /v1/tokens/all         # 获取所有 tokens
```

### Profile 管理

```
GET  /v1/profiles           # 列出所有 profile
POST /v1/profiles/:id/save  # 保存 profile
DELETE /v1/profiles/:id     # 删除 profile
```

## 命令格式

在 `/v1/chat/completions` 中发送消息：

```
navigate:https://chat.deepseek.com
click:#sign-in-button
type:#username:myuser
type:#password:mypass
click:#login-submit
```

## 技术栈

- Playwright - 浏览器自动化
- Fastify - HTTP 服务框架
- TypeScript - 类型安全
