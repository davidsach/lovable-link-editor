
/**
 * HTTP Client for API Communication
 * Centralized HTTP client with error handling and logging
 */

import { ENDPOINTS, API_BASE_URL } from './endpoints';
import { ApiResponse, ApiError } from './types';

// =============================================================================
// HTTP CLIENT CLASS
// =============================================================================

/**
 * Main API Client Class
 * Handles all HTTP communication with the backend
 */
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    console.log('🔗 API Client initialized with base URL:', baseURL);
  }

  // ---------------------------------------------------------------------------
  // CORE REQUEST METHOD
  // ---------------------------------------------------------------------------

  /**
   * Make HTTP request to API
   * @param endpoint - API endpoint path
   * @param options - Fetch options
   * @returns Promise with response data
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`📤 API Request: ${config.method || 'GET'} ${url}`, {
        endpoint,
        method: config.method || 'GET',
        hasBody: !!config.body
      });
      
      const response = await fetch(url, config);
      
      // Handle different response statuses
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API Error ${response.status}:`, {
          url,
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      // Parse JSON response
      const data = await response.json();
      
      console.log(`📥 API Response: ${config.method || 'GET'} ${url}`, {
        status: response.status,
        dataType: typeof data,
        hasData: !!data
      });
      
      return data;
      
    } catch (error) {
      console.error(`💥 API Request Failed: ${config.method || 'GET'} ${url}`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        endpoint,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Re-throw with more context
      if (error instanceof Error && error.message.includes('fetch')) {
        throw new Error(`Failed to connect to backend server at ${this.baseURL}. Please ensure your backend is running.`);
      }
      
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // HTTP METHOD HELPERS
  // ---------------------------------------------------------------------------

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // ---------------------------------------------------------------------------
  // CONFIGURATION METHODS
  // ---------------------------------------------------------------------------

  /**
   * Update base URL
   */
  setBaseURL(url: string): void {
    console.log('🔄 API Client base URL changed:', { from: this.baseURL, to: url });
    this.baseURL = url;
  }

  /**
   * Get current base URL
   */
  getBaseURL(): string {
    return this.baseURL;
  }

  /**
   * Test connection to backend
   */
  async testConnection(): Promise<boolean> {
    try {
      // Try to fetch tools as a health check
      await this.get('/tools');
      console.log('✅ Backend connection successful');
      return true;
    } catch (error) {
      console.log('❌ Backend connection failed:', error);
      return false;
    }
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

/**
 * Singleton API client instance
 * Use this throughout your application
 */
export const apiClient = new ApiClient();

// =============================================================================
// EXPORTS
// =============================================================================

export { ApiClient };
export default apiClient;
