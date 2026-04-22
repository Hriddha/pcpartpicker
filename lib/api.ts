const API_BASE = "https://pcpartpicker.whf.bz/api";

let authToken: string | null = null;

// ================= AUTH TOKEN =================
export function setAuthToken(token: string | null) {
  authToken = token;
}

// ================= CORE FETCH =================
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}${endpoint}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  try {
    console.log("API CALL:", url);

    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const text = await response.text();

    if (!text) {
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      return {};
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("Invalid JSON:", text);
      throw new Error("Server returned invalid JSON");
    }

    if (!response.ok) {
      throw new Error(data?.error || `HTTP error ${response.status}`);
    }

    return data;

  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new Error("Request timeout (server slow)");
    }
    throw error;
  }
}

// ================= APIs =================

// ---- AUTH ----
export const authAPI = {
  login: (credentials: any) =>
    fetchAPI('/auth.php?action=login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (credentials: any) =>
    fetchAPI('/auth.php?action=register', {
      method: 'POST',
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

// ---- PROCESSORS ----
export const processorsAPI = {
  getAll: (socketType?: string) =>
    fetchAPI(`/processors.php${socketType ? `?socket_type=${encodeURIComponent(socketType)}` : ''}`),

  getById: (id: number) =>
    fetchAPI(`/processors.php?id=${id}`),
};

// ---- MOTHERBOARDS ----
export const motherboardsAPI = {
  getAll: (socketType?: string) =>
    fetchAPI(`/motherboards.php${socketType ? `?socket_type=${encodeURIComponent(socketType)}` : ''}`),

  getById: (id: number) =>
    fetchAPI(`/motherboards.php?id=${id}`),
};

// ---- RAM ----
export const ramAPI = {
  getAll: (type?: string) =>
    fetchAPI(`/ram.php${type ? `?type=${encodeURIComponent(type)}` : ''}`),

  getById: (id: number) =>
    fetchAPI(`/ram.php?id=${id}`),
};

// ---- GPU ----
export const gpusAPI = {
  getAll: (minVram?: number) =>
    fetchAPI(`/gpus.php${minVram ? `?min_vram=${minVram}` : ''}`),

  getById: (id: number) =>
    fetchAPI(`/gpus.php?id=${id}`),
};

// ---- STORAGE ----
export const storageAPI = {
  getAll: (type?: string) =>
    fetchAPI(`/storage.php${type ? `?type=${encodeURIComponent(type)}` : ''}`),

  getById: (id: number) =>
    fetchAPI(`/storage.php?id=${id}`),
};

// ---- PSU ----
export const powerSuppliesAPI = {
  getAll: (minWattage?: number) =>
    fetchAPI(`/power_supplies.php${minWattage ? `?min_wattage=${minWattage}` : ''}`),

  getById: (id: number) =>
    fetchAPI(`/power_supplies.php?id=${id}`),
};

// ---- BUILDS ----
export const buildsAPI = {
  getAll: () => fetchAPI('/builds.php'),

  getByUser: (userId: number) =>
    fetchAPI(`/builds.php?user_id=${userId}`),

  getById: (id: number) =>
    fetchAPI(`/builds.php?id=${id}`),

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

// ---- COMPATIBILITY ----
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

// ---- STATS ----
export const statsAPI = {
  getAll: () => fetchAPI('/stats.php'),
};