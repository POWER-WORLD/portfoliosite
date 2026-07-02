const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
// Automatically handle trailing slashes and ensure /api endpoint is present
let tempBase = base.endsWith('/') ? base.slice(0, -1) : base;
if (!tempBase.endsWith('/api')) {
  tempBase += '/api';
}
const API_BASE_URL = tempBase;

export function getToken() {
  return localStorage.getItem('admin_token');
}

export function setToken(token: string) {
  localStorage.setItem('admin_token', token);
}

export function removeToken() {
  localStorage.removeItem('admin_token');
}

async function request(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    removeToken();
    window.location.reload();
    throw new Error('Session expired. Please log in again.');
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! Status: ${res.status}`);
  }

  // Return success message or JSON payload
  const text = await res.text();
  return text ? JSON.parse(text) : { success: true };
}

export const adminApi = {
  login: async (password: string) => {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },

  verifyToken: async () => {
    try {
      await request('/auth/verify', { method: 'GET' });
      return true;
    } catch {
      return false;
    }
  },

  getPortfolio: async () => {
    return request('/portfolio');
  },

  updatePersonalInfo: async (info: any) => {
    return request('/personal-info', {
      method: 'PUT',
      body: JSON.stringify(info),
    });
  },

  updateAbout: async (about: any) => {
    return request('/about', {
      method: 'PUT',
      body: JSON.stringify(about),
    });
  },

  // Skills
  addSkillCategory: async (category: any) => {
    return request('/skills', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  },

  updateSkillCategory: async (id: string, category: any) => {
    return request(`/skills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    });
  },

  deleteSkillCategory: async (id: string) => {
    return request(`/skills/${id}`, {
      method: 'DELETE',
    });
  },

  // Projects
  addProject: async (project: any) => {
    return request('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  },

  updateProject: async (id: string, project: any) => {
    return request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    });
  },

  deleteProject: async (id: string) => {
    return request(`/projects/${id}`, {
      method: 'DELETE',
    });
  },

  // Experience
  addExperience: async (exp: any) => {
    return request('/experience', {
      method: 'POST',
      body: JSON.stringify(exp),
    });
  },

  updateExperience: async (id: string, exp: any) => {
    return request(`/experience/${id}`, {
      method: 'PUT',
      body: JSON.stringify(exp),
    });
  },

  deleteExperience: async (id: string) => {
    return request(`/experience/${id}`, {
      method: 'DELETE',
    });
  },

  // Certificates
  addCertificate: async (cert: any) => {
    return request('/certificates', {
      method: 'POST',
      body: JSON.stringify(cert),
    });
  },

  updateCertificate: async (id: string, cert: any) => {
    return request(`/certificates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cert),
    });
  },

  deleteCertificate: async (id: string) => {
    return request(`/certificates/${id}`, {
      method: 'DELETE',
    });
  },

  // Achievements
  addAchievement: async (ach: any) => {
    return request('/achievements', {
      method: 'POST',
      body: JSON.stringify(ach),
    });
  },

  updateAchievement: async (id: string, ach: any) => {
    return request(`/achievements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ach),
    });
  },

  deleteAchievement: async (id: string) => {
    return request(`/achievements/${id}`, {
      method: 'DELETE',
    });
  },
};
