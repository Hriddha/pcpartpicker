import type {
  Processor, Motherboard, RAM, GPU, Storage, PowerSupply,
  PCBuild, CompatibilityResult, SelectedParts, AuthResponse,
  LoginCredentials, RegisterCredentials, User, Stats,
} from './types';

let _authToken: string | null = null;

export function setAuthToken(token: string | null) {
  _authToken = token;
}

// Routes all requests through /api/proxy to avoid CORS issues
function buildProxyUrl(endpoint: string): string {
  const clean = endpoint.replace(/^\//, '');
  const [pathPart, queryPart] = clean.split('?');
  const params = new URLSearchParams(queryPart || '');
  params.set('path', pathPart);
  return `/api/proxy?${params.toString()}`;
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };
  if (_authToken) headers['Authorization'] = `Bearer ${_authToken}`;

  const response = await fetch(buildProxyUrl(endpoint), { ...options, headers });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export const processorsAPI = {
  getAll: (socketType?: string) => {
    const params = socketType ? `?socket_type=${encodeURIComponent(socketType)}` : '';
    return fetchAPI<Processor[]>(`/processors.php${params}`);
  },
  getById: (id: number) => fetchAPI<Processor>(`/processors.php?id=${id}`),
};

export const motherboardsAPI = {
  getAll: (socketType?: string) => {
    const params = socketType ? `?socket_type=${encodeURIComponent(socketType)}` : '';
    return fetchAPI<Motherboard[]>(`/motherboards.php${params}`);
  },
  getById: (id: number) => fetchAPI<Motherboard>(`/motherboards.php?id=${id}`),
};

export const ramAPI = {
  getAll: (type?: string) => {
    const params = type ? `?type=${encodeURIComponent(type)}` : '';
    return fetchAPI<RAM[]>(`/ram.php${params}`);
  },
  getById: (id: number) => fetchAPI<RAM>(`/ram.php?id=${id}`),
};

export const gpusAPI = {
  getAll: (minVram?: number) => {
    const params = minVram ? `?min_vram=${minVram}` : '';
    return fetchAPI<GPU[]>(`/gpus.php${params}`);
  },
  getById: (id: number) => fetchAPI<GPU>(`/gpus.php?id=${id}`),
};

export const storageAPI = {
  getAll: (type?: string) => {
    const params = type ? `?type=${encodeURIComponent(type)}` : '';
    return fetchAPI<Storage[]>(`/storage.php${params}`);
  },
  getById: (id: number) => fetchAPI<Storage>(`/storage.php?id=${id}`),
};

export const powerSuppliesAPI = {
  getAll: (minWattage?: number) => {
    const params = minWattage ? `?min_wattage=${minWattage}` : '';
    return fetchAPI<PowerSupply[]>(`/power_supplies.php${params}`);
  },
  getById: (id: number) => fetchAPI<PowerSupply>(`/power_supplies.php?id=${id}`),
};

export const buildsAPI = {
  getAll: () => fetchAPI<PCBuild[]>('/builds.php'),
  getByUser: (userId: number) => fetchAPI<PCBuild[]>(`/builds.php?user_id=${userId}`),
  getById: (id: number) => fetchAPI<PCBuild>(`/builds.php?id=${id}`),
  create: (build: PCBuild) =>
    fetchAPI<{ message: string; id: number }>('/builds.php', {
      method: 'POST', body: JSON.stringify(build),
    }),
  update: (id: number, build: PCBuild) =>
    fetchAPI<{ message: string }>(`/builds.php?id=${id}`, {
      method: 'PUT', body: JSON.stringify(build),
    }),
  delete: (id: number) =>
    fetchAPI<{ message: string }>(`/builds.php?id=${id}`, { method: 'DELETE' }),
};

export const compatibilityAPI = {
  check: (parts: Partial<SelectedParts>) => {
    const payload = {
      processor_id: parts.processor?.processor_id,
      motherboard_id: parts.motherboard?.motherboard_id,
      ram_id: parts.ram?.ram_id,
      gpu_id: parts.gpu?.gpu_id,
      psu_id: parts.psu?.psu_id,
    };
    return fetchAPI<CompatibilityResult>('/compatibility.php', {
      method: 'POST', body: JSON.stringify(payload),
    });
  },
};
 
export const authAPI = {
  login: (credentials: LoginCredentials) =>
    fetchAPI<AuthResponse>('/auth.php?action=login', {
      method: 'POST', body: JSON.stringify(credentials),
    }),
  register: (credentials: RegisterCredentials) =>
    fetchAPI<AuthResponse>('/auth.php?action=register', {
      method: 'POST', body: JSON.stringify(credentials),
    }),
  logout: () =>
    fetchAPI<AuthResponse>('/auth.php?action=logout', { method: 'POST' }),
  checkSession: () => fetchAPI<AuthResponse>('/auth.php?action=check'),
  getCurrentUser: () => fetchAPI<{ user: User }>('/auth.php?action=user'),
};

export const statsAPI = {
  getAll: () => fetchAPI<Stats>('/stats.php'),
};