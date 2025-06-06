
const API_BASE_URL = 'http://localhost:8000';

export interface Tool {
  name: string;
  description: string;
  functions: string[];
}

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
  // A. Get Tools
  async getTools(): Promise<Tool[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/tools`);
      const data = await response.json();
      console.log('Tools data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching tools:', error);
      throw error;
    }
  }

  // Get Tool Schema
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

  // Execute Tool
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

  // B. Create a New Example
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

  // C. Get All Examples
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

  // D. Update an Example
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

  // Get specific example by ID
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
