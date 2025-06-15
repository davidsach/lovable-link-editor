
/**
 * Examples API Functions
 * All training example-related API operations
 */

import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import { 
  TrainingExample, 
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
   * @returns Promise<TrainingExample[]> - Array of training examples
   */
  async getExamples(): Promise<TrainingExample[]> {
    console.log('📚 Fetching all training examples...');
    const examples = await apiClient.get<TrainingExample[]>(ENDPOINTS.EXAMPLES.LIST);
    console.log(`✅ Retrieved ${examples.length} training examples`);
    return examples;
  },

  /**
   * Get a specific training example
   * @param id - ID of the example to retrieve
   * @returns Promise<TrainingExample> - Training example data
   */
  async getExample(id: string): Promise<TrainingExample> {
    console.log('📖 Fetching training example:', id);
    
    if (!id || id.trim() === '') {
      throw new Error('Example ID is required');
    }
    
    const example = await apiClient.get<TrainingExample>(ENDPOINTS.EXAMPLES.GET(id));
    console.log(`✅ Retrieved training example: ${example.name}`);
    return example;
  },

  /**
   * Create a new training example
   * @param example - Training example data to create
   * @returns Promise<ApiResponse<TrainingExample>> - Creation result
   */
  async createExample(example: CreateExampleRequest): Promise<ApiResponse<TrainingExample>> {
    console.log('📝 Creating new training example:', example.name);
    
    if (!example.name || example.name.trim() === '') {
      throw new Error('Example name is required');
    }
    
    const result = await apiClient.post<ApiResponse<TrainingExample>>(
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
   * @returns Promise<ApiResponse<TrainingExample>> - Update result
   */
  async updateExample(id: string, example: UpdateExampleRequest): Promise<ApiResponse<TrainingExample>> {
    console.log('📝 Updating training example:', id);
    
    if (!id || id.trim() === '') {
      throw new Error('Example ID is required');
    }
    
    const result = await apiClient.put<ApiResponse<TrainingExample>>(
      ENDPOINTS.EXAMPLES.UPDATE(id), 
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
  async deleteExample(id: string): Promise<ApiResponse<void>> {
    console.log('🗑️ Deleting training example:', id);
    
    if (!id || id.trim() === '') {
      throw new Error('Example ID is required');
    }
    
    const result = await apiClient.delete<ApiResponse<void>>(ENDPOINTS.EXAMPLES.DELETE(id));
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
