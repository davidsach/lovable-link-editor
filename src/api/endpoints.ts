
// API endpoint constants - makes it easy to update URLs
export const API_BASE_URL = 'http://localhost:8000';

export const ENDPOINTS = {
  // Tool-related endpoints
  TOOLS: {
    LIST: '/tools',
    GET_SCHEMA: (toolName: string) => `/tools/${toolName}/schema`,
    EXECUTE: '/tools/execute'
  },
  
  // Code execution endpoints
  CODE_EXECUTION: {
    EXECUTE_TOOL_RESULT: '/execute_tool_result',
    EXECUTE_ALL_TOOLS: '/execute_all_tools'
  },
  
  // Example/Training data endpoints
  EXAMPLES: {
    LIST: '/examples',
    CREATE: '/examples',
    GET: (id: string) => `/examples/${id}`,
    UPDATE: (id: string) => `/examples/${id}`,
    DELETE: (id: string) => `/examples/${id}`
  },
  
  // Future endpoints you might need
  CONVERSATIONS: {
    LIST: '/conversations',
    CREATE: '/conversations',
    GET: (id: string) => `/conversations/${id}`,
    UPDATE: (id: string) => `/conversations/${id}`,
    DELETE: (id: string) => `/conversations/${id}`
  }
} as const;
