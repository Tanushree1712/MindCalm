const SESSION_STORAGE_KEY = 'mindcalm.anonymous-session';

function getAnonymousSessionId(): string {
  const current = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (current) return current;

  const sessionId = crypto.randomUUID();
  window.localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  return sessionId;
}

export function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set('X-MindCalm-Session', getAnonymousSessionId());
  return fetch(input, { ...init, headers });
}
