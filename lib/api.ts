const API_BASE = "https://pcpartpicker.whf.bz/api";

let _authToken: string | null = null;

export function setAuthToken(token: string | null) {
  _authToken = token;
}

// ================= CORE FETCH =================
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (_authToken) {
    headers["Authorization"] = `Bearer ${_authToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let data: any;
  try {
    data = await response.json();
  } catch {
    throw new Error("Invalid JSON response from server");
  }

  if (!response.ok) {
    throw new Error(data?.error || `HTTP error ${response.status}`);
  }

  return data as T;
}

export const processorsAPI = {
  getAll: (socketType?: string) => {
    const params = socketType ? `?socket_type=${encodeURIComponent(socketType)}` : '';
    return fetchAPI(`/processors.php${params}`);
  },
  getById: (id: number) => fetchAPI(`/processors.php?id=${id}`),
};

export const motherboardsAPI = {
  getAll: (socketType?: string) => {
    const params = socketType ? `?socket_type=${encodeURIComponent(socketType)}` : '';
    return fetchAPI(`/motherboards.php${params}`);
  },
  getById: (id: number) => fetchAPI(`/motherboards.php?id=${id}`),
};

export const ramAPI = {
  getAll: (type?: string) => {
    const params = type ? `?type=${encodeURIComponent(type)}` : '';
    return fetchAPI(`/ram.php${params}`);
  },
  getById: (id: number) => fetchAPI(`/ram.php?id=${id}`),
};

export const gpusAPI = {
  getAll: (minVram?: number) => {
    const params = minVram ? `?min_vram=${minVram}` : '';
    return fetchAPI(`/gpus.php${params}`);
  },
  getById: (id: number) => fetchAPI(`/gpus.php?id=${id}`),
};

export const storageAPI = {
  getAll: (type?: string) => {
    const params = type ? `?type=${encodeURIComponent(type)}` : '';
    return fetchAPI(`/storage.php${params}`);
  },
  getById: (id: number) => fetchAPI(`/storage.php?id=${id}`),
};

export const powerSuppliesAPI = {
  getAll: (minWattage?: number) => {
    const params = minWattage ? `?min_wattage=${minWattage}` : '';
    return fetchAPI(`/power_supplies.php${params}`);
  },
  getById: (id: number) => fetchAPI(`/power_supplies.php?id=${id}`),
};

export const buildsAPI = {
  getAll: () => fetchAPI('/builds.php'),
  getByUser: (userId: number) => fetchAPI(`/builds.php?user_id=${userId}`),
  getById: (id: number) => fetchAPI(`/builds.php?id=${id}`),

  create: (build: any) =>
    fetchAPI('/builds.php', {
      method: 'POST',
      body: JSON.stringify(build),
    }),

  update: (id: number, build: any) =>
    fetchAPI(`/builds.php?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(build),
    }),

  delete: (id: number) =>
    fetchAPI(`/builds.php?id=${id}`, {
      method: 'DELETE',
    }),
};

export const compatibilityAPI = {
  check: (parts: any) => {
    const payload = {
      processor_id: parts.processor?.processor_id,
      motherboard_id: parts.motherboard?.motherboard_id,
      ram_id: parts.ram?.ram_id,
      gpu_id: parts.gpu?.gpu_id,
      psu_id: parts.psu?.psu_id,
    };

    return fetchAPI('/compatibility.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
 
export const authAPI = {
  login: (credentials: any) =>
    fetchAPI('/api/auth.php?action=login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (credentials: any) =>
    fetchAPI('/auth.php?action=register', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    }),

  logout: () =>
    fetchAPI('/auth.php?action=logout', {
      method: 'POST',
    }),

  checkSession: () =>
    fetchAPI('/auth.php?action=check'),

  getCurrentUser: () =>
    fetchAPI('/auth.php?action=user'),
};

export const statsAPI = {
  getAll: () => fetchAPI('/stats.php'),
};