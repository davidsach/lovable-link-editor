// =============================================================================
// CORE API TYPES
// =============================================================================

export interface ApiResponse<T = any> {
  status: string;
  data?: T;
  message?: string;
  error?: string;
}

// =============================================================================
// ROLE AND CHUNK KIND ENUMS (MATCH BACKEND)
// =============================================================================

export enum Role {
  SYSTEM = 1,
  USER = 2,
  ASSISTANT = 3,
}

export enum ChunkKind {
  UNKNOWN_KIND = 0,
  CONTENT = 1,
  TOOL_CALL = 2,
  TOOL_RESULT = 3,
  FORMATTING = 4,
}

// =============================================================================
// CONTENT AND MESSAGE TYPES (NEW STRUCTURE)
// =============================================================================

/**
 * Single chunk of a message (matches backend Chunk model)
 */
export interface Chunk {
  text?: string;
  // Add other media fields if needed (image, audio, video, file, control, etc.)
  kind: ChunkKind;
  role: Role;
  metadata?: Record<string, any>;
  mimetype?: string;
  channel?: string;
  trainable?: number;
  timestamp?: string;
}

/**
 * Content object for the new messages structure
 * Each message is a list of chunks
 */
export interface Content {
  chunks: Chunk[];
}

// =============================================================================
// EXAMPLE TYPES (NEW STRUCTURE)
// =============================================================================

/**
 * Complete Example Definition (New Structure)
 */
export interface Example {
  id: number;
  name: string;
  description?: string;
  messages: Content[]; // List of Content objects, each with .chunks
  meta?: {
    tags?: string[];
    created_by?: string;
    source?: string;
    [key: string]: any;
  };
  created_at: string;
  updated_at?: string;
}

/**
 * Request to Create New Example
 */
export interface CreateExampleRequest {
  name: string;
  description?: string;
  messages: Content[];
  meta?: Record<string, any>;
}

/**
 * Request to Update Existing Example
 */
export interface UpdateExampleRequest extends Partial<CreateExampleRequest> {}

// =============================================================================
// TOOL CALL AND TOOL TYPES
// =============================================================================

export interface ToolCall {
  id: string;
  toolName: string;
  parameters: Record<string, any>;
  result: any;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  timestamp?: Date;
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

// =============================================================================
// CONVERSATION STATE (FOR FRONTEND STATE MANAGEMENT)
// =============================================================================

export interface ConversationState {
  id: string | number;
  name: string;
  description?: string;
  messages: Content[];
  meta: {
    tags: string[];
    created_by?: string;
    source?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// LEGACY INTERFACES (for backward compatibility)
// =============================================================================

export interface DatabaseExample extends Example {}
export interface TrainingExample extends Example {}
export interface SavedConversation extends Example {}
