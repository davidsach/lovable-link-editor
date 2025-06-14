
// All API-related TypeScript interfaces and types
export interface ApiResponse<T = any> {
  status: string;
  data?: T;
  message?: string;
  error?: string;
}

// Tool-related types
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
  functions: ToolFunction[];
  classes: PythonClass[];
}

// Code execution types
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

// Legacy types for backward compatibility
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

// Training example types
export interface Step {
  thought: string;
  tool_name: string;
  tool_params: Record<string, any>;
  tool_result: string;
}

export interface TrainingStep {
  thought: string;
  tool_name: string;
  tool_params: Record<string, any>;
  tool_result: string;
}

export interface TrainingExample {
  id: string;
  name: string;
  description: string;
  tags: string[];
  user_prompt: string;
  steps: TrainingStep[];
  created: string;
  updated: string;
}

export interface CreateExampleRequest extends TrainingExample {}

export interface UpdateExampleRequest extends Partial<TrainingExample> {}

// Error types
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}
