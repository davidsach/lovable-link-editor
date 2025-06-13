
interface SavedConversation {
  id: string;
  name: string;
  description: string;
  messages: any[];
  createdAt: string;
  updatedAt: string;
}

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
  private readonly API_BASE_URL = 'YOUR_BACKEND_API_URL'; // Replace with your actual API URL

  // Save conversation locally
  saveConversation(conversation: Omit<SavedConversation, 'id' | 'createdAt' | 'updatedAt'>): SavedConversation {
    const saved = this.getSavedConversations();
    const newConversation: SavedConversation = {
      ...conversation,
      id: `conv_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
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
  deleteConversation(id: string): void {
    const saved = this.getSavedConversations();
    const filtered = saved.filter(conv => conv.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  // Execute Python code via your backend API
  async executePythonCode(request: PythonExecutionRequest): Promise<PythonExecutionResponse> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/execute-python`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
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
export type { SavedConversation, PythonExecutionRequest, PythonExecutionResponse };
