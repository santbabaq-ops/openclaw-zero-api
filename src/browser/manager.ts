import { chromium, Browser, BrowserContext, Page, ChromiumBrowser } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { BrowserProfile, TokenInfo } from '../types/index.js';

export class BrowserManager {
  private browser: ChromiumBrowser | null = null;
  private contexts: Map<string, BrowserContext> = new Map();
  private pages: Map<string, Page> = new Map();
  private profilesDir: string;

  constructor(profilesDir: string = './profiles') {
    this.profilesDir = profilesDir;
    if (!fs.existsSync(profilesDir)) {
      fs.mkdirSync(profilesDir, { recursive: true });
    }
  }

  async launch(profileId: string, headless: boolean = false): Promise<void> {
    if (this.browser) {
      await this.close();
    }
    this.browser = await chromium.launch({ headless });
  }

  async newContext(profileId: string): Promise<BrowserContext> {
    const profile = await this.loadProfile(profileId);
    const context = await this.browser!.newContext();

    // 加载持久化的 storage state
    if (profile && fs.existsSync(profile.storageStatePath)) {
      const state = JSON.parse(fs.readFileSync(profile.storageStatePath, 'utf-8'));
      await context.addCookies(state.cookies || []);
      // 恢复 localStorage/sessionStorage
      if (state.storageState) {
        // Playwright 的 storageState 格式
      }
    }

    this.contexts.set(profileId, context);
    return context;
  }

  async newPage(profileId: string): Promise<Page> {
    let context = this.contexts.get(profileId);
    if (!context) {
      context = await this.newContext(profileId);
    }
    const page = await context.newPage();
    this.pages.set(profileId, page);
    return page;
  }

  async getPage(profileId: string): Promise<Page> {
    let page = this.pages.get(profileId);
    if (!page) {
      page = await this.newPage(profileId);
    }
    return page;
  }

  async saveProfile(profileId: string): Promise<void> {
    const context = this.contexts.get(profileId);
    if (!context) return;

    const profileDir = path.join(this.profilesDir, profileId);
    if (!fs.existsSync(profileDir)) {
      fs.mkdirSync(profileDir, { recursive: true });
    }

    const cookies = await context.cookies();
    const storageState = {
      cookies,
      origins: []
    };

    const cookiesPath = path.join(profileDir, 'cookies.json');
    const storageStatePath = path.join(profileDir, 'storage-state.json');

    fs.writeFileSync(cookiesPath, JSON.stringify(cookies, null, 2));
    fs.writeFileSync(storageStatePath, JSON.stringify(storageState, null, 2));

    // 保存 profile metadata
    const profile: BrowserProfile = {
      id: profileId,
      name: profileId,
      cookiesPath,
      storageStatePath,
      lastUsed: new Date()
    };
    const metaPath = path.join(profileDir, 'profile.json');
    fs.writeFileSync(metaPath, JSON.stringify(profile, null, 2));
  }

  async loadProfile(profileId: string): Promise<BrowserProfile | null> {
    const metaPath = path.join(this.profilesDir, profileId, 'profile.json');
    if (fs.existsSync(metaPath)) {
      return JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    }
    return null;
  }

  async listProfiles(): Promise<BrowserProfile[]> {
    const profiles: BrowserProfile[] = [];
    if (!fs.existsSync(this.profilesDir)) return profiles;

    const entries = fs.readdirSync(this.profilesDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const metaPath = path.join(this.profilesDir, entry.name, 'profile.json');
        if (fs.existsSync(metaPath)) {
          profiles.push(JSON.parse(fs.readFileSync(metaPath, 'utf-8')));
        }
      }
    }
    return profiles;
  }

  async deleteProfile(profileId: string): Promise<void> {
    const profileDir = path.join(this.profilesDir, profileId);
    if (fs.existsSync(profileDir)) {
      fs.rmSync(profileDir, { recursive: true });
    }
    this.contexts.delete(profileId);
    this.pages.delete(profileId);
  }

  async navigate(profileId: string, url: string): Promise<void> {
    const page = await this.getPage(profileId);
    await page.goto(url);
    await this.saveProfile(profileId);
  }

  async click(profileId: string, selector: string): Promise<void> {
    const page = await this.getPage(profileId);
    await page.click(selector);
  }

  async type(profileId: string, selector: string, text: string): Promise<void> {
    const page = await this.getPage(profileId);
    await page.fill(selector, text);
  }

  async extract(profileId: string, selector: string): Promise<string> {
    const page = await this.getPage(profileId);
    return await page.textContent(selector) || '';
  }

  async evaluate(profileId: string, script: string): Promise<any> {
    const page = await this.getPage(profileId);
    return await page.evaluate(script);
  }

  async waitForSelector(profileId: string, selector: string, timeout: number = 30000): Promise<void> {
    const page = await this.getPage(profileId);
    await page.waitForSelector(selector, { timeout });
  }

  async screenshot(profileId: string): Promise<string> {
    const page = await this.getPage(profileId);
    const buf = await page.screenshot();
    return buf.toString('base64');
  }

  async getCookies(profileId: string, domain?: string): Promise<TokenInfo[]> {
    const context = this.contexts.get(profileId);
    if (!context) throw new Error('No context for profile: ' + profileId);
    const cookies = await context.cookies();
    if (domain) {
      return cookies.filter(c => c.domain.includes(domain)).map(c => ({
        name: c.name,
        value: c.value,
        domain: c.domain,
        path: c.path,
        expires: c.expires
      }));
    }
    return cookies.map(c => ({
      name: c.name,
      value: c.value,
      domain: c.domain,
      path: c.path,
      expires: c.expires
    }));
  }

  async getLocalStorage(profileId: string): Promise<Record<string, string>> {
    const page = await this.getPage(profileId);
    return await page.evaluate(() => {
      const result: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) result[key] = localStorage.getItem(key) || '';
      }
      return result;
    });
  }

  async getSessionStorage(profileId: string): Promise<Record<string, string>> {
    const page = await this.getPage(profileId);
    return await page.evaluate(() => {
      const result: Record<string, string> = {};
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) result[key] = sessionStorage.getItem(key) || '';
      }
      return result;
    });
  }

  async closeProfile(profileId: string): Promise<void> {
    const page = this.pages.get(profileId);
    const context = this.contexts.get(profileId);
    if (page) await page.close();
    if (context) await context.close();
    this.pages.delete(profileId);
    this.contexts.delete(profileId);
  }

  isBrowserRunning(): boolean {
    return this.browser !== null;
  }

  async close(): Promise<void> {
    for (const [profileId] of this.pages) {
      await this.closeProfile(profileId);
    }
    await this.browser?.close();
    this.browser = null;
  }
}

export const browserManager = new BrowserManager();
