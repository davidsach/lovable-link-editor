
import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import { 
  Tool, 
  ToolSchema, 
  ToolExecuteRequest, 
  ToolExecuteResponse,
  ExecuteToolRequest,
  ExecuteToolResponse,
  ExecuteAllToolsRequest,
  ExecuteAllToolsResponse 
} from './types';

// Tools API functions
export const toolsApi = {
  // Get all available tools
  async getTools(): Promise<Tool[]> {
    return apiClient.get<Tool[]>(ENDPOINTS.TOOLS.LIST);
  },

  // Get schema for a specific tool
  async getToolSchema(toolName: string): Promise<ToolSchema> {
    return apiClient.get<ToolSchema>(ENDPOINTS.TOOLS.GET_SCHEMA(toolName));
  },

  // Execute a tool (legacy method)
  async executeTool(request: ToolExecuteRequest): Promise<ToolExecuteResponse> {
    return apiClient.post<ToolExecuteResponse>(ENDPOINTS.TOOLS.EXECUTE, request);
  },

  // Execute Python code
  async executeToolResult(request: ExecuteToolRequest): Promise<ExecuteToolResponse> {
    return apiClient.post<ExecuteToolResponse>(ENDPOINTS.CODE_EXECUTION.EXECUTE_TOOL_RESULT, request);
  },

  // Execute multiple code chunks
  async executeAllTools(request: ExecuteAllToolsRequest): Promise<ExecuteAllToolsResponse> {
    return apiClient.post<ExecuteAllToolsResponse>(ENDPOINTS.CODE_EXECUTION.EXECUTE_ALL_TOOLS, request);
  }
};
