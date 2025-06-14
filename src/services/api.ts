
// Legacy API service - kept for backward compatibility
// New code should use the files in src/api/ folder
import { toolsApi } from '../api/toolsApi';
import { examplesApi } from '../api/examplesApi';

// Re-export types for backward compatibility
export * from '../api/types';

// Legacy API service class
class ApiService {
  // Tools methods - delegate to new toolsApi
  async getTools() {
    return toolsApi.getTools();
  }

  async getToolSchema(toolName: string) {
    return toolsApi.getToolSchema(toolName);
  }

  async executeTool(request: any) {
    return toolsApi.executeTool(request);
  }

  async executeToolResult(request: any) {
    return toolsApi.executeToolResult(request);
  }

  async executeAllTools(request: any) {
    return toolsApi.executeAllTools(request);
  }

  // Examples methods - delegate to new examplesApi
  async getExamples() {
    return examplesApi.getExamples();
  }

  async getExample(id: string) {
    return examplesApi.getExample(id);
  }

  async createExample(example: any) {
    return examplesApi.createExample(example);
  }

  async updateExample(id: string, example: any) {
    return examplesApi.updateExample(id, example);
  }
}

export const apiService = new ApiService();
