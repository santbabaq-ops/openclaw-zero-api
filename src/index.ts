import Fastify from 'fastify';
import { registerRoutes } from './api/routes.js';
import { browserManager } from './browser/manager.js';

const fastify = Fastify({ logger: true });

async function main() {
  await registerRoutes(fastify);

  // 启动浏览器服务
  await browserManager.launch('default', false);

  await fastify.listen({ port: 3000 });
  console.log('WebAgent-Proxy 运行中: http://localhost:3000');
  console.log('支持的 AI 平台: DeepSeek, Claude, ChatGPT, Gemini, Qwen, Kimi, Doubao, Grok, GLM');
}

main().catch(console.error);
