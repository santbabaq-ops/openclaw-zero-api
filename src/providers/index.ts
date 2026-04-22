import { Provider } from '../types/index.js';

export const PROVIDERS: Provider[] = [
  {
    id: 'deepseek',
    name: 'DeepSeek',
    baseUrl: 'https://chat.deepseek.com',
    defaultModel: 'deepseek-chat',
    loginUrl: 'https://chat.deepseek.com/signin'
  },
  {
    id: 'claude',
    name: 'Claude Web',
    baseUrl: 'https://claude.ai',
    defaultModel: 'claude-sonnet-4-6',
    loginUrl: 'https://claude.ai/login'
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    baseUrl: 'https://chatgpt.com',
    defaultModel: 'gpt-4',
    loginUrl: 'https://chatgpt.com/login'
  },
  {
    id: 'gemini',
    name: 'Gemini',
    baseUrl: 'https://gemini.google.com',
    defaultModel: 'gemini-pro',
    loginUrl: 'https://gemini.google.com/'
  },
  {
    id: 'qwen',
    name: 'Qwen',
    baseUrl: 'https://chat.qwen.ai',
    defaultModel: 'qwen-max',
    loginUrl: 'https://chat.qwen.ai/'
  },
  {
    id: 'kimi',
    name: 'Kimi',
    baseUrl: 'https://www.kimi.com',
    defaultModel: 'moonshot-v1-32k',
    loginUrl: 'https://www.kimi.com/signin'
  },
  {
    id: 'doubao',
    name: 'Doubao',
    baseUrl: 'https://www.doubao.com',
    defaultModel: 'doubao-seed-2.0',
    loginUrl: 'https://www.doubao.com/login'
  },
  {
    id: 'grok',
    name: 'Grok',
    baseUrl: 'https://grok.com',
    defaultModel: 'grok-2',
    loginUrl: 'https://grok.com/login'
  },
  {
    id: 'glm',
    name: 'GLM (智谱清言)',
    baseUrl: 'https://chatglm.cn',
    defaultModel: 'glm-4-plus',
    loginUrl: 'https://chatglm.cn/login'
  }
];

export function getProvider(id: string): Provider | undefined {
  return PROVIDERS.find(p => p.id === id);
}
