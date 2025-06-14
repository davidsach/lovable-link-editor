
import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import { 
  TrainingExample, 
  CreateExampleRequest, 
  UpdateExampleRequest,
  ApiResponse 
} from './types';

// Examples API functions
export const examplesApi = {
  // Get all examples
  async getExamples(): Promise<TrainingExample[]> {
    return apiClient.get<TrainingExample[]>(ENDPOINTS.EXAMPLES.LIST);
  },

  // Get a specific example
  async getExample(id: string): Promise<TrainingExample> {
    return apiClient.get<TrainingExample>(ENDPOINTS.EXAMPLES.GET(id));
  },

  // Create a new example
  async createExample(example: CreateExampleRequest): Promise<ApiResponse<TrainingExample>> {
    return apiClient.post<ApiResponse<TrainingExample>>(ENDPOINTS.EXAMPLES.CREATE, example);
  },

  // Update an existing example
  async updateExample(id: string, example: UpdateExampleRequest): Promise<ApiResponse<TrainingExample>> {
    return apiClient.put<ApiResponse<TrainingExample>>(ENDPOINTS.EXAMPLES.UPDATE(id), example);
  },

  // Delete an example
  async deleteExample(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(ENDPOINTS.EXAMPLES.DELETE(id));
  }
};
