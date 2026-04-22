let _authToken: string | null = null;

export function setAuthToken(token: string | null) {
  _authToken = token;
}

// ================= PROXY URL BUILDER =================
function buildProxyUrl(endpoint: string): string {
  const clean = endpoint.replace(/^\//, '');
  const [pathPart, queryPart] = clean.split('?');

  const params = new URLSearchParams(queryPart || '');
  params.set('path', pathPart);

  return `/api/proxy?${params.toString()}`;
}

// ================= CORE FETCH =================
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // ✅ Use Authorization header again (proxy makes it safe)
  if (_authToken) {
    headers['Authorization'] = `Bearer ${_authToken}`;
  }

  const response = await fetch(buildProxyUrl(endpoint), {
    ...options,
    headers,
  });

  let data: any;

  try {
    data = await response.json();
  } catch {
    throw new Error('Invalid JSON response from server');
  }

  if (!response.ok) {
    throw new Error(data?.error || `HTTP error ${response.status}`);
  }

  return data as T;
}