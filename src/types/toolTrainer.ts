
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ToolCall {
  id: string;
  toolName: string;
  parameters: Record<string, any>;
  result: any;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  timestamp: Date;
}

export interface ConversationState {
  id: string;
  userQuery: string;
  assistantResponse: string;
  toolCalls: ToolCall[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Tool {
  tool_name: string;
  name?: string;
  description?: string;
  functions?: Array<{
    func_name: string;
    params: Array<{
      param_name: string;
      param_type: string;
      is_required: boolean;
      default_value: string;
    }>;
  }>;
}

// Updated to match your database schema exactly
export interface TrainingExample {
  id: number;
  name?: string;
  description?: string;
  user_query: string;
  assistant_response: string;
  tool_calls: ToolCall[];
  metadata: {
    created_at: string;
    updated_at: string;
    tags: string[];
  };
}

// Unified SavedConversation interface to match database schema
export interface SavedConversation {
  id: number;
  name?: string;
  description?: string;
  user_query: string;
  assistant_response: string;
  tool_calls: ToolCall[];
  tags: string[];
  created_at: string;
  updated_at?: string;
}

// For database operations - matches your exact schema
export interface DatabaseExample {
  id?: number;
  name?: string;
  description?: string;
  user_query: string;
  assistant_response: string;
  tool_calls: any[];
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}
