export interface Session {
  id: string;
  profileId: string;
  createdAt: Date;
  active: boolean;
}

export interface DOMOperation {
  action: 'navigate' | 'click' | 'type' | 'extract' | 'evaluate' | 'wait' | 'screenshot';
  selector?: string;
  value?: string;
  timeout?: number;
  url?: string;
}

export interface OpenAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
}

export interface OpenAIResponse {
  id: string;
  model: string;
  choices: Array<{
    message: OpenAIMessage;
    finish_reason: string;
  }>;
}

export interface BrowserProfile {
  id: string;
  name: string;
  cookiesPath: string;
  storageStatePath: string;
  lastUsed: Date;
}

export interface TokenInfo {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: number;
}

export interface Provider {
  id: string;
  name: string;
  baseUrl: string;
  defaultModel: string;
  loginUrl: string;
}
