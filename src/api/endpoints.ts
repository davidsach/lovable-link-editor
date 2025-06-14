
/**
 * API Endpoints Configuration
 * Centralized location for all API endpoint definitions
 */

// =============================================================================
// BASE CONFIGURATION
// =============================================================================

/**
 * Base URL for all API requests
 * Change this to your backend server URL
 */
export const API_BASE_URL = 'http://localhost:8000';

// =============================================================================
// ENDPOINT DEFINITIONS
// =============================================================================

export const ENDPOINTS = {
  
  // ---------------------------------------------------------------------------
  // TOOL ENDPOINTS
  // ---------------------------------------------------------------------------
  TOOLS: {
    /**
     * GET /tools - Retrieve all available tools
     */
    LIST: '/tools',
    
    /**
     * GET /tools/{toolName}/schema - Get schema for specific tool
     * @param toolName - Name of the tool to get schema for
     */
    GET_SCHEMA: (toolName: string) => `/tools/${toolName}/schema`,
    
    /**
     * POST /tools/execute - Execute a tool with parameters
     */
    EXECUTE: '/tools/execute'
  },
  
  // ---------------------------------------------------------------------------
  // CODE EXECUTION ENDPOINTS
  // ---------------------------------------------------------------------------
  CODE_EXECUTION: {
    /**
     * POST /execute_tool_result - Execute Python code
     */
    EXECUTE_TOOL_RESULT: '/execute_tool_result',
    
    /**
     * POST /execute_all_tools - Execute multiple code chunks
     */
    EXECUTE_ALL_TOOLS: '/execute_all_tools'
  },
  
  // ---------------------------------------------------------------------------
  // TRAINING EXAMPLES ENDPOINTS
  // ---------------------------------------------------------------------------
  EXAMPLES: {
    /**
     * GET /examples - List all training examples
     */
    LIST: '/examples',
    
    /**
     * POST /examples - Create new training example
     */
    CREATE: '/examples',
    
    /**
     * GET /examples/{id} - Get specific training example
     * @param id - ID of the example to retrieve
     */
    GET: (id: string) => `/examples/${id}`,
    
    /**
     * PUT /examples/{id} - Update existing training example
     * @param id - ID of the example to update
     */
    UPDATE: (id: string) => `/examples/${id}`,
    
    /**
     * DELETE /examples/{id} - Delete training example
     * @param id - ID of the example to delete
     */
    DELETE: (id: string) => `/examples/${id}`
  },
  
  // ---------------------------------------------------------------------------
  // CONVERSATION ENDPOINTS (Future Implementation)
  // ---------------------------------------------------------------------------
  CONVERSATIONS: {
    /**
     * GET /conversations - List all conversations
     */
    LIST: '/conversations',
    
    /**
     * POST /conversations - Create new conversation
     */
    CREATE: '/conversations',
    
    /**
     * GET /conversations/{id} - Get specific conversation
     * @param id - ID of the conversation to retrieve
     */
    GET: (id: string) => `/conversations/${id}`,
    
    /**
     * PUT /conversations/{id} - Update existing conversation
     * @param id - ID of the conversation to update
     */
    UPDATE: (id: string) => `/conversations/${id}`,
    
    /**
     * DELETE /conversations/{id} - Delete conversation
     * @param id - ID of the conversation to delete
     */
    DELETE: (id: string) => `/conversations/${id}`
  }
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get full URL for an endpoint
 * @param endpoint - The endpoint path
 * @returns Complete URL with base URL
 */
export const getFullUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

/**
 * Update the base URL (useful for different environments)
 * @param newBaseUrl - New base URL to use
 */
export const updateBaseUrl = (newBaseUrl: string): void => {
  // Note: This would need to be implemented with a state management solution
  // for runtime URL changes. Currently API_BASE_URL is a constant.
  console.warn('Base URL update requested:', newBaseUrl);
};
