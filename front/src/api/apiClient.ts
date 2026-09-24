// Centralized API configuration
export const API_URL = import.meta.env.VITE_API_URL || 'https://padelhere.onrender.com/v1';

interface RequestOptions extends RequestInit {
  token?: string | null;
}

export const apiClient = {
  baseUrl: API_URL,
  
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { token, ...customConfig } = options;
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...customConfig.headers,
    };

    const config = {
      ...customConfig,
      headers,
    };

    const response = await fetch(`${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    return response.json() as Promise<T>;
  },
};
