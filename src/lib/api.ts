// Backend API integration
// This file provides functions to connect your React frontend to the Node.js backend

const API_BASE_URL = 'http://localhost:5000/api';

// Get token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

// Set token in localStorage
const setAuthToken = (token: string) => {
  localStorage.setItem('auth_token', token);
};

// Remove token from localStorage
const removeAuthToken = () => {
  localStorage.removeItem('auth_token');
};

// Generic API request function
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  
  return response.json();
};

// Authentication API
export const authAPI = {
  login: async (username: string, password: string, role: string) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password, role }),
    });
    
    if (response.success && response.token) {
      setAuthToken(response.token);
    }
    
    return response;
  },

  register: async (userData: {
    username: string;
    email: string;
    password: string;
    role: string;
    groupId?: string;
  }) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.success && response.token) {
      setAuthToken(response.token);
    }
    
    return response;
  },

  logout: () => {
    removeAuthToken();
  }
};

// Students API
export const studentsAPI = {
  getAll: () => apiRequest('/students'),
  
  getById: (id: string) => apiRequest(`/students/${id}`),
  
  create: (studentData: {
    username: string;
    email: string;
    password: string;
    groupId?: string;
  }) => apiRequest('/students', {
    method: 'POST',
    body: JSON.stringify(studentData),
  }),
  
  update: (id: string, updateData: any) => apiRequest(`/students/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  }),
  
  delete: (id: string) => apiRequest(`/students/${id}`, {
    method: 'DELETE',
  }),
  
  giveXP: (id: string, amount: number, reason?: string) => apiRequest(`/students/${id}/give-xp`, {
    method: 'POST',
    body: JSON.stringify({ amount, reason }),
  })
};

// Admins API
export const adminsAPI = {
  getAll: () => apiRequest('/admins'),
  
  getById: (id: string) => apiRequest(`/admins/${id}`),
  
  create: (adminData: {
    username: string;
    email: string;
    password: string;
  }) => apiRequest('/admins', {
    method: 'POST',
    body: JSON.stringify(adminData),
  }),
  
  update: (id: string, updateData: any) => apiRequest(`/admins/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  }),
  
  delete: (id: string) => apiRequest(`/admins/${id}`, {
    method: 'DELETE',
  }),
  
  assignGroup: (id: string, groupId: string) => apiRequest(`/admins/${id}/assign-group`, {
    method: 'PUT',
    body: JSON.stringify({ groupId }),
  }),
  
  removeGroup: (id: string) => apiRequest(`/admins/${id}/remove-group`, {
    method: 'PUT',
  })
};

// Groups API
export const groupsAPI = {
  getAll: () => apiRequest('/groups'),
  
  getById: (id: string) => apiRequest(`/groups/${id}`),
  
  create: (groupData: {
    name: string;
    description?: string;
    adminId: string;
    maxStudents?: number;
  }) => apiRequest('/groups', {
    method: 'POST',
    body: JSON.stringify(groupData),
  }),
  
  update: (id: string, updateData: any) => apiRequest(`/groups/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  }),
  
  delete: (id: string) => apiRequest(`/groups/${id}`, {
    method: 'DELETE',
  })
};

// Projects API
export const projectsAPI = {
  getAll: () => apiRequest('/projects'),
  
  getById: (id: string) => apiRequest(`/projects/${id}`),
  
  create: (projectData: {
    title: string;
    description: string;
    githubUrl?: string;
    liveUrl?: string;
    technologies?: string[];
  }) => apiRequest('/projects', {
    method: 'POST',
    body: JSON.stringify(projectData),
  }),
  
  update: (id: string, updateData: any) => apiRequest(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  }),
  
  delete: (id: string) => apiRequest(`/projects/${id}`, {
    method: 'DELETE',
  })
};

// Leaderboard API
export const leaderboardAPI = {
  getStudents: (groupId?: string, limit?: number) => {
    const params = new URLSearchParams();
    if (groupId) params.append('groupId', groupId);
    if (limit) params.append('limit', limit.toString());
    
    return apiRequest(`/leaderboard?${params.toString()}`);
  },
  
  getGroups: () => apiRequest('/leaderboard/groups')
};

// Health Check
export const healthAPI = {
  check: () => apiRequest('/health')
};

// Helper function to check if backend is available
export const checkBackendConnection = async (): Promise<boolean> => {
  try {
    await healthAPI.check();
    return true;
  } catch (error) {
    console.error('Backend connection failed:', error);
    return false;
  }
};

export { getAuthToken, setAuthToken, removeAuthToken };