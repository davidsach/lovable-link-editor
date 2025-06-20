
/**
 * Examples API Functions
 * All training example-related API operations
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
   * Get all training examples
   * @returns Promise<Example[]> - Array of training examples
   */
  async getExamples(): Promise<Example[]> {
    console.log('📚 Fetching all training examples...');
    const examples = await apiClient.get<Example[]>(ENDPOINTS.EXAMPLES.LIST);
    console.log(`✅ Retrieved ${examples.length} training examples`);
    return examples;
  },

  /**
   * Get a specific training example
   * @param id - ID of the example to retrieve
   * @returns Promise<Example> - Training example data
   */
  async getExample(id: string | number): Promise<Example> {
    console.log('📖 Fetching training example:', id);
    
    if (!id || (typeof id === 'string' && id.trim() === '')) {
      throw new Error('Example ID is required');
    }
    
    const example = await apiClient.get<Example>(ENDPOINTS.EXAMPLES.GET(id.toString()));
    console.log(`✅ Retrieved training example: ${example.name}`);
    return example;
  },

  /**
   * Create a new training example
   * @param example - Training example data to create
   * @returns Promise<ApiResponse<Example>> - Creation result
   */
  async createExample(example: CreateExampleRequest): Promise<ApiResponse<Example>> {
    console.log('📝 Creating new training example:', example.name);
    
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
    
    console.log(`✅ Training example created successfully: ${example.name}`);
    return result;
  },

  /**
   * Update an existing training example
   * @param id - ID of the example to update
   * @param example - Updated training example data
   * @returns Promise<ApiResponse<Example>> - Update result
   */
  async updateExample(id: string | number, example: UpdateExampleRequest): Promise<ApiResponse<Example>> {
    console.log('📝 Updating training example:', id);
    
    if (!id || (typeof id === 'string' && id.trim() === '')) {
      throw new Error('Example ID is required');
    }
    
    const result = await apiClient.put<ApiResponse<Example>>(
      ENDPOINTS.EXAMPLES.UPDATE(id.toString()), 
      example
    );
    
    console.log(`✅ Training example updated successfully: ${id}`);
    return result;
  },

  /**
   * Delete a training example
   * @param id - ID of the example to delete
   * @returns Promise<ApiResponse<void>> - Deletion result
   */
  async deleteExample(id: string | number): Promise<ApiResponse<void>> {
    console.log('🗑️ Deleting training example:', id);
    
    if (!id || (typeof id === 'string' && id.trim() === '')) {
      throw new Error('Example ID is required');
    }
    
    const result = await apiClient.delete<ApiResponse<void>>(ENDPOINTS.EXAMPLES.DELETE(id.toString()));
    console.log(`✅ Training example deleted successfully: ${id}`);
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
