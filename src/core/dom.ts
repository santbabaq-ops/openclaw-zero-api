import { DOMOperation } from '../types/index.js';
import { browserManager } from '../browser/manager.js';

export async function executeDOMOp(profileId: string, op: DOMOperation): Promise<any> {
  switch (op.action) {
    case 'navigate':
      if (!op.url) throw new Error('URL required for navigate');
      await browserManager.navigate(profileId, op.url);
      return { success: true, url: op.url };

    case 'click':
      if (!op.selector) throw new Error('Selector required for click');
      await browserManager.click(profileId, op.selector);
      return { success: true };

    case 'type':
      if (!op.selector || op.value === undefined) throw new Error('Selector and value required for type');
      await browserManager.type(profileId, op.selector, op.value);
      return { success: true };

    case 'extract':
      if (!op.selector) throw new Error('Selector required for extract');
      const content = await browserManager.extract(profileId, op.selector);
      return { success: true, content };

    case 'evaluate':
      if (!op.value) throw new Error('Script required for evaluate');
      return await browserManager.evaluate(profileId, op.value);

    case 'wait':
      if (!op.selector) throw new Error('Selector required for wait');
      await browserManager.waitForSelector(profileId, op.selector, op.timeout);
      return { success: true };

    case 'screenshot':
      const screenshot = await browserManager.screenshot(profileId);
      return { success: true, screenshot };

    default:
      throw new Error(`Unknown action: ${op.action}`);
  }
}

export function parseCommand(content: string): DOMOperation | null {
  const parts = content.split(':');
  const action = parts[0].trim().toLowerCase();

  if (action === 'navigate') {
    return { action: 'navigate', url: parts[1]?.trim() };
  }
  if (action === 'click' || action === 'type' || action === 'extract' || action === 'wait') {
    return {
      action: action as DOMOperation['action'],
      selector: parts[1]?.trim(),
      value: parts[2]?.trim()
    };
  }
  if (action === 'evaluate') {
    return { action: 'evaluate', value: content.replace(/^evaluate:/, '') };
  }
  if (action === 'screenshot') {
    return { action: 'screenshot' };
  }

  return null;
}
