
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
  timestamp?: Date;
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

// New Content interface for message chunks
export interface Content {
  kind: 'user' | 'assistant' | 'tool_call' | 'tool_result' | 'code' | 'text';
  content: string | Record<string, any>;
  tool_name?: string;
  parameters?: Record<string, any>;
  result?: any;
  timestamp?: string;
}

// Updated Example interface to match new backend structure
export interface Example {
  id: number;
  name: string;
  description?: string;
  messages: Content[];
  meta?: {
    tags?: string[];
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

// For creating new examples
export interface CreateExampleRequest {
  name: string;
  description?: string;
  messages: Content[];
  meta?: {
    tags?: string[];
    [key: string]: any;
  };
}

// For updating existing examples
export interface UpdateExampleRequest extends Partial<CreateExampleRequest> {}

// Legacy interfaces for backward compatibility (deprecated)
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
