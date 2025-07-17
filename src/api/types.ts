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
// CONTENT AND MESSAGE TYPES (MATCHING BACKEND)
// =============================================================================

/**
 * Enum for Role (matches backend Role enum)
 */
export enum Role {
  SYSTEM = 1,
  USER = 2,
  ASSISTANT = 3,
}

/**
 * Enum for ChunkKind (matches backend ChunkKind enum)
 */
export enum ChunkKind {
  UNKNOWN_KIND = 0,
  CONTENT = 1,
  TOOL_CALL = 2,
  TOOL_RESULT = 3,
  FORMATTING = 4,
}

/**
 * Single chunk of a message (matches backend Chunk model)
 */
export interface Chunk {
  text?: string;
  // You can add other media fields here if needed (image, audio, video, file, control, etc.)
  kind: ChunkKind;
  role: Role;
  metadata?: Record<string, any>;
  mimetype?: string;
  channel?: string;
  trainable?: number;
  timestamp?: string;
}

/**
 * Content object for the new messages structure
 * Each message is a list of chunks
 */
export interface Content {
  chunks: Chunk[];
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
  messages: Content[]; // List of Content objects, each with .chunks
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

export interface ToolParameter {
  param_name: string;
  param_type: string;
  is_required: boolean;
  default_value: string;
}

export interface ToolFunction {
  func_name: string;
  params: ToolParameter[];
  return_value: ToolParameter;
}

export interface PythonClass {
  class_name: string;
  params: ToolParameter[];
}

export interface Tool {
  tool_name: string;
  description?: string;
  functions: ToolFunction[];
  classes: PythonClass[];
}

// =============================================================================
// CODE EXECUTION TYPES
// =============================================================================

export interface CodeChunk {
  chunk_id: number;
  code: string;
}

export interface CodeChunkOutput {
  chunk_id: number;
  code_output: Record<string, any>;
}

export interface ExecuteToolRequest {
  code: string;
}

export interface ExecuteToolResponse {
  code_output: Record<string, any>;
}

export interface ExecuteAllToolsRequest {
  code_chunks: CodeChunk[];
}

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
