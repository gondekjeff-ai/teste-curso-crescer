const getToken = (): string | null => localStorage.getItem('admin_token');

async function request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  if (options.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`/api${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string> || {}) },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ message: `Erro ${res.status}` }));
    throw new Error(data.message || `Erro ${res.status}`);
  }

  return res.json();
}

export const api = {
  get: <T = any>(path: string) => request<T>(path),

  post: <T = any>(path: string, body?: any) =>
    request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(path: string, body?: any) =>
    request<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  del: <T = any>(path: string) =>
    request<T>(path, { method: 'DELETE' }),

  upload: async (file: File, folder = 'general'): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    const headers: Record<string, string> = {};
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({ message: 'Falha no upload' }));
      throw new Error(data.message || 'Falha no upload');
    }
    return res.json();
  },

  stream: async (path: string, body: any): Promise<Response> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(`/api${path}`, { method: 'POST', headers, body: JSON.stringify(body) });
  },

  setToken: (token: string | null) => {
    if (token) localStorage.setItem('admin_token', token);
    else localStorage.removeItem('admin_token');
  },

  getToken,
};
