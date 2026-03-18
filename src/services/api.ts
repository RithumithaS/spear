import { auth } from '../firebase';

// Using Vite's import.meta.env for environment variables
// VITE_API_URL should be set in Vercel to your deployed Spring Boot URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Helper to get Firebase ID token to send to Spring Boot
async function getAuthHeaders(): Promise<HeadersInit> {
  const user = auth.currentUser;
  if (!user) {
    // If not authenticated, we can still make the request (Spring Security might block it, which is correct)
    return { 'Content-Type': 'application/json' };
  }

  // Force refresh the token to ensure it's valid, then append to Headers
  const token = await user.getIdToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

// Global hook to make API requests with authentication headers
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = await getAuthHeaders();
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: { ...headers, ...options.headers },
    });

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        const errorData = await response.text();
        errorMessage = errorData || response.statusText;
      } catch (e) {
        errorMessage = response.statusText;
      }
      throw new Error(`API Error ${response.status}: ${errorMessage}`);
    }

    // Handle 204 No Content for delete operations
    if (response.status === 204 || response.status === 202) {
      return undefined as T;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
}

// ==================== USER API ====================
export const userApi = {
  create: (user: any) =>
    apiRequest('/api/users', { method: 'POST', body: JSON.stringify(user) }),

  getByUid: (uid: string) =>
    apiRequest(`/api/users/${uid}`),

  getAll: (excludeUid?: string) =>
    apiRequest(`/api/users${excludeUid ? `?excludeUid=${excludeUid}` : ''}`),

  update: (uid: string, data: any) =>
    apiRequest(`/api/users/${uid}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (uid: string) =>
    apiRequest(`/api/users/${uid}`, { method: 'DELETE' }),
};

// ==================== JOBS API ====================
export const jobApi = {
  create: (job: any) =>
    apiRequest('/api/jobs', { method: 'POST', body: JSON.stringify(job) }),

  getAll: (search?: string) =>
    apiRequest(`/api/jobs${search ? `?search=${encodeURIComponent(search)}` : ''}`),

  getById: (id: string) =>
    apiRequest(`/api/jobs/${id}`),

  delete: (id: string) =>
    apiRequest(`/api/jobs/${id}`, { method: 'DELETE' }),
};

// ==================== CONNECTIONS API ====================
export const connectionApi = {
  send: (connection: any) =>
    apiRequest('/api/connections', { method: 'POST', body: JSON.stringify(connection) }),

  getUserConnections: (userId: string) =>
    apiRequest(`/api/connections/user/${userId}`),

  getPending: (userId: string) =>
    apiRequest(`/api/connections/pending/${userId}`),

  accept: (id: string) =>
    apiRequest(`/api/connections/${id}/accept`, { method: 'PUT' }),

  reject: (id: string) =>
    apiRequest(`/api/connections/${id}/reject`, { method: 'PUT' }),
};

// ==================== MESSAGES API ====================
export const messageApi = {
  send: (message: any) =>
    apiRequest('/api/messages', { method: 'POST', body: JSON.stringify(message) }),

  getConversation: (userId1: string, userId2: string) =>
    apiRequest(`/api/messages/conversation?userId1=${userId1}&userId2=${userId2}`),

  getChatPartners: (userId: string) =>
    apiRequest(`/api/messages/partners/${userId}`),
};

// ==================== LOCATIONS API ====================
export const locationApi = {
  create: (location: any) =>
    apiRequest('/api/locations', { method: 'POST', body: JSON.stringify(location) }),

  getAll: () =>
    apiRequest('/api/locations'),

  delete: (id: string) =>
    apiRequest(`/api/locations/${id}`, { method: 'DELETE' }),
};

// ==================== APPLICATIONS API ====================
export const applicationApi = {
  apply: (application: any) =>
    apiRequest('/api/applications', { method: 'POST', body: JSON.stringify(application) }),

  getByUser: (userId: string) =>
    apiRequest(`/api/applications/user/${userId}`),

  getByJob: (jobId: string) =>
    apiRequest(`/api/applications/job/${jobId}`),
};

// ==================== PORTFOLIOS API ====================
export const portfolioApi = {
  create: (portfolio: any) =>
    apiRequest('/api/portfolios', { method: 'POST', body: JSON.stringify(portfolio) }),

  getByUserId: (userId: string) =>
    apiRequest(`/api/portfolios/user/${userId}`),

  delete: (id: string) =>
    apiRequest(`/api/portfolios/${id}`, { method: 'DELETE' }),
};
