
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
// TOOL RELATED TYPES
// =============================================================================

/**
 * Tool Parameter Definition
 * Used to define parameters for tool functions
 */
export interface ToolParameter {
  param_name: string;
  param_type: string;
  is_required: boolean;
  default_value: string;
}

/**
 * Tool Function Definition
 * Represents a function within a tool
 */
export interface ToolFunction {
  func_name: string;
  params: ToolParameter[];
  return_value: ToolParameter;
}

/**
 * Python Class Definition
 * Represents a Python class within a tool
 */
export interface PythonClass {
  class_name: string;
  params: ToolParameter[];
}

/**
 * Complete Tool Definition
 * Main tool structure containing functions and classes
 */
export interface Tool {
  tool_name: string;
  description?: string;
  functions: ToolFunction[];
  classes: PythonClass[];
}

// =============================================================================
// LEGACY TOOL TYPES (for backward compatibility)
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
// TRAINING EXAMPLE TYPES
// =============================================================================

/**
 * Single Training Step
 * Represents one step in a training conversation
 */
export interface TrainingStep {
  thought: string;
  tool_name: string;
  tool_params: Record<string, any>;
  tool_result: string;
}

/**
 * Legacy Step Interface (for backward compatibility)
 */
export interface Step extends TrainingStep {}

/**
 * Complete Training Example
 * Represents a full conversation example for training
 */
export interface TrainingExample {
  id: string;
  name: string;
  description: string;
  tags: string[];
  user_query: string;
  user_prompt: string;
  steps: TrainingStep[];
  created: string;
  updated: string;
}

/**
 * Request to Create New Training Example
 */
export interface CreateExampleRequest {
  name?: string;
  description?: string;
  user_query: string;
  assistant_response: string;
  tool_calls: any[];
  tags?: string[];
}

/**
 * Request to Update Existing Training Example
 */
export interface UpdateExampleRequest extends Partial<CreateExampleRequest> {}
