
const API_BASE_URL = 'http://localhost:8000';

export interface Param {
  param_name: string;
  param_type: string;
  is_required: boolean;
  default_value: string;
}

export interface Function {
  func_name: string;
  params: Param[];
  return_value: Param;
}

export interface PythonClass {
  class_name: string;
  params: Param[];
}

export interface Tool {
  tool_name: string;
  functions: Function[];
  classes: PythonClass[];
}

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

// Legacy interfaces for backward compatibility
export interface ToolParameter {
  name: string;
  type: 'text' | 'number' | 'boolean';
  description?: string;
  required?: boolean;
}

export interface ToolSchema {
  tool_name: string;
  parameters: ToolParameter[];
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

export interface Step {
  thought: string;
  tool_name: string;
  tool_params: Record<string, any>;
  tool_result: string;
}

export interface Example {
  id: string;
  name: string;
  description: string;
  tags: string[];
  user_prompt: string;
  steps: Step[];
  created: string;
  updated: string;
}

export interface CreateExampleRequest {
  id: string;
  name: string;
  description: string;
  tags: string[];
  user_prompt: string;
  steps: Step[];
  created: string;
  updated: string;
}

export interface ApiResponse<T> {
  status: string;
  data?: T;
  message?: string;
}

class ApiService {
  // Get Tools - Updated to match your backend structure
  async getTools(): Promise<Tool[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/tools`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Tools data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching tools:', error);
      throw error;
    }
  }

  // Execute Tool Result API
  async executeToolResult(request: ExecuteToolRequest): Promise<ExecuteToolResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/execute_tool_result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Tool execute response:', data);
      return data;
    } catch (error) {
      console.error('Error executing tool:', error);
      throw error;
    }
  }

  // Execute All Tools API
  async executeAllTools(request: ExecuteAllToolsRequest): Promise<ExecuteAllToolsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/execute_all_tools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Execute all tools response:', data);
      return data;
    } catch (error) {
      console.error('Error executing all tools:', error);
      throw error;
    }
  }

  // Legacy methods for backward compatibility
  async getToolSchema(toolName: string): Promise<ToolSchema> {
    try {
      const response = await fetch(`${API_BASE_URL}/tools/${toolName}/schema`);
      const data = await response.json();
      console.log('Tool schema data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching tool schema:', error);
      throw error;
    }
  }

  async executeTool(request: ToolExecuteRequest): Promise<ToolExecuteResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/tools/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });
      const data = await response.json();
      console.log('Tool execute response:', data);
      return data;
    } catch (error) {
      console.error('Error executing tool:', error);
      throw error;
    }
  }

  async createExample(example: CreateExampleRequest): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/examples`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(example)
      });
      const data = await response.json();
      console.log('Create example response:', data);
      return data;
    } catch (error) {
      console.error('Error creating example:', error);
      throw error;
    }
  }

  async getExamples(): Promise<Example[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/examples`);
      const data = await response.json();
      console.log('Examples data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching examples:', error);
      throw error;
    }
  }

  async updateExample(exampleId: string, example: Partial<CreateExampleRequest>): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/examples/${exampleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(example)
      });
      const data = await response.json();
      console.log('Update example response:', data);
      return data;
    } catch (error) {
      console.error('Error updating example:', error);
      throw error;
    }
  }

  async getExample(exampleId: string): Promise<Example> {
    try {
      const response = await fetch(`${API_BASE_URL}/examples/${exampleId}`);
      const data = await response.json();
      console.log('Example data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching example:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
