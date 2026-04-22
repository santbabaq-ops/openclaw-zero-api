import { v4 as uuidv4 } from 'uuid';
import { Session } from '../types/index.js';

const sessions: Map<string, Session> = new Map();

export function createSession(profileId: string): string {
  const id = uuidv4();
  sessions.set(id, {
    id,
    profileId,
    createdAt: new Date(),
    active: true
  });
  return id;
}

export function getSession(id: string): Session | undefined {
  return sessions.get(id);
}

export function deleteSession(id: string): boolean {
  return sessions.delete(id);
}

export function listSessions(): Session[] {
  return Array.from(sessions.values());
}

export function updateSessionActivity(id: string): void {
  const session = sessions.get(id);
  if (session) {
    session.active = true;
  }
}
