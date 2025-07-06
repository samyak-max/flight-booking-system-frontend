// API Configuration
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  // SSE endpoints need to be absolute URLs
  getApiUrl: (endpoint: string) => `${API_CONFIG.baseURL}${endpoint}`,
};

export default API_CONFIG; 