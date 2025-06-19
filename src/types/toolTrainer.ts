
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
  userQuery: string;              // The user's input/question
  assistantResponse: string;      // The assistant's tool call/code
  toolCalls: ToolCall[];          // Array of tool call objects
  tags: string[];                 // Optional: array of tags
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

export interface TrainingExample {
  id: number;
  name: string;
  description: string;
  userQuery: string;
  assistantResponse: string;
  toolCalls: ToolCall[];
  metadata: {
    created_at: string;
    updated_at: string;
    tags: string[];
  };
}

export interface SavedConversation {
  id: string;
  name: string;
  description: string;
  userQuery: string;
  assistantResponse: string;
  toolCalls: ToolCall[];
  tags: string[];
  created_at: string;
}