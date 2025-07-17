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
  TEXT = 1,
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
  file?: any;
  text?: string;
  audio?: any;
  image?: any;
  video?: any;
  channel?: string;
  control?: any;
  kind: ChunkKind;
  role: Role;
  metadata?: ChunkMetadata;
  mimetype?: string;
  json_data?: any;
  trainable?: Trainable;
  timestamp?: string;
}

export interface ChunkMetadata {
  tool?: any;
  safety?: any;
  finish_reason?: any;
}

export enum Trainable {
  EXCLUDE = 0,
  INCLUDE = 2,
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
  tool_name: string;
  parameters: Record<string, any>;
  python_code?: string;
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
