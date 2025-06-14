
/**
 * Tools API Functions
 * All tool-related API operations
 */

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

// =============================================================================
// TOOLS API OBJECT
// =============================================================================

export const toolsApi = {
  
  // ---------------------------------------------------------------------------
  // TOOL MANAGEMENT
  // ---------------------------------------------------------------------------

  /**
   * Get all available tools from backend
   * @returns Promise<Tool[]> - Array of available tools
   */
  async getTools(): Promise<Tool[]> {
    console.log('🔧 Fetching all tools...');
    const tools = await apiClient.get<Tool[]>(ENDPOINTS.TOOLS.LIST);
    console.log(`✅ Retrieved ${tools.length} tools`);
    return tools;
  },

  /**
   * Get schema for a specific tool
   * @param toolName - Name of the tool to get schema for
   * @returns Promise<ToolSchema> - Tool schema with parameters
   */
  async getToolSchema(toolName: string): Promise<ToolSchema> {
    console.log('📋 Fetching tool schema for:', toolName);
    
    if (!toolName || toolName.trim() === '') {
      throw new Error('Tool name is required');
    }
    
    const schema = await apiClient.get<ToolSchema>(ENDPOINTS.TOOLS.GET_SCHEMA(toolName));
    console.log(`✅ Retrieved schema for ${toolName}:`, {
      parameterCount: schema.parameters?.length || 0
    });
    
    return schema;
  },

  // ---------------------------------------------------------------------------
  // TOOL EXECUTION
  // ---------------------------------------------------------------------------

  /**
   * Execute a tool with parameters (legacy method)
   * @param request - Tool execution request
   * @returns Promise<ToolExecuteResponse> - Execution result
   */
  async executeTool(request: ToolExecuteRequest): Promise<ToolExecuteResponse> {
    console.log('⚡ Executing tool:', {
      toolName: request.tool_name,
      parameterCount: Object.keys(request.parameters || {}).length
    });
    
    if (!request.tool_name) {
      throw new Error('Tool name is required for execution');
    }
    
    const result = await apiClient.post<ToolExecuteResponse>(
      ENDPOINTS.TOOLS.EXECUTE, 
      request
    );
    
    console.log(`✅ Tool ${request.tool_name} executed successfully:`, {
      status: result.status,
      hasResult: !!result.result,
      hasError: !!result.error
    });
    
    return result;
  },

  // ---------------------------------------------------------------------------
  // CODE EXECUTION
  // ---------------------------------------------------------------------------

  /**
   * Execute Python code directly
   * @param request - Python code execution request
   * @returns Promise<ExecuteToolResponse> - Execution result
   */
  async executeToolResult(request: ExecuteToolRequest): Promise<ExecuteToolResponse> {
    console.log('🐍 Executing Python code...', {
      codeLength: request.code?.length || 0,
      hasCode: !!request.code
    });
    
    if (!request.code || request.code.trim() === '') {
      throw new Error('Python code is required');
    }
    
    const result = await apiClient.post<ExecuteToolResponse>(
      ENDPOINTS.CODE_EXECUTION.EXECUTE_TOOL_RESULT, 
      request
    );
    
    console.log('✅ Python code executed successfully:', {
      outputKeys: Object.keys(result.code_output || {})
    });
    
    return result;
  },

  /**
   * Execute multiple Python code chunks
   * @param request - Multiple code chunks execution request
   * @returns Promise<ExecuteAllToolsResponse> - Execution results
   */
  async executeAllTools(request: ExecuteAllToolsRequest): Promise<ExecuteAllToolsResponse> {
    console.log('🐍 Executing multiple Python code chunks...', {
      chunkCount: request.code_chunks?.length || 0
    });
    
    if (!request.code_chunks || request.code_chunks.length === 0) {
      throw new Error('At least one code chunk is required');
    }
    
    // Validate all chunks have required fields
    request.code_chunks.forEach((chunk, index) => {
      if (typeof chunk.chunk_id !== 'number') {
        throw new Error(`Code chunk at index ${index} missing valid chunk_id`);
      }
      if (!chunk.code || chunk.code.trim() === '') {
        throw new Error(`Code chunk ${chunk.chunk_id} has empty code`);
      }
    });
    
    const result = await apiClient.post<ExecuteAllToolsResponse>(
      ENDPOINTS.CODE_EXECUTION.EXECUTE_ALL_TOOLS, 
      request
    );
    
    console.log('✅ All Python code chunks executed:', {
      inputChunks: request.code_chunks.length,
      outputChunks: result.code_chunk_output?.length || 0
    });
    
    return result;
  },

  // ---------------------------------------------------------------------------
  // UTILITY FUNCTIONS
  // ---------------------------------------------------------------------------

  /**
   * Test tools API connection
   * @returns Promise<boolean> - Whether connection is successful
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getTools();
      return true;
    } catch (error) {
      console.error('Tools API connection test failed:', error);
      return false;
    }
  }
};

// =============================================================================
// EXPORTS
// =============================================================================

export default toolsApi;
