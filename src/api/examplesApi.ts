
/**
 * Examples API Functions
 * All example-related API operations using new Content-based structure
 */

import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import { 
  Example, 
  CreateExampleRequest, 
  UpdateExampleRequest,
  ApiResponse 
} from './types';

// =============================================================================
// EXAMPLES API OBJECT
// =============================================================================

export const examplesApi = {
  
  // ---------------------------------------------------------------------------
  // EXAMPLES MANAGEMENT
  // ---------------------------------------------------------------------------

  /**
   * Get all examples
   * @returns Promise<Example[]> - Array of examples
   */
  async getExamples(): Promise<Example[]> {
    console.log('📚 Fetching all examples...');
    const examples = await apiClient.get<Example[]>(ENDPOINTS.EXAMPLES.LIST);
    console.log(`✅ Retrieved ${examples.length} examples`);
    return examples;
  },

  /**
   * Get a specific example
   * @param id - ID of the example to retrieve
   * @returns Promise<Example> - Example data
   */
  async getExample(id: string): Promise<Example> {
    console.log('📖 Fetching example:', id);
    
    if (!id || id.trim() === '') {
      throw new Error('Example ID is required');
    }
    
    const example = await apiClient.get<Example>(ENDPOINTS.EXAMPLES.GET(id));
    console.log(`✅ Retrieved example: ${example.name}`);
    return example;
  },

  /**
   * Create a new example
   * @param example - Example data to create
   * @returns Promise<ApiResponse<Example>> - Creation result
   */
  async createExample(example: CreateExampleRequest): Promise<ApiResponse<Example>> {
    console.log('📝 Creating new example:', example.name);
    
    if (!example.name || example.name.trim() === '') {
      throw new Error('Example name is required');
    }
    
    if (!example.messages || example.messages.length === 0) {
      throw new Error('Example messages are required');
    }
    
    const result = await apiClient.post<ApiResponse<Example>>(
      ENDPOINTS.EXAMPLES.CREATE, 
      example
    );
    
    console.log(`✅ Example created successfully: ${example.name}`);
    return result;
  },

  /**
   * Update an existing example
   * @param id - ID of the example to update
   * @param example - Updated example data
   * @returns Promise<ApiResponse<Example>> - Update result
   */
  async updateExample(id: string, example: UpdateExampleRequest): Promise<ApiResponse<Example>> {
    console.log('📝 Updating example:', id);
    
    if (!id || id.trim() === '') {
      throw new Error('Example ID is required');
    }
    
    const result = await apiClient.put<ApiResponse<Example>>(
      ENDPOINTS.EXAMPLES.UPDATE(id), 
      example
    );
    
    console.log(`✅ Example updated successfully: ${id}`);
    return result;
  },

  /**
   * Delete an example
   * @param id - ID of the example to delete
   * @returns Promise<ApiResponse<void>> - Deletion result
   */
  async deleteExample(id: string): Promise<ApiResponse<void>> {
    console.log('🗑️ Deleting example:', id);
    
    if (!id || id.trim() === '') {
      throw new Error('Example ID is required');
    }
    
    const result = await apiClient.delete<ApiResponse<void>>(ENDPOINTS.EXAMPLES.DELETE(id));
    console.log(`✅ Example deleted successfully: ${id}`);
    return result;
  },

  // ---------------------------------------------------------------------------
  // UTILITY FUNCTIONS
  // ---------------------------------------------------------------------------

  /**
   * Test examples API connection
   * @returns Promise<boolean> - Whether connection is successful
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getExamples();
      return true;
    } catch (error) {
      console.error('Examples API connection test failed:', error);
      return false;
    }
  }
};

// =============================================================================
// EXPORTS
// =============================================================================

export default examplesApi;
