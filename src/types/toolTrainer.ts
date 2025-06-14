
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
  title: string;
  messages: Message[];
  toolCalls: ToolCall[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Tool {
  name: string;
  description: string;
}

export interface TrainingExample {
  id: number;
  name: string;
  description: string;
  messages: Message[];
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
  messages: Message[];
  created_at: string;
}
