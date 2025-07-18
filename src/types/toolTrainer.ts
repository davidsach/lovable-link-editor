/**
 * Type Definitions for Tool Trainer Application
 * 
 * This file contains all the TypeScript interfaces and types used throughout
 * the LLM Tool Training Platform. It defines the structure for conversations,
 * tool calls, examples, and API responses.
 * 
 * Key Type Categories:
 * - Core API response types
 * - Role and ChunkKind enums (matching backend)
 * - Content and message structure (chunk-based architecture)
 * - Example and conversation types
 * - Tool call and tool schema types
 * 
 * Architecture Notes:
 * - Messages are composed of chunks (text, tool calls, tool results, etc.)
 * - Each chunk has a kind, role, and optional metadata
 * - Examples contain arrays of Content objects (each with chunks)
 * - Tool calls are tracked separately from conversation messages
 * 
 * @fileoverview Type definitions for the Tool Trainer application
 */

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

/**
 * Represents a tool call instance with execution state and results
 * Used for managing tool calls in the frontend state (separate from conversation chunks)
 */
export interface ToolCall {
  /** Unique identifier for this tool call */
  id: string;
  /** Name of the tool being called */
  toolName: string;
  /** Parameters passed to the tool */
  parameters: Record<string, any>;
  /** Result returned from tool execution */
  result: any;
  /** Current execution status */
  status: 'pending' | 'executing' | 'completed' | 'failed';
  /** When this tool call was created */
  timestamp?: Date;
}

/**
 * Represents a tool definition with its schema and parameters
 * Used for tool selection and parameter validation in the UI
 */
export interface Tool {
  /** Technical name of the tool */
  tool_name: string;
  /** Human-readable name */
  name?: string;
  /** Description of what the tool does */
  description?: string;
  /** Array of functions this tool provides */
  functions?: Array<{
    /** Function name */
    func_name: string;
    /** Function parameters */
    params: Array<{
      /** Parameter name */
      param_name: string;
      /** Parameter type (string, number, boolean, etc.) */
      param_type: string;
      /** Whether this parameter is required */
      is_required: boolean;
      /** Default value for the parameter */
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
