import { FastifyInstance } from 'fastify';
import { OpenAIRequest, OpenAIResponse } from '../types/index.js';
import { parseCommand, executeDOMOp } from '../core/dom.js';
import { createSession, deleteSession, listSessions, getSession } from '../core/session.js';
import { browserManager } from '../browser/manager.js';
import { extractCookies, extractLocalStorage, extractSessionStorage, extractAllTokens } from '../browser/extractor.js';
import { PROVIDERS, getProvider } from '../providers/index.js';

export async function registerRoutes(fastify: FastifyInstance) {

  // OpenAI Compatible - Models List
  fastify.get('/v1/models', async () => {
    return {
      object: 'list',
      data: [
        ...PROVIDERS.map(p => ({
          id: p.id,
          object: 'model',
          created: 1700000000,
          owned_by: 'webagent-proxy'
        })),
        { id: 'webagent', object: 'model', created: 1700000000, owned_by: 'webagent-proxy' }
      ]
    };
  });

  // OpenAI Compatible - Chat Completions
  fastify.post('/v1/chat/completions', async (request) => {
    const body = request.body as OpenAIRequest;
    const userMessage = body.messages[body.messages.length - 1]?.content || '';

    // 从 session 或 model 中获取 profileId
    const profileId = body.model || 'default';

    const op = parseCommand(userMessage);
    let result: any = { success: false, error: 'Could not parse command' };

    if (op) {
      try {
        result = await executeDOMOp(profileId, op);
      } catch (e: any) {
        result = { success: false, error: e.message };
      }
    }

    const response: OpenAIResponse = {
      id: `webagent-${Date.now()}`,
      model: body.model || 'webagent',
      choices: [{
        message: {
          role: 'assistant',
          content: JSON.stringify(result)
        },
        finish_reason: 'stop'
      }]
    };

    return response;
  });

  // === Browser Profile Management ===

  // 启动浏览器
  fastify.post('/v1/browser/launch', async (request) => {
    const { profileId, headless } = request.body as { profileId?: string; headless?: boolean };
    const pid = profileId || 'default';
    await browserManager.launch(pid, headless ?? false);
    return { success: true, profileId: pid };
  });

  // 访问登录页面
  fastify.post('/v1/browser/login', async (request) => {
    const { providerId } = request.body as { providerId: string };
    const provider = getProvider(providerId);
    if (!provider) {
      return { success: false, error: 'Unknown provider: ' + providerId };
    }

    // 确保浏览器已启动
    let page;
    try {
      page = await browserManager.getPage(providerId);
    } catch {
      await browserManager.launch(providerId, false);
      page = await browserManager.getPage(providerId);
    }

    await page.goto(provider.loginUrl);
    return {
      success: true,
      providerId,
      providerName: provider.name,
      loginUrl: provider.loginUrl,
      message: `请在浏览器中完成登录，登录成功后会自动保存凭证`
    };
  });

  // 保存当前 profile 的登录状态
  fastify.post('/v1/profiles/:profileId/save', async (request) => {
    const { profileId } = request.params as { profileId: string };
    await browserManager.saveProfile(profileId);
    return { success: true, profileId };
  });

  // 获取 profile 列表
  fastify.get('/v1/profiles', async () => {
    const profiles = await browserManager.listProfiles();
    return { profiles };
  });

  // 删除 profile
  fastify.delete('/v1/profiles/:profileId', async (request) => {
    const { profileId } = request.params as { profileId: string };
    await browserManager.deleteProfile(profileId);
    return { success: true };
  });

  // === Token Extraction ===

  // 获取 cookies
  fastify.get('/v1/tokens/cookies', async (request) => {
    const { profileId, domain } = request.query as { profileId?: string; domain?: string };
    const pid = profileId || 'default';
    const cookies = await extractCookies(pid, domain);
    return { cookies };
  });

  // 获取 localStorage
  fastify.get('/v1/tokens/localStorage', async (request) => {
    const { profileId } = request.query as { profileId?: string };
    const pid = profileId || 'default';
    const localStorage = await extractLocalStorage(pid);
    return { localStorage };
  });

  // 获取 sessionStorage
  fastify.get('/v1/tokens/sessionStorage', async (request) => {
    const { profileId } = request.query as { profileId?: string };
    const pid = profileId || 'default';
    const sessionStorage = await extractSessionStorage(pid);
    return { sessionStorage };
  });

  // 获取所有 tokens
  fastify.get('/v1/tokens/all', async (request) => {
    const { profileId } = request.query as { profileId?: string };
    const pid = profileId || 'default';
    return await extractAllTokens(pid);
  });

  // === Session Management ===

  fastify.post('/v1/sessions', async (request) => {
    const { profileId } = request.body as { profileId?: string };
    const pid = profileId || 'default';
    const id = createSession(pid);
    return { id, profileId: pid, createdAt: new Date().toISOString() };
  });

  fastify.get('/v1/sessions', async () => {
    return { sessions: listSessions() };
  });

  fastify.delete('/v1/sessions/:id', async (request) => {
    const { id } = request.params as { id: string };
    const deleted = deleteSession(id);
    return { success: deleted };
  });

  // === Browser Control ===

  fastify.post('/v1/browser/navigate', async (request) => {
    const { profileId, url } = request.body as { profileId?: string; url: string };
    const pid = profileId || 'default';
    await browserManager.navigate(pid, url);
    return { success: true };
  });

  fastify.post('/v1/browser/click', async (request) => {
    const { profileId, selector } = request.body as { profileId?: string; selector: string };
    const pid = profileId || 'default';
    await browserManager.click(pid, selector);
    return { success: true };
  });

  fastify.post('/v1/browser/type', async (request) => {
    const { profileId, selector, text } = request.body as { profileId?: string; selector: string; text: string };
    const pid = profileId || 'default';
    await browserManager.type(pid, selector, text);
    return { success: true };
  });

  fastify.post('/v1/browser/extract', async (request) => {
    const { profileId, selector } = request.body as { profileId?: string; selector: string };
    const pid = profileId || 'default';
    const content = await browserManager.extract(pid, selector);
    return { success: true, content };
  });

  fastify.post('/v1/browser/evaluate', async (request) => {
    const { profileId, script } = request.body as { profileId?: string; script: string };
    const pid = profileId || 'default';
    return await browserManager.evaluate(pid, script);
  });

  fastify.post('/v1/browser/wait', async (request) => {
    const { profileId, selector, timeout } = request.body as { profileId?: string; selector: string; timeout?: number };
    const pid = profileId || 'default';
    await browserManager.waitForSelector(pid, selector, timeout);
    return { success: true };
  });

  fastify.get('/v1/browser/screenshot', async (request) => {
    const { profileId } = request.query as { profileId?: string };
    const pid = profileId || 'default';
    const screenshot = await browserManager.screenshot(pid);
    return { screenshot };
  });

  fastify.get('/v1/browser/status', async () => {
    return {
      browserOpen: browserManager.isBrowserRunning?.() ?? false,
      profiles: await browserManager.listProfiles()
    };
  });

  // === Provider Info ===

  fastify.get('/v1/providers', async () => {
    return { providers: PROVIDERS };
  });

  fastify.get('/v1/providers/:providerId', async (request) => {
    const { providerId } = request.params as { providerId: string };
    const provider = getProvider(providerId);
    if (!provider) {
      return { error: 'Provider not found' };
    }
    return provider;
  });
}
