let cachedCsrfToken = null;

export async function getCsrfToken() {
  if (cachedCsrfToken) return cachedCsrfToken;
  try {
    const res = await fetch('/api/csrf-token', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      cachedCsrfToken = data.csrfToken;
      return cachedCsrfToken;
    }
  } catch {
    // ignore
  }
  return null;
}

export async function apiFetch(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const headers = { ...(options.headers || {}) };

  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrf = await getCsrfToken();
    if (csrf) {
      headers['X-CSRF-Token'] = csrf;
    }
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
}

export function normalizeAuPhone(phone) {
  const cleaned = phone.replace(/\s+/g, '');
  if (cleaned.startsWith('+614')) {
    return '0' + cleaned.slice(3);
  }
  return cleaned;
}
