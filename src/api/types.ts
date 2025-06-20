
/**
 * API Types and Interfaces
 * This file contains all TypeScript types used for API communication
 */

// =============================================================================
// CORE API TYPES
// =============================================================================

export interface ApiResponse<T = any> {
  status: string;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// =============================================================================
// CONTENT AND MESSAGE TYPES
// =============================================================================

/**
 * Content object for the new messages structure
 */
export interface Content {
  kind: 'user' | 'assistant' | 'tool_call' | 'tool_result' | 'code' | 'text';
  content: string;
  metadata?: Record<string, any>;
  timestamp?: string;
}

// =============================================================================
// EXAMPLE TYPES (NEW STRUCTURE)
// =============================================================================

/**
 * Complete Example Definition (New Structure)
 */
export interface Example {
  id: number;
  name: string;
  description?: string;
  messages: Content[];
  meta?: Record<string, any>;
  created_at: string;
  updated_at?: string;
}

/**
 * Request to Create New Example
 */
export interface CreateExampleRequest {
  name: string;
  description?: string;
  messages: Content[];
  meta?: Record<string, any>;
}

/**
 * Request to Update Existing Example
 */
export interface UpdateExampleRequest extends Partial<CreateExampleRequest> {}

// =============================================================================
// TOOL RELATED TYPES
// =============================================================================

/**
 * Tool Parameter Definition
 */
export interface ToolParameter {
  param_name: string;
  param_type: string;
  is_required: boolean;
  default_value: string;
}

/**
 * Tool Function Definition
 */
export interface ToolFunction {
  func_name: string;
  params: ToolParameter[];
  return_value: ToolParameter;
}

/**
 * Python Class Definition
 */
export interface PythonClass {
  class_name: string;
  params: ToolParameter[];
}

/**
 * Complete Tool Definition
 */
export interface Tool {
  tool_name: string;
  description?: string;
  functions: ToolFunction[];
  classes: PythonClass[];
}

// =============================================================================
// CODE EXECUTION TYPES
// =============================================================================

/**
 * Single Code Chunk for Execution
 */
export interface CodeChunk {
  chunk_id: number;
  code: string;
}

/**
 * Output from Code Chunk Execution
 */
export interface CodeChunkOutput {
  chunk_id: number;
  code_output: Record<string, any>;
}

/**
 * Request to Execute Python Code
 */
export interface ExecuteToolRequest {
  code: string;
}

/**
 * Response from Python Code Execution
 */
export interface ExecuteToolResponse {
  code_output: Record<string, any>;
}

/**
 * Request to Execute Multiple Code Chunks
 */
export interface ExecuteAllToolsRequest {
  code_chunks: CodeChunk[];
}

/**
 * Response from Multiple Code Chunks Execution
 */
export interface ExecuteAllToolsResponse {
  code_chunk_output: CodeChunkOutput[];
}

// =============================================================================
// LEGACY TYPES (for backward compatibility)
// =============================================================================

export interface LegacyToolParameter {
  name: string;
  type: 'text' | 'number' | 'boolean';
  description?: string;
  required?: boolean;
}

export interface ToolSchema {
  tool_name: string;
  parameters: LegacyToolParameter[];
}

export interface ToolExecuteRequest {
  tool_name: string;
  parameters: Record<string, any>;
}

export interface ToolExecuteResponse {
  status: string;
  result: any;
  error?: string;
}
