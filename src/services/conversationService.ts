
import { SavedConversation } from '../types/toolTrainer';

interface PythonExecutionRequest {
  code: string;
  language?: string;
}

interface PythonExecutionResponse {
  status: 'success' | 'error';
  result?: any;
  error?: string;
  executionTime?: number;
}

class ConversationService {
  private readonly STORAGE_KEY = 'saved-conversations';
  private readonly API_BASE_URL = 'http://localhost:8000'; // Your backend API URL

  // Save conversation locally
  saveConversation(conversation: Omit<SavedConversation, 'id' | 'created_at'>): SavedConversation {
    const saved = this.getSavedConversations();
    const newConversation: SavedConversation = {
      ...conversation,
      id: Date.now(), // Use number instead of string
      created_at: new Date().toISOString()
    };
    
    saved.push(newConversation);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(saved));
    return newConversation;
  }

  // Get all saved conversations
  getSavedConversations(): SavedConversation[] {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading saved conversations:', error);
      return [];
    }
  }

  // Delete a saved conversation
  deleteConversation(id: number): void { // Use number instead of string
    const saved = this.getSavedConversations();
    const filtered = saved.filter(conv => conv.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  // Execute Python code via your backend API - Updated to use new endpoint
  async executePythonCode(request: PythonExecutionRequest): Promise<PythonExecutionResponse> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/execute_tool_result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: request.code })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        status: 'success',
        result: data.code_output,
        executionTime: 0 // Backend doesn't provide execution time
      };
    } catch (error) {
      console.error('Error executing Python code:', error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to execute code'
      };
    }
  }
}

export const conversationService = new ConversationService();
export type { PythonExecutionRequest, PythonExecutionResponse };
