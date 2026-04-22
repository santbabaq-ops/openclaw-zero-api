import { browserManager } from './manager.js';

export interface TokenInfo {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: number;
}

export async function extractCookies(profileId: string, domain?: string): Promise<TokenInfo[]> {
  return await browserManager.getCookies(profileId, domain);
}

export async function extractLocalStorage(profileId: string): Promise<Record<string, string>> {
  return await browserManager.getLocalStorage(profileId);
}

export async function extractSessionStorage(profileId: string): Promise<Record<string, string>> {
  return await browserManager.getSessionStorage(profileId);
}

export async function extractAllTokens(profileId: string): Promise<{
  cookies: TokenInfo[];
  localStorage: Record<string, string>;
  sessionStorage: Record<string, string>;
}> {
  return {
    cookies: await extractCookies(profileId),
    localStorage: await extractLocalStorage(profileId),
    sessionStorage: await extractSessionStorage(profileId)
  };
}
