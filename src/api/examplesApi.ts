
// /**
//  * Examples API Functions
//  * All example-related API operations using new Content-based structure
//  */

// import { apiClient } from './client';
// import { ENDPOINTS } from './endpoints';
// import {
//   Example,
//   CreateExampleRequest,
//   UpdateExampleRequest,
//   ApiResponse
// } from './types';

// // =============================================================================
// // EXAMPLES API OBJECT
// // =============================================================================

// export const examplesApi = {
  
//   // ---------------------------------------------------------------------------
//   // EXAMPLES MANAGEMENT
//   // ---------------------------------------------------------------------------

//   /**
//    * Get all examples
//    * @returns Promise<Example[]> - Array of examples
//    */
//   async getExamples(): Promise<Example[]> {
//     console.log('📚 Fetching all examples...');
//     const examples = await apiClient.get<Example[]>(ENDPOINTS.EXAMPLES.LIST);
//     console.log(`✅ Retrieved ${examples.length} examples`);
//     return examples;
//   },

//   /**
//    * Get a specific example
//    * @param id - ID of the example to retrieve
//    * @returns Promise<Example> - Example data
//    */
//   async getExample(id: string): Promise<Example> {
//     console.log('📖 Fetching example:', id);
    
//     if (!id || id.trim() === '') {
//       throw new Error('Example ID is required');
//     }
    
//     const example = await apiClient.get<Example>(ENDPOINTS.EXAMPLES.GET(id));
//     console.log(`✅ Retrieved example: ${example.name}`);
//     return example;
//   },

//   /**
//    * Create a new example
//    * @param example - Example data to create
//    * @returns Promise<ApiResponse<Example>> - Creation result
//    */
//   async createExample(example: CreateExampleRequest): Promise<ApiResponse<Example>> {
//     console.log('📝 Creating new example:', example.name);
    
//     if (!example.name || example.name.trim() === '') {
//       throw new Error('Example name is required');
//     }
    
//     if (!example.messages || example.messages.length === 0) {
//       throw new Error('Example messages are required');
//     }
    
//     const result = await apiClient.post<ApiResponse<Example>>(
//       ENDPOINTS.EXAMPLES.CREATE,
//       example
//     );
    
//     console.log(`✅ Example created successfully: ${example.name}`);
//     return result;
//   },

//   /**
//    * Update an existing example
//    * @param id - ID of the example to update
//    * @param example - Updated example data
//    * @returns Promise<ApiResponse<Example>> - Update result
//    */
//   async updateExample(id: string, example: UpdateExampleRequest): Promise<ApiResponse<Example>> {
//     console.log('📝 Updating example:', id);
    
//     if (!id || id.trim() === '') {
//       throw new Error('Example ID is required');
//     }
    
//     const result = await apiClient.put<ApiResponse<Example>>(
//       ENDPOINTS.EXAMPLES.UPDATE(id),
//       example
//     );
    
//     console.log(`✅ Example updated successfully: ${id}`);
//     return result;
//   },

//   /**
//    * Delete an example
//    * @param id - ID of the example to delete
//    * @returns Promise<ApiResponse<void>> - Deletion result
//    */
//   async deleteExample(id: string): Promise<ApiResponse<void>> {
//     console.log('🗑️ Deleting example:', id);
    
//     if (!id || id.trim() === '') {
//       throw new Error('Example ID is required');
//     }
    
//     const result = await apiClient.delete<ApiResponse<void>>(ENDPOINTS.EXAMPLES.DELETE(id));
//     console.log(`✅ Example deleted successfully: ${id}`);
//     return result;
//   },

//   /**
//    * Save example to markdown file
//    * @param filePath - Path where to save the markdown file
//    * @param example - Example data to save
//    * @returns Promise<ApiResponse<any>> - Save result
//    */
//   async saveToJSON(filePath: string, example: CreateExampleRequest): Promise<ApiResponse<any>> {
//     console.log('📝 Saving example to json:', filePath);
    
//     if (!filePath || filePath.trim() === '') {
//       throw new Error('File path is required');
//     }
    
//     if (!example.name || example.name.trim() === '') {
//       throw new Error('Example name is required');
//     }
    
//     const result = await apiClient.post<ApiResponse<any>>(
//       ENDPOINTS.EXAMPLES.SAVE_JSON,
//       { file_path: filePath, example }
//     );
    
//     console.log(`✅ Example saved to markdown successfully: ${filePath}`);
//     return result;
//   },

//   /**
//    * Load example from markdown file
//    * @param filePath - Path to the markdown file to load
//    * @returns Promise<Example> - Loaded example data
//    */
//   async loadFromMarkdown(filePath: string): Promise<Example> {
//     console.log('📖 Loading example from JSON:', filePath);
    
//     if (!filePath || filePath.trim() === '') {
//       throw new Error('File path is required');
//     }
    
//     const result = await apiClient.get<Example>(`${ENDPOINTS.EXAMPLES.LOAD_JSON}?path=${encodeURIComponent(filePath)}`);
//     console.log(`✅ Example loaded from JSON successfully: ${filePath}`);
//     return result;
//   },

//   // ---------------------------------------------------------------------------
//   // UTILITY FUNCTIONS
//   // ---------------------------------------------------------------------------

//   /**
//    * Test examples API connection
//    * @returns Promise<boolean> - Whether connection is successful
//    */
//   async testConnection(): Promise<boolean> {
//     try {
//       await this.getExamples();
//       return true;
//     } catch (error) {
//       console.error('Examples API connection test failed:', error);
//       return false;
//     }
//   }
// };

// // =============================================================================
// // EXPORTS
// // =============================================================================

// export default examplesApi;


/**
 * Examples API Module
 * 
 * This module provides all API functions for managing training examples.
 * It supports both database operations and file-based operations (JSON).
 * 
 * Database Operations:
 * - CRUD operations for examples stored in the backend database
 * - Full example management with metadata, timestamps, etc.
 * 
 * File Operations:
 * - Save/load examples as JSON files for backup and sharing
 * - Useful for version control and offline storage
 * 
 * All functions include proper error handling, logging, and type safety.
 * 
 * @fileoverview API functions for managing training examples
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

/**
 * Examples API object containing all example-related operations
 * Organized into database operations and file operations
 */
export const examplesApi = {

  // ---------------------------------------------------------------------------
  // EXAMPLES MANAGEMENT - DATABASE
  // ---------------------------------------------------------------------------

  /**
   * Get all examples from database
   * @returns Promise<Example[]> - Array of examples
   */
  async getExamples(): Promise<Example[]> {
    console.log('📚 Fetching all examples...');
    const examples = await apiClient.get<Example[]>(ENDPOINTS.EXAMPLES.LIST);
    console.log(`✅ Retrieved ${examples.length} examples`);
    return examples;
  },

  /**
   * Get a specific example from database
   */
  async getExample(id: string): Promise<Example> {
    console.log('📖 Fetching example by ID:', id);
    if (!id || id.trim() === '') throw new Error('Example ID is required');
    const example = await apiClient.get<Example>(ENDPOINTS.EXAMPLES.GET(id));
    console.log(`✅ Retrieved example: ${example.name}`);
    return example;
  },

  /**
   * Create a new example in the database
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
   * Update an example in the database
   */
  async updateExample(id: string, example: UpdateExampleRequest): Promise<ApiResponse<Example>> {
    console.log('📝 Updating example:', id);
    if (!id || id.trim() === '') throw new Error('Example ID is required');
    const result = await apiClient.put<ApiResponse<Example>>(
      ENDPOINTS.EXAMPLES.UPDATE(id), 
      example
    );
    console.log(`✅ Example updated successfully: ${id}`);
    return result;
  },

  /**
   * Delete an example from the database
   */
  async deleteExample(id: string): Promise<ApiResponse<void>> {
    console.log('🗑️ Deleting example:', id);
    if (!id || id.trim() === '') throw new Error('Example ID is required');
    const result = await apiClient.delete<ApiResponse<void>>(ENDPOINTS.EXAMPLES.DELETE(id));
    console.log(`✅ Example deleted successfully: ${id}`);
    return result;
  },

  // ---------------------------------------------------------------------------
  // FILE-BASED (JSON) EXAMPLE MANAGEMENT
  // ---------------------------------------------------------------------------

  /**
   * Save example to JSON file
   * @param filePath - Path to save the JSON file (relative/absolute)
   * @param example - Example data to save
   * @returns Promise<ApiResponse<any>> - Save confirmation
   */
  async saveToJSON(filePath: string, example: CreateExampleRequest): Promise<ApiResponse<any>> {
    console.log('📝 Saving example to json:', filePath);
    if (!filePath || filePath.trim() === '') throw new Error('File path is required');
    if (!example.name || example.name.trim() === '') throw new Error('Example name is required');
    const result = await apiClient.post<ApiResponse<any>>(
      ENDPOINTS.EXAMPLES.SAVE_JSON,
      { file_path: filePath, example }
    );
    console.log(`✅ Example saved to json successfully: ${filePath}`);
    return result;
  },

  /**
   * Load example from JSON file
   * @param filePath - Path to the JSON file to load
   * @returns Promise<Example> - Loaded example data (may lack database fields)
   */
  async loadFromJSON(filePath: string): Promise<Example> {
    console.log('📖 Loading example from JSON:', filePath);
    if (!filePath || filePath.trim() === '') throw new Error('File path is required');
    // Backend expects POST with { file_path }
    const result = await apiClient.post<Example>(
      ENDPOINTS.EXAMPLES.LOAD_JSON,
      { file_path: filePath }
    );
    console.log(`✅ Example loaded from JSON successfully: ${filePath}`);
    return result;
  },

  // ---------------------------------------------------------------------------
  // UTILITY FUNCTIONS
  // ---------------------------------------------------------------------------

  /**
   * Test examples API connection
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

export default examplesApi;
