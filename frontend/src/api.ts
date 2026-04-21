const API_BASE = '/api';

// JWT secret must match the backend's JWT_SECRET (dev-secret by default)
const JWT_SECRET = 'dev-secret';

// Minimal JWT signing for demo — produces a valid HS256 token
// In production, tokens would come from an auth server
async function signToken(userId: string): Promise<string> {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const payload = btoa(
    JSON.stringify({
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    }),
  )
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(`${header}.${payload}`),
  );

  const sig = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${header}.${payload}.${sig}`;
}

let cachedToken: { userId: string; token: string } | null = null;

async function getToken(userId: string): Promise<string> {
  if (cachedToken?.userId === userId) return cachedToken.token;
  const token = await signToken(userId);
  cachedToken = { userId, token };
  return token;
}

async function apiFetch(
  path: string,
  userId: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = await getToken(userId);
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}

export interface Conversation {
  id: string;
  tenantId: string;
  name: string;
}

export interface Message {
  id: string;
  tenantId: string;
  conversationId: string;
  senderId: string;
  body: string;
  timestamp: string;
}

export async function getConversations(
  userId: string,
): Promise<Conversation[]> {
  const res = await apiFetch('/conversations', userId);
  return res.json();
}

export async function getMessages(
  userId: string,
  conversationId: string,
  limit = 50,
  cursor?: string,
): Promise<{ messages: Message[]; nextCursor: string | null }> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set('cursor', cursor);
  const res = await apiFetch(
    `/conversations/${conversationId}/messages?${params}`,
    userId,
  );
  return res.json();
}

export async function sendMessage(
  userId: string,
  conversationId: string,
  body: string,
): Promise<Message> {
  const res = await apiFetch('/messages', userId, {
    method: 'POST',
    body: JSON.stringify({ conversationId, senderId: userId, body }),
  });
  return res.json();
}

export async function searchMessages(
  userId: string,
  conversationId: string,
  query: string,
): Promise<Message[]> {
  const params = new URLSearchParams({ q: query });
  const res = await apiFetch(
    `/conversations/${conversationId}/messages/search?${params}`,
    userId,
  );
  return res.json();
}
