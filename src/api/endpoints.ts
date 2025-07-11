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
export const API_BASE_URL = "http://127.0.0.1:8000";

// =============================================================================
// ENDPOINT DEFINITIONS
// =============================================================================

export const ENDPOINTS = {
  // ---------------------------------------------------------------------------
  // TOOL ENDPOINTS
  // ---------------------------------------------------------------------------
  TOOLS: {
    /**
     * GET /tools/ - Retrieve all available tools
     */
    LIST: "/tools/",

    /**
     * GET /tools/{toolName}/schema - Get schema for specific tool
     * @param toolName - Name of the tool to get schema for
     */
    GET_SCHEMA: (toolName: string) => `/tools/${toolName}/schema`,
  },

  // ---------------------------------------------------------------------------
  // CODE EXECUTION ENDPOINTS
  // ---------------------------------------------------------------------------
  CODE_EXECUTION: {
    /**
     * POST /tools/execute_tool_result - Execute Python code
     */
    EXECUTE_TOOL_RESULT: "/tools/execute_tool_result",

    /**
     * POST /tools/execute_all_tools - Execute multiple code chunks
     */
    EXECUTE_ALL_TOOLS: "/tools/execute_all_tools",
  },

  // ---------------------------------------------------------------------------
  // TRAINING EXAMPLES ENDPOINTS
  // ---------------------------------------------------------------------------
  EXAMPLES: {
    /**
     * GET /examples/ - List all training examples
     */
    LIST: "/examples/",

    /**
     * POST /examples/ - Create new training example
     */
    CREATE: "/examples/",

    /**
     * GET /examples/{id}/ - Get specific training example
     * @param id - ID of the example to retrieve
     */
    GET: (id: string | number) => `/examples/${id}`,

    /**
     * PUT /examples/{id}/ - Update existing training example
     * @param id - ID of the example to update
     */
    UPDATE: (id: string | number) => `/examples/${id}`,

    /**
     * DELETE /examples/{id}/ - Delete training example
     * @param id - ID of the example to delete
     */
    DELETE: (id: string | number) => `/examples/${id}`,

    /**
     * POST /examples/save-markdown - Save example to markdown file
     */
    SAVE_MARKDOWN: "/examples/save-markdown",

    /**
     * GET /examples/load-markdown - Load example from markdown file
     */
    LOAD_MARKDOWN: "/examples/load-markdown",
  },
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
  // Prevent accidental double slashes
  if (endpoint.startsWith('/')) {
    return `${API_BASE_URL}${endpoint}`;
  }
  return `${API_BASE_URL}/${endpoint}`;
};

/**
 * Update the base URL (useful for different environments)
 * @param newBaseUrl - New base URL to use
 */
export const updateBaseUrl = (newBaseUrl: string): void => {
  // This function can be expanded to actually update the base URL if needed.
  console.warn("Base URL update requested:", newBaseUrl);
};

