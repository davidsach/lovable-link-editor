
// /**
//  * Tools API Functions
//  * All tool-related API operations
//  */

// import { apiClient } from './client';
// import { ENDPOINTS } from './endpoints';
// import {
//   Tool,
//   ToolSchema,
//   ToolExecuteRequest,
//   ToolExecuteResponse,
//   ExecuteToolRequest,
//   ExecuteToolResponse,
//   ExecuteAllToolsRequest,
//   ExecuteAllToolsResponse
// } from './types';

// // =============================================================================
// // TOOLS API OBJECT
// // =============================================================================

// export const toolsApi = {
  
//   // ---------------------------------------------------------------------------
//   // TOOLS MANAGEMENT
//   // ---------------------------------------------------------------------------

//   /**
//    * Get all available tools
//    * @returns Promise<Tool[]> - Array of available tools
//    */
//   async getTools(): Promise<Tool[]> {
//     console.log('🔧 Fetching all available tools...');
//     const tools = await apiClient.get<Tool[]>(ENDPOINTS.TOOLS.LIST);
//     console.log(`✅ Retrieved ${tools.length} tools`);
//     return tools;
//   },

//   /**
//    * Get schema for a specific tool
//    * @param toolName - Name of the tool to get schema for
//    * @returns Promise<ToolSchema> - Tool schema information
//    */
//   async getToolSchema(toolName: string): Promise<ToolSchema> {
//     console.log('📋 Fetching tool schema for:', toolName);
    
//     if (!toolName || toolName.trim() === '') {
//       throw new Error('Tool name is required');
//     }
    
//     const schema = await apiClient.get<ToolSchema>(ENDPOINTS.TOOLS.GET_SCHEMA(toolName));
//     console.log(`✅ Retrieved schema for tool: ${toolName}`);
//     return schema;
//   },

//   /**
//    * Execute a tool with parameters
//    * @param request - Tool execution request
//    * @returns Promise<ToolExecuteResponse> - Tool execution result
//    */
//   async executeTool(request: ToolExecuteRequest): Promise<ToolExecuteResponse> {
//     console.log('⚡ Executing tool:', request.tool_name);
    
//     if (!request.tool_name || request.tool_name.trim() === '') {
//       throw new Error('Tool name is required');
//     }
    
//     const result = await apiClient.post<ToolExecuteResponse>(
//       '/execute_tool_result',
//       request
//     );
    
//     console.log(`✅ Tool executed successfully: ${request.tool_name}`);
//     return result;
//   },

//   // ---------------------------------------------------------------------------
//   // PYTHON CODE EXECUTION
//   // ---------------------------------------------------------------------------

//   /**
//    * Execute Python code
//    * @param request - Python code execution request
//    * @returns Promise<ExecuteToolResponse> - Execution result
//    */
//   async executeToolResult(request: ExecuteToolRequest): Promise<ExecuteToolResponse> {
//     console.log('🐍 Executing Python code...');
    
//     if (!request.code || request.code.trim() === '') {
//       throw new Error('Python code is required');
//     }
    
//     const result = await apiClient.post<ExecuteToolResponse>(
//       '/execute_tool_result',
//       request
//     );
    
//     console.log('✅ Python code executed successfully');
//     return result;
//   },

//   /**
//    * Execute multiple Python code chunks
//    * @param request - Multiple code chunks execution request
//    * @returns Promise<ExecuteAllToolsResponse> - Execution results
//    */
//   async executeAllTools(request: ExecuteAllToolsRequest): Promise<ExecuteAllToolsResponse> {
//     console.log('🐍 Executing multiple Python code chunks...');
    
//     if (!request.code_chunks || request.code_chunks.length === 0) {
//       throw new Error('At least one code chunk is required');
//     }
    
//     const result = await apiClient.post<ExecuteAllToolsResponse>(
//       '/execute_all_tools',
//       request
//     );
    
//     console.log(`✅ All Python code chunks executed successfully (${request.code_chunks.length} chunks)`);
//     return result;
//   },

//   // ---------------------------------------------------------------------------
//   // UTILITY FUNCTIONS
//   // ---------------------------------------------------------------------------

//   /**
//    * Test tools API connection
//    * @returns Promise<boolean> - Whether connection is successful
//    */
//   async testConnection(): Promise<boolean> {
//     try {
//       await this.getTools();
//       return true;
//     } catch (error) {
//       console.error('Tools API connection test failed:', error);
//       return false;
//     }
//   }
// };

// // =============================================================================
// // EXPORTS
// // =============================================================================

// export default toolsApi;

import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import { 
  Tool, 
  ToolSchema, 
  ExecuteToolRequest,
  ExecuteToolResponse,
  ExecuteAllToolsRequest,
  ExecuteAllToolsResponse 
} from './types';

export const toolsApi = {
  // ---------------------------------------------------------------------------
  // TOOL MANAGEMENT
  // ---------------------------------------------------------------------------

  async getTools(): Promise<Tool[]> {
    console.log('🔧 Fetching all tools...');
    const tools = await apiClient.get<Tool[]>(ENDPOINTS.TOOLS.LIST);
    console.log(`✅ Retrieved ${tools.length} tools`);
    return tools;
  },

  async getToolSchema(toolName: string): Promise<ToolSchema> {
    console.log('📋 Fetching tool schema for:', toolName);
    if (!toolName || toolName.trim() === '') {
      throw new Error('Tool name is required');
    }
    const schema = await apiClient.get<ToolSchema>(ENDPOINTS.TOOLS.GET_SCHEMA(toolName));
    return schema;
  },

  // ---------------------------------------------------------------------------
  // CODE EXECUTION
  // ---------------------------------------------------------------------------

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
    return result;
  },

  async executeAllTools(request: ExecuteAllToolsRequest): Promise<ExecuteAllToolsResponse> {
    console.log('🐍 Executing multiple Python code chunks...', {
      chunkCount: request.code_chunks?.length || 0
    });
    if (!request.code_chunks || request.code_chunks.length === 0) {
      throw new Error('At least one code chunk is required');
    }
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
    return result;
  },

  // ---------------------------------------------------------------------------
  // UTILITY FUNCTIONS
  // ---------------------------------------------------------------------------

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

export default toolsApi;
