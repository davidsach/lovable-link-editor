
/**
 * Main API Export File
 * Centralized exports for cleaner imports throughout the application
 */

// =============================================================================
// TYPE EXPORTS
// =============================================================================
export * from './types';

// =============================================================================
// CONFIGURATION EXPORTS
// =============================================================================
export * from './endpoints';

// =============================================================================
// CLIENT EXPORTS
// =============================================================================
export * from './client';
export { default as apiClient } from './client';

// =============================================================================
// API SERVICE EXPORTS
// =============================================================================
export * from './toolsApi';
export * from './examplesApi';

// =============================================================================
// CONVENIENCE RE-EXPORTS
// =============================================================================

// Main client instance for convenience
export { apiClient as default } from './client';

// API service objects
export { toolsApi } from './toolsApi';
export { examplesApi } from './examplesApi';

// =============================================================================
// API OVERVIEW DOCUMENTATION
// =============================================================================

/**
 * API Structure Overview:
 * 
 * 1. TYPES (./types.ts)
 *    - All TypeScript interfaces and types
 *    - Tool, Example, Request/Response types
 * 
 * 2. ENDPOINTS (./endpoints.ts)
 *    - Centralized endpoint definitions
 *    - Base URL configuration
 * 
 * 3. CLIENT (./client.ts)
 *    - HTTP client with error handling
 *    - Logging and debugging features
 * 
 * 4. TOOLS API (./toolsApi.ts)
 *    - Tool management functions
 *    - Code execution functions
 * 
 * 5. EXAMPLES API (./examplesApi.ts)
 *    - Training example CRUD operations
 * 
 * Usage Examples:
 * 
 * ```typescript
 * import { toolsApi, apiClient, ENDPOINTS } from '@/api';
 * 
 * // Get all tools
 * const tools = await toolsApi.getTools();
 * 
 * // Execute Python code
 * const result = await toolsApi.executeToolResult({ code: 'print("Hello")' });
 * 
 * // Execute multiple code chunks
 * const multiResult = await toolsApi.executeAllTools({
 *   code_chunks: [
 *     { chunk_id: 1, code: 'print("First chunk")' },
 *     { chunk_id: 2, code: 'print("Second chunk")' }
 *   ]
 * });
 * 
 * // Direct API call
 * const response = await apiClient.get('/custom-endpoint');
 * ```
 */
