
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

// New Content interface for the messages array
export interface Content {
  kind: 'user' | 'assistant' | 'tool_call' | 'tool_result' | 'code' | 'text';
  content: string;
  metadata?: Record<string, any>;
  timestamp?: string;
}

// Updated Example interface to match new backend structure
export interface Example {
  id: number;
  name: string;
  description?: string;
  messages: Content[];
  meta?: Record<string, any>;
  created_at: string;
  updated_at?: string;
}

// For creating new examples
export interface CreateExampleRequest {
  name: string;
  description?: string;
  messages: Content[];
  meta?: Record<string, any>;
}

// For updating existing examples
export interface UpdateExampleRequest extends Partial<CreateExampleRequest> {}

// Legacy interfaces for backward compatibility during transition
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
