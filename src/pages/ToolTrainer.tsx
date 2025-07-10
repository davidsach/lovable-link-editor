import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  FileText,
  Upload,
  Sparkles,
  User,
  AlertTriangle,
  Code,
  Play,
  ArrowLeft,
  Save,
  Calendar,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Bot,
  Settings,
  Loader2,
  CheckCircle,
  PlayCircle,
  Trash2,
  Zap,
  MessageSquare,
  Clock,
  Undo,
  RefreshCw,
  Download,
} from "lucide-react";
import {
  useTools,
  useExecuteToolResult,
  useExecuteAllTools,
} from "@/hooks/useApi";
import {
  Tool,
  ConversationState,
  Content,
  Chunk,
  Role,
  ChunkKind,
} from "@/types/toolTrainer";

import { SavedConversations } from "@/components/ToolTrainer/SavedConversations";
import { SaveToDatabase } from "@/components/ToolTrainer/SaveToDatabase";
import { RetrieveExample } from "@/components/ToolTrainer/RetrieveExample";
import { EditExample } from "@/components/ToolTrainer/EditExample";

// Mock tools data - This will be replaced with real API data
const mockTools: Tool[] = [
  {
    tool_name: "contact_api_tool",
    description: "Contact API tool for managing contacts",
    functions: [
      {
        func_name: "get_contact",
        params: [
          {
            param_name: "name",
            param_type: "string",
            is_required: true,
            default_value: "",
          },
        ],
      },
    ],
  },
  {
    tool_name: "drive_api_tool",
    description: "Drive API tool for file operations",
    functions: [
      {
        func_name: "upload_file",
        params: [
          {
            param_name: "file_path",
            param_type: "string",
            is_required: true,
            default_value: "",
          },
          {
            param_name: "folder_id",
            param_type: "string",
            is_required: false,
            default_value: "",
          },
        ],
      },
    ],
  },
  {
    tool_name: "calendar_api_tool",
    description: "Calendar API tool for event management",
    functions: [
      {
        func_name: "create_event",
        params: [
          {
            param_name: "title",
            param_type: "string",
            is_required: true,
            default_value: "",
          },
          {
            param_name: "start_time",
            param_type: "string",
            is_required: true,
            default_value: "",
          },
          {
            param_name: "end_time",
            param_type: "string",
            is_required: true,
            default_value: "",
          },
        ],
      },
    ],
  },
  {
    tool_name: "weather_tool",
    description: "Weather tool for getting weather information",
    functions: [
      {
        func_name: "get_weather",
        params: [
          {
            param_name: "location",
            param_type: "string",
            is_required: true,
            default_value: "",
          },
        ],
      },
    ],
  },
  {
    tool_name: "email_api_tool",
    description: "Email API tool for sending and managing emails",
    functions: [
      {
        func_name: "send_email",
        params: [
          {
            param_name: "to",
            param_type: "string",
            is_required: true,
            default_value: "",
          },
          {
            param_name: "subject",
            param_type: "string",
            is_required: true,
            default_value: "",
          },
          {
            param_name: "body",
            param_type: "string",
            is_required: true,
            default_value: "",
          },
          {
            param_name: "cc",
            param_type: "string",
            is_required: false,
            default_value: "",
          },
        ],
      },
    ],
  },
];

interface ToolCall {
  id: string;
  toolName: string;
  parameters: Record<string, any>;
  pythonCode: string;
  result: string;
  status: "pending" | "executing" | "completed" | "failed";
}

function syncToolResultsWithMessages(messages, toolCalls) {
  return messages.map((msg) => ({
    ...msg,
    chunks: msg.chunks.map((chunk) => {
      if (chunk.kind === ChunkKind.TOOL_RESULT && chunk.metadata?.tool_id) {
        const tc = toolCalls.find((tc) => tc.id === chunk.metadata.tool_id);
        if (tc) {
          return { ...chunk, text: tc.result };
        }
      }
      return chunk;
    }),
  }));
}

const ToolTrainer = () => {
  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================

  // Form fields
  const [exampleName, setExampleName] = useState("Example 1");
  const [description, setDescription] = useState("");
  //  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  // Core conversation state
  const [conversation, setConversation] = useState<ConversationState>({
    id: "1",
    name: exampleName,
    description: description,
    messages: [],
    meta: {
      tags: [],
      created_by: "user",
      source: "tool_trainer",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // UI state
  const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>(
    {}
  );
  const [showTextChunkInput, setShowTextChunkInput] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [showAllResults, setShowAllResults] = useState(false);
  const [showToolEditor, setShowToolEditor] = useState(false);
  const [editingConversation, setEditingConversation] = useState(false);

  // Turn management
  const [currentStep, setCurrentStep] = useState<"user" | "assistant">("user");
  const [hasAddedTextChunk, setHasAddedTextChunk] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);

  // Tool calls
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);

  // Navigation
  const [currentExampleId, setCurrentExampleId] = useState(1);

  // History for step-wise back functionality
  const [conversationHistory, setConversationHistory] = useState<
    {
      messages: Content[];
      meta: { tags: string[]; created_by?: string; source?: string };
      step: "user" | "assistant";
    }[]
  >([]);

  useEffect(() => {
    setConversation((prev) => ({
      ...prev,
      name: exampleName,
      description: description,
    }));
  }, [exampleName, description]);

  // Update conversation timestamps when content changes
  useEffect(() => {
    if (conversation.messages.length > 0) {
      setConversation((prev) => ({
        ...prev,
        updatedAt: new Date(),
      }));
    }
  }, [conversation.messages]);

  // ✅ ADDED: Helper functions for creating chunks
  const createContentChunk = (
    text: string,
    kind: ChunkKind,
    role: Role,
    metadata: Record<string, any> = {}
  ): Chunk => ({
    text,
    kind,
    role,
    metadata,
    timestamp: new Date().toISOString(),
  });

  const createContentMessage = (chunks: Chunk[]): Content => ({
    chunks,
  });

  // ✅ ADDED: Tag management functions

  // =============================================================================
  // API HOOKS
  // =============================================================================

  const {
    data: tools,
    isLoading: toolsLoading,
    error: toolsError,
    refetch: refetchTools,
  } = useTools();
  const executeToolMutation = useExecuteToolResult();
  const executeAllToolsMutation = useExecuteAllTools();
  const isConnected = !toolsError;
  const availableTools = tools || mockTools;

  // =============================================================================
  // UI HELPER FUNCTIONS
  // =============================================================================

  const toggleToolExpansion = (toolName: string) => {
    setExpandedTools((prev) => ({
      ...prev,
      [toolName]: !prev[toolName],
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !conversation.meta.tags.includes(newTag.trim())) {
      setConversation((prev) => ({
        ...prev,
        meta: {
          ...prev.meta,
          tags: [...prev.meta.tags, newTag.trim()],
        },
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setConversation((prev) => ({
      ...prev,
      meta: {
        ...prev.meta,
        tags: prev.meta.tags.filter((tag) => tag !== tagToRemove),
      },
    }));
  };

  // Helper function to generate Python function signature in one line
  const generateCompactPythonSignature = (toolName: string, func: any) => {
    const params = func.params
      .map((param: any) => {
        const paramStr = `${param.param_name}`;
        if (!param.is_required && param.default_value) {
          return `${paramStr}="${param.default_value}"`;
        }
        return paramStr;
      })
      .join(", ");

    return `${toolName}.${func.func_name}(${params})`;
  };

  // Helper function to generate Python function signature
  const generatePythonSignature = (toolName: string, func: any) => {
    const params = func.params
      .map((param: any) => {
        const paramStr = `${param.param_name}`;
        if (!param.is_required && param.default_value) {
          return `${paramStr}="${param.default_value}"`;
        }
        return paramStr;
      })
      .join(", ");

    return `${toolName}.${func.func_name}(${params})`;
  };

  // Copy function signature to clipboard
  const copySignatureToClipboard = async (signature: string) => {
    try {
      await navigator.clipboard.writeText(`print(${signature})`);
      // Could add a toast notification here if needed
    } catch (err) {
      console.error("Failed to copy signature:", err);
    }
  };

  // Handler for editing tool results in the summary area
  const handleEditToolResult = (result, newText) => {
    setConversation((prev) => {
      const newMessages = prev.messages.map((msg) => ({
        ...msg,
        chunks: msg.chunks.map((chunk) => {
          if (
            chunk.kind === ChunkKind.TOOL_RESULT &&
            chunk.metadata?.tool_id === result.metadata?.tool_id
          ) {
            return { ...chunk, text: newText };
          }
          return chunk;
        }),
      }));
      return {
        ...prev,
        messages: newMessages,
        updatedAt: new Date(),
      };
    });
  };

  const handleEditChunkText = (msgIdx, chunkIdx, newText) => {
    setConversation((prev) => {
      const newMessages = [...prev.messages];
      const message = { ...newMessages[msgIdx] };
      const chunks = [...message.chunks];
      const chunk = { ...chunks[chunkIdx] };
      chunk.text = newText;
      chunks[chunkIdx] = chunk;
      message.chunks = chunks;
      newMessages[msgIdx] = message;
      return {
        ...prev,
        messages: newMessages,
        updatedAt: new Date(),
      };
    });
  };

  // index: the index of the toolCall in toolCalls array
  // newResult: the new edited tool result string
  const handleToolResultEdit = (index, newResult) => {
    // 1. Update toolCalls array as before
    updateToolCall(index, { result: newResult });

    // 2. Also sync the edit into conversation.messages
    setConversation((prev) => {
      const toolCallId = toolCalls[index].id; // or use another unique identifier
      const newMessages = prev.messages.map((msg) => ({
        ...msg,
        chunks: msg.chunks.map((chunk) => {
          if (
            chunk.kind === ChunkKind.TOOL_RESULT &&
            chunk.metadata?.tool_id === toolCallId
          ) {
            return { ...chunk, text: newResult };
          }
          return chunk;
        }),
      }));
      return { ...prev, messages: newMessages, updatedAt: new Date() };
    });
  };

  // Handle getting all tools from backend
  const handleGetAllTools = async () => {
    try {
      await refetchTools();
    } catch (error) {
      console.error("Failed to fetch tools:", error);
    }
  };

  // Add new event handler for retrieved examples
  const handleExampleRetrieved = (example: any) => {
    setConversation((prev) => ({
      ...prev,
      id: example.id,
      name: example.name,
      description: example.description || "",
      messages: example.messages || [],
      meta: example.meta || { tags: [] },
    }));
    setExampleName(example.name);
    setDescription(example.description || "");
    setConversationStarted((example.messages?.length ?? 0) > 0);

    // Reset current state
    setCurrentStep("user");
    setShowTextChunkInput(false);
    setMessageContent("");
    setHasAddedTextChunk(false);

    console.log("Example loaded successfully:", example);
  };

  // Add new event handler for updated examples
  const handleExampleUpdated = (updatedExample: any) => {
    setExampleName(updatedExample.name);
    setDescription(updatedExample.description || "");
    setConversation((prev) => ({
      ...prev,
      name: updatedExample.name,
      description: updatedExample.description || prev.description,
      messages: updatedExample.messages || prev.messages,
      meta: updatedExample.meta || prev.meta,
    }));
    console.log("Example updated successfully:", updatedExample);
  };

  // =============================================================================
  // CONVERSATION MANAGEMENT
  // =============================================================================

  const saveCurrentState = () => {
    setConversationHistory((prev) => [
      ...prev,
      {
        messages: [...conversation.messages],
        meta: { ...conversation.meta },
        step: currentStep,
      },
    ]);
  };

  const addNewTurn = () => {
    // If no conversation started, start with user turn
    if (!conversationStarted) {
      setCurrentStep("user");
      setConversationStarted(true);
      return;
    }

    // Save current state before switching turns
    saveCurrentState();

    // Reset states for new turn
    setShowTextChunkInput(false);
    setMessageContent("");
    setHasAddedTextChunk(false);
    setToolCalls([]);

    // Switch to the opposite role
    setCurrentStep(currentStep === "user" ? "assistant" : "user");
  };

  const addTextChunk = () => {
    if (messageContent.trim()) {
      // Create a chunk with the new structure
      const newChunk: Chunk = {
        text: messageContent,
        kind: ChunkKind.CONTENT,
        role: currentStep === "user" ? Role.USER : Role.ASSISTANT,
        metadata: {},
        timestamp: new Date().toISOString(),
      };

      // Create a Content message containing the chunk
      const newMessage: Content = {
        chunks: [newChunk],
      };

      setConversation((prev) => ({
        ...prev,
        messages: [...prev.messages, newMessage],
        updatedAt: new Date(),
      }));

      if (!conversationStarted) {
        setConversationStarted(true);
      }

      setMessageContent("");
      setShowTextChunkInput(false);
      setHasAddedTextChunk(true);
    }
  };

  const showTextChunkEditor = () => {
    setShowTextChunkInput(true);
  };

  // =============================================================================
  // TOOL CALL MANAGEMENT
  // =============================================================================

  const addToolCall = () => {
    // Check if there's already an incomplete tool call
    const hasIncompleteToolCall = toolCalls.some(
      (tc) => !tc.toolName || !tc.pythonCode.trim() || tc.status === "pending"
    );

    if (hasIncompleteToolCall) {
      return; // Don't add a new tool call if there's already an incomplete one
    }

    const newToolCall: ToolCall = {
      id: `tool_${Date.now()}`,
      toolName: "",
      parameters: {},
      pythonCode: "",
      result: "",
      status: "pending",
    };

    setToolCalls([...toolCalls, newToolCall]);
    setShowToolEditor(true); // Show tool editor when adding a tool call
  };

  const updateToolCall = (index: number, updates: Partial<ToolCall>) => {
    setToolCalls((prev) =>
      prev.map((tc, i) => (i === index ? { ...tc, ...updates } : tc))
    );
  };

  const executeToolCall = async (index: number) => {
    const toolCall = toolCalls[index];
    if (!toolCall.pythonCode.trim()) return;

    updateToolCall(index, { status: "executing" });

    try {
      const result = await executeToolMutation.mutateAsync({
        code: toolCall.pythonCode,
      });

      const formattedResult =
        typeof result.code_output === "object"
          ? JSON.stringify(result.code_output, null, 2)
          : String(result.code_output);

      updateToolCall(index, { result: formattedResult, status: "completed" });

      // ✅ UPDATED: Create tool_call chunk
      const toolCallChunk: Chunk = {
        text: JSON.stringify({
          tool_name: toolCall.toolName,
          parameters: toolCall.parameters,
          python_code: toolCall.pythonCode,
        }),
        kind: ChunkKind.TOOL_CALL,
        role: Role.ASSISTANT,
        metadata: {
          tool_id: toolCall.id,
          status: "completed",
        },
        timestamp: new Date().toISOString(),
      };

      // ✅ UPDATED: Create tool_result chunk
      const toolResultChunk: Chunk = {
        text: formattedResult,
        kind: ChunkKind.TOOL_RESULT,
        role: Role.ASSISTANT,
        metadata: {
          tool_id: toolCall.id,
          status: "completed",
        },
        timestamp: new Date().toISOString(),
      };

      // ✅ UPDATED: Add both chunks as separate Content messages
      setConversation((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          { chunks: [toolCallChunk] },
          { chunks: [toolResultChunk] },
        ],
        updatedAt: new Date(),
      }));

      // Hide tool editor after successful execution
      setShowToolEditor(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Execution failed";
      updateToolCall(index, {
        result: `Error: ${errorMessage}`,
        status: "failed",
      });

      // ✅ UPDATED: Create error tool_call chunk
      const toolCallChunk: Chunk = {
        text: JSON.stringify({
          tool_name: toolCall.toolName,
          parameters: toolCall.parameters,
          python_code: toolCall.pythonCode,
        }),
        kind: ChunkKind.TOOL_CALL,
        role: Role.ASSISTANT,
        metadata: {
          tool_id: toolCall.id,
          status: "failed",
        },
        timestamp: new Date().toISOString(),
      };

      // ✅ UPDATED: Create error tool_result chunk
      const toolResultChunk: Chunk = {
        text: `Error: ${errorMessage}`,
        kind: ChunkKind.TOOL_RESULT,
        role: Role.ASSISTANT,
        metadata: {
          tool_id: toolCall.id,
          status: "failed",
        },
        timestamp: new Date().toISOString(),
      };

      // ✅ UPDATED: Add error chunks as separate Content messages
      setConversation((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          { chunks: [toolCallChunk] },
          { chunks: [toolResultChunk] },
        ],
        updatedAt: new Date(),
      }));

      // Hide tool editor after failed execution
      setShowToolEditor(false);
    }
  };

  const executeAllToolCalls = async () => {
    // Filter tool calls that have code
    const toolCallsWithCode = toolCalls.filter((tc) => tc.pythonCode.trim());

    if (toolCallsWithCode.length === 0) {
      return;
    }

    // Set all tool calls to executing status
    toolCallsWithCode.forEach((toolCall, index) => {
      const originalIndex = toolCalls.findIndex((tc) => tc.id === toolCall.id);
      updateToolCall(originalIndex, { status: "executing" });
    });

    try {
      // Prepare code chunks for API call
      const codeChunks = toolCallsWithCode.map((toolCall, index) => ({
        chunk_id: index,
        code: toolCall.pythonCode,
      }));

      // Call the API
      const result = await executeAllToolsMutation.mutateAsync({
        code_chunks: codeChunks,
      });

      result.code_chunk_output.forEach((output) => {
        const toolCall = toolCallsWithCode[output.chunk_id];
        const originalIndex = toolCalls.findIndex(
          (tc) => tc.id === toolCall.id
        );

        const formattedResult =
          typeof output.code_output === "object"
            ? JSON.stringify(output.code_output, null, 2)
            : String(output.code_output);

        updateToolCall(originalIndex, {
          result: formattedResult,
          status: "completed",
        });

        // ✅ Add tool_call and tool_result as Content messages with proper Chunk structure
        const toolCallChunk: Chunk = {
          text: JSON.stringify({
            tool_name: toolCall.toolName,
            parameters: toolCall.parameters,
            python_code: toolCall.pythonCode,
          }),
          kind: ChunkKind.TOOL_CALL,
          role: Role.ASSISTANT,
          metadata: {
            tool_id: toolCall.id,
            status: "completed",
          },
          timestamp: new Date().toISOString(),
        };

        const toolResultChunk: Chunk = {
          text: formattedResult,
          kind: ChunkKind.TOOL_RESULT,
          role: Role.ASSISTANT,
          metadata: {
            tool_id: toolCall.id,
            status: "completed",
          },
          timestamp: new Date().toISOString(),
        };

        setConversation((prev) => ({
          ...prev,
          messages: [
            ...prev.messages,
            { chunks: [toolCallChunk] },
            { chunks: [toolResultChunk] },
          ],
          updatedAt: new Date(),
        }));
      });

      // Hide tool editor and show results in conversation area after execution
      setShowToolEditor(false);
    } catch (error) {
      // Set all executing tool calls to failed status
      toolCallsWithCode.forEach((toolCall) => {
        const originalIndex = toolCalls.findIndex(
          (tc) => tc.id === toolCall.id
        );
        const errorMessage =
          error instanceof Error ? error.message : "Execution failed";
        updateToolCall(originalIndex, {
          result: `Error: ${errorMessage}`,
          status: "failed",
        });

        // Add failed tool_call and tool_result as Content messages
        const toolCallChunk: Chunk = {
          text: JSON.stringify({
            tool_name: toolCall.toolName,
            parameters: toolCall.parameters,
            python_code: toolCall.pythonCode,
          }),
          kind: ChunkKind.TOOL_CALL,
          role: Role.ASSISTANT,
          metadata: {
            tool_id: toolCall.id,
            status: "failed",
          },
          timestamp: new Date().toISOString(),
        };

        const toolResultChunk: Chunk = {
          text: `Error: ${errorMessage}`,
          kind: ChunkKind.TOOL_RESULT,
          role: Role.ASSISTANT,
          metadata: {
            tool_id: toolCall.id,
            status: "failed",
          },
          timestamp: new Date().toISOString(),
        };

        setConversation((prev) => ({
          ...prev,
          messages: [
            ...prev.messages,
            { chunks: [toolCallChunk] },
            { chunks: [toolResultChunk] },
          ],
          updatedAt: new Date(),
        }));
      });
    }
  };

  const removeToolCall = (index: number) => {
    setToolCalls((prev) => prev.filter((_, i) => i !== index));
    // Hide tool editor if no tool calls remain
    if (toolCalls.length <= 1) {
      setShowToolEditor(false);
    }
  };

  // =============================================================================
  // NAVIGATION
  // =============================================================================

  const navigatePrevious = () => {
    if (currentExampleId > 1) {
      setCurrentExampleId(currentExampleId - 1);
    }
  };

  const navigateNext = () => {
    setCurrentExampleId(currentExampleId + 1);
  };

  const canGoBackStep = () => {
    return conversation.messages.length > 0;
  };

  const goBackStep = () => {
    setConversation((prev) => {
      // Remove only the most recent chunk (last message)
      const newMessages = prev.messages.slice(0, -1);
      return {
        ...prev,
        messages: newMessages,
      };
    });

    // Optionally update other UI states as needed
    setShowTextChunkInput(false);
    setMessageContent("");
    setHasAddedTextChunk(false);
  };

  // =============================================================================
  // VALIDATION FUNCTIONS
  // =============================================================================

  const canStartNewTurn = () => {
    // If conversation hasn't started, can always start new turn
    if (!conversationStarted) return true;

    if (currentStep === "user") {
      // User can start new turn if they have added a text chunk
      return hasAddedTextChunk;
    } else {
      // Assistant can start new turn if they have added text chunk OR tool calls
      return hasAddedTextChunk || toolCalls.length > 0;
    }
  };

  const canAddTextChunk = () => {
    if (currentStep === "user") {
      // User can only add one text chunk per turn
      return !hasAddedTextChunk;
    }
    // Assistant can add multiple text chunks
    return true;
  };

  const canAddToolCall = () => {
    if (currentStep !== "assistant") return false;

    // Check if there's already an incomplete tool call
    const hasIncompleteToolCall = toolCalls.some(
      (tc) => !tc.toolName || !tc.pythonCode.trim() || tc.status === "pending"
    );

    return !hasIncompleteToolCall;
  };

  const getExecutableToolCallsCount = () => {
    return toolCalls.filter(
      (tc) =>
        tc.pythonCode.trim() &&
        tc.status !== "completed" &&
        tc.status !== "executing"
    ).length;
  };

  const getExecutingToolCallsCount = () => {
    return toolCalls.filter((tc) => tc.status === "executing").length;
  };

  const getToolCallsWithCodeCount = () => {
    return toolCalls.filter((tc) => tc.pythonCode.trim()).length;
  };

  const canExecuteAllToolCalls = () => {
    return (
      toolCalls.some((tc) => tc.pythonCode.trim()) &&
      !executeAllToolsMutation.isPending
    );
  };

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleSaveConversation = () => {
    // TODO: Implement actual save functionality with backend
    // You would send conversation.messages (Content[]), which is now in the correct structure
    console.log("Conversation saved successfully");
  };

  const handleLoadConversation = (savedConversation: any) => {
    setConversation({
      id: savedConversation.id,
      name: savedConversation.name,
      description: savedConversation.description || "",
      messages: savedConversation.messages || [], // Content[]
      meta: savedConversation.meta || { tags: [] },
      createdAt: new Date(savedConversation.created_at),
      updatedAt: new Date(
        savedConversation.updated_at || savedConversation.created_at
      ),
    });
    setExampleName(savedConversation.name);
    setDescription(savedConversation.description || "");
    setConversationStarted((savedConversation.messages?.length ?? 0) > 0);
  };

  // For All Results section: Pair tool_call and tool_result chunks
  const toolCallPairs = React.useMemo(() => {
    // Flatten all chunks from all messages
    const allChunks = conversation.messages.flatMap((m) => m.chunks);

    const calls = allChunks.filter(
      (chunk) => chunk.kind === ChunkKind.TOOL_CALL
    );
    const results = allChunks.filter(
      (chunk) => chunk.kind === ChunkKind.TOOL_RESULT
    );

    return calls.map((call) => ({
      call,
      result: results.find(
        (res) => res.metadata?.tool_id === call.metadata?.tool_id
      ),
    }));
  }, [conversation.messages]);

  // Handler for executing edited conversation
  const handleExecuteEditedConversation = async () => {
    // Get all tool calls from the conversation messages
    const allChunks = conversation.messages.flatMap((m) => m.chunks);
    const toolCallChunks = allChunks.filter(
      (chunk) => chunk.kind === ChunkKind.TOOL_CALL
    );
    
    // Re-execute all tool calls
    for (const toolCallChunk of toolCallChunks) {
      try {
        const toolData = JSON.parse(toolCallChunk.text);
        const result = await executeToolMutation.mutateAsync({
          code: toolData.python_code,
        });

        const formattedResult =
          typeof result.code_output === "object"
            ? JSON.stringify(result.code_output, null, 2)
            : String(result.code_output);

        // Update the corresponding result chunk
        setConversation((prev) => ({
          ...prev,
          messages: prev.messages.map((msg) => ({
            ...msg,
            chunks: msg.chunks.map((chunk) => {
              if (
                chunk.kind === ChunkKind.TOOL_RESULT &&
                chunk.metadata?.tool_id === toolCallChunk.metadata?.tool_id
              ) {
                return { ...chunk, text: formattedResult };
              }
              return chunk;
            }),
          })),
          updatedAt: new Date(),
        }));
      } catch (error) {
        console.error("Failed to execute tool call:", error);
      }
    }
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white flex">
      {/* Left Sidebar - Available Tools */}
      <div className="w-80 bg-gray-800/90 backdrop-blur border-r border-gray-700/50 flex flex-col shadow-2xl">
        <div className="p-4 border-b border-gray-700/50 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-blue-300 flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Available Tools
            </h2>
            <Badge
              variant="outline"
              className="border-blue-400/50 text-blue-300"
            >
              {availableTools.length}
            </Badge>
          </div>

          {/* Get All Tools Button */}
          <Button
            onClick={handleGetAllTools}
            disabled={toolsLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all duration-200 border-0"
          >
            {toolsLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Get All Tools
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {availableTools.map((tool) => (
              <div
                key={tool.tool_name}
                className="bg-gradient-to-r from-gray-700/80 to-gray-600/80 rounded-lg border border-gray-600/50 hover:border-blue-500/50 transition-all duration-200 shadow-lg"
              >
                <div
                  className="p-3 cursor-pointer flex items-center justify-between hover:bg-gray-600/50 rounded-lg transition-colors"
                  onClick={() => toggleToolExpansion(tool.tool_name)}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                      <Code className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-blue-300 font-medium">
                      {tool.tool_name}
                    </span>
                  </div>
                  {expandedTools[tool.tool_name] ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </div>

                {/* Function Signatures - Always visible */}
                <div className="px-3 pb-2">
                  <div className="space-y-1">
                    {tool.functions?.map((func) => (
                      <div key={func.func_name} className="text-xs">
                        <code className="text-green-300 font-mono bg-gray-800/50 px-2 py-1 rounded border border-gray-700/30 block">
                          {generateCompactPythonSignature(tool.tool_name, func)}
                        </code>
                      </div>
                    ))}
                  </div>
                </div>

                {expandedTools[tool.tool_name] && (
                  <div className="px-3 pb-3">
                    <div className="text-xs text-gray-400 mb-2 flex items-center">
                      <Settings className="w-3 h-3 mr-1" />
                      Function Details
                    </div>
                    {tool.functions?.map((func) => (
                      <div
                        key={func.func_name}
                        className="bg-gray-600/60 rounded-lg p-3 mb-2 border border-gray-500/30"
                      >
                        <div className="text-sm font-medium text-white mb-2 flex items-center justify-between">
                          <div className="flex items-center">
                            <Zap className="w-3 h-3 mr-1 text-yellow-400" />
                            {func.func_name}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs text-blue-300 hover:text-blue-200 hover:bg-blue-500/20 bg-transparent border-0"
                            onClick={() =>
                              copySignatureToClipboard(
                                generatePythonSignature(tool.tool_name, func)
                              )
                            }
                          >
                            Copy
                          </Button>
                        </div>

                        {/* Python Function Signature */}
                        <div className="bg-gray-800/80 rounded p-2 mb-2 border border-gray-700/50">
                          <div className="text-xs text-gray-400 mb-1">
                            Python signature:
                          </div>
                          <code className="text-xs text-green-300 font-mono break-all">
                            print(
                            {generatePythonSignature(tool.tool_name, func)})
                          </code>
                        </div>

                        {/* Parameters */}
                        <div className="space-y-1">
                          <div className="text-xs text-gray-400 mb-1">
                            Parameters:
                          </div>
                          {func.params.map((param) => (
                            <div
                              key={param.param_name}
                              className="text-xs text-gray-300 flex items-center justify-between bg-gray-700/50 px-2 py-1 rounded"
                            >
                              <span className="font-mono">
                                {param.param_name}: {param.param_type}
                                {param.default_value &&
                                  ` = "${param.default_value}"`}
                              </span>
                              <div className="flex items-center gap-1">
                                {param.is_required && (
                                  <Badge
                                    variant="destructive"
                                    className="text-xs px-1 py-0 bg-red-500/20 text-red-300 border-red-400/50"
                                  >
                                    required
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <div className="p-4 border-b border-gray-700/50 bg-gray-800/90 backdrop-blur shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                onClick={navigatePrevious}
                disabled={currentExampleId <= 1}
                variant="outline"
                size="sm"
                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-blue-500/20 text-blue-300 border-blue-400/50"
                >
                  Example ID: {currentExampleId}
                </Badge>
              </div>
              <Button
                onClick={navigateNext}
                variant="outline"
                size="sm"
                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:border-blue-400 font-medium"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="flex items-center gap-3">
              {/* Saved Conversations Button */}
              <SavedConversations onLoadConversation={handleLoadConversation} />
            </div>
          </div>
        </div>

        {/* Training Example Header - Made more compact */}
        <div className="p-4 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/90 to-gray-700/90 backdrop-blur">
          <Card className="bg-gradient-to-r from-gray-700/80 to-gray-600/80 border-gray-600/50 shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-lg text-white">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center mr-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                  </div>
                  Training Example
                </CardTitle>
                <div className="flex items-center gap-3">
                  {currentStep === "user" ? (
                    <div className="flex items-center gap-2 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-400/50">
                      <User className="w-4 h-4 text-blue-400" />
                      <span className="font-medium text-blue-300 text-sm">
                        User Turn
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full border border-green-400/50">
                      <Bot className="w-4 h-4 text-green-400" />
                      <span className="font-medium text-green-300 text-sm">
                        Assistant Turn
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-0">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-300">
                    Example Name
                  </label>
                  <Input
                    value={conversation.name}
                    onChange={(e) =>
                      setConversation((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Enter example name..."
                    className="bg-gray-600/80 border-gray-500/50 text-white placeholder:text-gray-400 focus:border-blue-400/50 transition-colors h-8"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-300">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-1 items-center">
                    {(conversation.meta?.tags || []).map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="..."
                        onClick={() => removeTag(tag)}
                      >
                        {tag} ×
                      </Badge>
                    ))}
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          addTag();
                        }
                      }}
                      placeholder="Add tag..."
                      className="w-24 h-6 text-xs bg-gray-600/80 border-gray-500/50 text-white placeholder:text-gray-400 focus:border-blue-400/50 transition-colors"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">
                  Description
                </label>
                <Textarea
                  value={conversation.description}
                  onChange={(e) =>
                    setConversation((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe what this training example demonstrates..."
                  className="min-h-[50px] bg-gray-600/80 border-gray-500/50 text-white placeholder:text-gray-400 focus:border-blue-400/50 transition-colors"
                />
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <div className="flex items-center bg-gray-700/50 px-2 py-1 rounded-full">
                  <Calendar className="w-3 h-3 mr-1" />
                  Created: {conversation.createdAt.toLocaleDateString()}
                </div>
                <div className="flex items-center bg-gray-700/50 px-2 py-1 rounded-full">
                  <Clock className="w-3 h-3 mr-1" />
                  Updated: {conversation.updatedAt.toLocaleDateString()}
                </div>
                <Badge
                  variant="outline"
                  className="border-gray-500/50 text-gray-300 bg-gray-700/30 text-xs px-2 py-0"
                >
                  <MessageSquare className="w-3 h-3 mr-1" />
                  {conversation.messages.length} message
                  {conversation.messages.length !== 1 ? "s" : ""}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Main conversation area */}
        <div className="flex-1 flex flex-col bg-gradient-to-b from-gray-900/50 to-gray-800/50">
          {/* Current Step Indicator */}
          <div className="p-4 border-b border-gray-700/50 bg-gray-800/80 backdrop-blur">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
                  <Bot className="w-5 h-5 text-green-400" />
                </div>
                Conversation
              </h3>
              <div className="flex items-center gap-3">
                {currentStep === "user" ? (
                  <div className="flex items-center gap-2 bg-blue-500/20 px-4 py-2 rounded-full border border-blue-400/50">
                    <User className="w-5 h-5 text-blue-400" />
                    <span className="font-medium text-blue-300">User Turn</span>
                    <Badge
                      variant="outline"
                      className="bg-blue-600/30 text-blue-200 border-blue-400/50 ml-2"
                    >
                      Current
                    </Badge>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-full border border-green-400/50">
                    <Bot className="w-5 h-5 text-green-400" />
                    <span className="font-medium text-green-300">
                      Assistant Turn
                    </span>
                    <Badge
                      variant="outline"
                      className="bg-green-600/30 text-green-200 border-green-400/50 ml-2"
                    >
                      Current
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Conversation Messages with Execute Button */}
          <ScrollArea className="flex-1 p-6">
            {!conversation.messages || conversation.messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="w-12 h-12 text-gray-500" />
                  </div>
                  <p className="text-xl mb-3 text-gray-300">
                    Ready to start training
                  </p>
                  <p className="text-sm text-gray-500">
                    Click "New Turn" to begin the conversation
                  </p>
                  <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-blue-300 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Click "New Turn" to start the conversation
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Execute Button for edited conversation */}
                <div className="flex justify-center mb-6">
                  <Button
                    onClick={handleExecuteEditedConversation}
                    disabled={executeToolMutation.isPending}
                    className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-medium shadow-lg transition-all duration-200 px-8 h-12"
                  >
                    {executeToolMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    Execute Updated Conversation
                  </Button>
                </div>
              <div className="space-y-6">
                {conversation.messages.map((msg, msgIdx) =>
                  msg.chunks.map((chunk, chunkIdx) => {
                    // Helper to parse tool call content if needed
                    let toolCallData = null;
                    if (chunk.kind === ChunkKind.TOOL_CALL) {
                      try {
                        toolCallData = chunk.text
                          ? JSON.parse(chunk.text)
                          : null;
                      } catch {}
                    }

                    // Determine alignment and style
                    let align = "justify-start";
                    let bubbleStyle =
                      "bg-gradient-to-r from-gray-700 to-gray-600 text-white border border-gray-500/30";
                    if (chunk.role === Role.USER) {
                      align = "justify-end";
                      bubbleStyle =
                        "bg-gradient-to-r from-blue-600 to-blue-500 text-white";
                    } else if (chunk.role === Role.ASSISTANT) {
                      align = "justify-start";
                      bubbleStyle =
                        "bg-gradient-to-r from-gray-700 to-gray-600 text-white border border-gray-500/30";
                    }
                    if (chunk.kind === ChunkKind.TOOL_CALL) {
                      align = "justify-start";
                      bubbleStyle =
                        "bg-gradient-to-r from-green-700 to-green-600 text-white border border-green-500/30";
                    } else if (chunk.kind === ChunkKind.TOOL_RESULT) {
                      align = "justify-start";
                      bubbleStyle =
                        "bg-gradient-to-r from-orange-700 to-orange-600 text-white border border-orange-500/30";
                    }
                    // For code: use CONTENT kind + metadata.subtype === 'code'
                    else if (
                      chunk.kind === ChunkKind.CONTENT &&
                      chunk.metadata?.subtype === "code"
                    ) {
                      align = "justify-start";
                      bubbleStyle =
                        "bg-gradient-to-r from-gray-900 to-gray-800 text-green-400 border border-gray-700/30";
                    }

                    return (
                      <div
                        key={`${msgIdx}-${chunkIdx}`}
                        className={`flex ${align}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl p-4 shadow-lg ${bubbleStyle}`}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-black/20">
                              {chunk.role === Role.USER && (
                                <User className="w-4 h-4" />
                              )}
                              {chunk.role === Role.ASSISTANT && (
                                <Bot className="w-4 h-4" />
                              )}
                              {chunk.kind === ChunkKind.TOOL_CALL && (
                                <Settings className="w-4 h-4" />
                              )}
                              {chunk.kind === ChunkKind.TOOL_RESULT && (
                                <CheckCircle className="w-4 h-4" />
                              )}
                              {chunk.kind === ChunkKind.CONTENT &&
                                chunk.metadata?.subtype === "code" && (
                                  <Code className="w-4 h-4" />
                                )}
                              {chunk.kind === ChunkKind.CONTENT &&
                                !chunk.metadata?.subtype && (
                                  <MessageSquare className="w-4 h-4" />
                                )}
                            </div>
                            <span className="font-medium capitalize text-sm">
                              {/* Show kind as label */}
                              {chunk.kind === ChunkKind.CONTENT &&
                              chunk.metadata?.subtype === "code"
                                ? "code"
                                : ChunkKind[chunk.kind]
                                    ?.replace("_", " ")
                                    .toLowerCase()}
                            </span>
                            {chunk.timestamp && (
                              <span className="text-xs opacity-70 bg-black/20 px-2 py-1 rounded-full">
                                {new Date(chunk.timestamp).toLocaleTimeString()}
                              </span>
                            )}
                          </div>
                          {/* Message content */}
                          {chunk.kind === ChunkKind.TOOL_CALL ? (
                            // Editable TOOL_CALL (edit raw JSON or string)
                            <textarea
                              className="text-xs text-green-300 bg-gray-900/60 p-2 rounded border border-gray-700/50 font-mono overflow-x-auto w-full"
                              value={chunk.text}
                              onChange={(e) =>
                                handleEditChunkText(
                                  msgIdx,
                                  chunkIdx,
                                  e.target.value
                                )
                              }
                              rows={6}
                            />
                          ) : chunk.kind === ChunkKind.TOOL_RESULT ||
                            (chunk.kind === ChunkKind.CONTENT &&
                              chunk.metadata?.subtype === "code") ? (
                            // Editable for TOOL_RESULT and code CONTENT
                            <textarea
                              className={
                                chunk.kind === ChunkKind.TOOL_RESULT
                                  ? "text-xs text-gray-300 bg-gray-900/60 p-2 rounded border border-gray-700/50 font-mono overflow-x-auto w-full"
                                  : "bg-gray-900 text-green-400 p-3 rounded text-sm w-full font-mono"
                              }
                              value={chunk.text}
                              onChange={(e) =>
                                handleEditChunkText(
                                  msgIdx,
                                  chunkIdx,
                                  e.target.value
                                )
                              }
                              rows={
                                chunk.kind === ChunkKind.TOOL_RESULT ? 4 : 6
                              }
                            />
                          ) : chunk.kind === ChunkKind.CONTENT ? (
                            // Editable for normal CONTENT (user/assistant text)
                            <textarea
                              className="whitespace-pre-wrap leading-relaxed bg-gray-700/50 rounded p-2 w-full text-white"
                              value={chunk.text}
                              onChange={(e) =>
                                handleEditChunkText(
                                  msgIdx,
                                  chunkIdx,
                                  e.target.value
                                )
                              }
                              rows={3}
                            />
                          ) : (
                            // Fallback for any other kind
                            <p className="whitespace-pre-wrap leading-relaxed">
                              {chunk.text}
                            </p>
                          )}
                          {/* Metadata */}
                          {chunk.metadata &&
                            Object.keys(chunk.metadata).length > 0 && (
                              <div className="mt-2 text-xs text-gray-500">
                                <strong>Metadata:</strong>{" "}
                                {JSON.stringify(chunk.metadata, null, 2)}
                              </div>
                            )}
                        </div>
                      </div>
                    );
                  })
                )}
                </div>
              </div>
            )}
          </ScrollArea>

          {/* Text Chunk Input Area - Show when editing */}
          {showTextChunkInput && (
            <div className="border-t border-gray-700/50 bg-gradient-to-r from-gray-800/90 to-gray-700/90 backdrop-blur p-6 shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-lg font-medium text-white flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-blue-400" />
                    {currentStep === "user"
                      ? "User Message"
                      : "Assistant Message"}
                  </label>
                  <Button
                    onClick={() => setShowTextChunkInput(false)}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-200"
                  >
                    Cancel
                  </Button>
                </div>
                <Textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder={`Enter ${currentStep} message content...`}
                  className="min-h-[120px] bg-gray-700/80 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-blue-400/50 transition-colors rounded-xl"
                  autoFocus
                />
                <div className="flex gap-3">
                  <Button
                    onClick={addTextChunk}
                    disabled={!messageContent.trim()}
                    className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white disabled:opacity-50 shadow-lg transition-all duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Text Chunk
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Tool Call Editors - Show when there are tool calls and editor is visible */}
          {currentStep === "assistant" && toolCalls.length > 0 && showToolEditor && (
            <div className="border-t border-gray-700/50 bg-gradient-to-r from-gray-800/90 to-gray-700/90 backdrop-blur p-6 shadow-lg max-h-96 overflow-y-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-white flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-green-400" />
                    Tool Calls ({toolCalls.length})
                  </h4>
                </div>

                {toolCalls.map((toolCall, index) => (
                  <div
                    key={toolCall.id}
                    className="bg-gradient-to-r from-gray-700/80 to-gray-600/80 rounded-xl p-6 border border-gray-600/50 shadow-lg"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <Settings className="w-4 h-4 text-green-400" />
                      </div>
                      <label className="text-sm font-medium text-white">
                        Tool Call {index + 1}
                      </label>
                      <Badge
                        variant={
                          toolCall.status === "completed"
                            ? "default"
                            : toolCall.status === "failed"
                            ? "destructive"
                            : toolCall.status === "executing"
                            ? "secondary"
                            : "outline"
                        }
                        className={`text-xs ${
                          toolCall.status === "completed"
                            ? "bg-green-500/20 text-green-300 border-green-400/50"
                            : toolCall.status === "failed"
                            ? "bg-red-500/20 text-red-300 border-red-400/50"
                            : toolCall.status === "executing"
                            ? "bg-yellow-500/20 text-yellow-300 border-yellow-400/50"
                            : "bg-gray-500/20 text-gray-300 border-gray-400/50"
                        }`}
                      >
                        {toolCall.status === "executing" && (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        )}
                        {toolCall.status === "completed" && (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        )}
                        {toolCall.status === "failed" && (
                          <AlertTriangle className="w-3 h-3 mr-1" />
                        )}
                        {toolCall.status}
                      </Badge>
                      <Button
                        onClick={() => removeToolCall(index)}
                        variant="ghost"
                        size="sm"
                        className="ml-auto text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <label className="text-sm text-gray-300 font-medium">
                          Tool Name
                        </label>
                        <Select
                          value={toolCall.toolName}
                          onValueChange={(value) =>
                            updateToolCall(index, { toolName: value })
                          }
                        >
                          <SelectTrigger className="bg-gray-600/80 border-gray-500/50 text-white focus:border-blue-400/50 transition-colors">
                            <SelectValue placeholder="Select tool..." />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTools.map((tool) => (
                              <SelectItem
                                key={tool.tool_name}
                                value={tool.tool_name}
                              >
                                {tool.tool_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-gray-300 font-medium">
                          Parameters (JSON)
                        </label>
                        <Input
                          value={JSON.stringify(toolCall.parameters)}
                          onChange={(e) => {
                            try {
                              const params = JSON.parse(e.target.value);
                              updateToolCall(index, { parameters: params });
                            } catch {}
                          }}
                          placeholder='{"param": "value"}'
                          className="bg-gray-600/80 border-gray-500/50 text-white placeholder:text-gray-400 focus:border-blue-400/50 transition-colors font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <label className="text-sm text-gray-300 font-medium flex items-center">
                        <Code className="w-4 h-4 mr-1 text-blue-400" />
                        Python Code *
                      </label>
                      <Textarea
                        value={toolCall.pythonCode}
                        onChange={(e) =>
                          updateToolCall(index, { pythonCode: e.target.value })
                        }
                        placeholder="# Write Python code here&#10;import requests&#10;import json&#10;&#10;# Your code here..."
                        className="min-h-[140px] bg-gray-600/80 border-gray-500/50 text-white font-mono text-sm placeholder:text-gray-400 focus:border-blue-400/50 transition-colors"
                      />
                    </div>

                    <div className="space-y-2 mb-4">
                      <label className="text-sm text-gray-300 font-medium flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1 text-green-400" />
                        Tool Result
                      </label>
                      <Textarea
                        value={toolCall.result}
                        onChange={(e) =>
                          handleToolResultEdit(index, e.target.value)
                        }
                        placeholder="Edit tool result for ground truth and evals"
                        className="min-h-[100px] bg-gray-600/80 border-gray-500/50 text-white font-mono text-sm placeholder:text-gray-400 focus:border-blue-400/50 transition-colors"
                      />
                    </div>

                    <Button
                      onClick={() => executeToolCall(index)}
                      disabled={
                        !toolCall.pythonCode.trim() ||
                        toolCall.status === "executing" ||
                        toolCall.status === "completed"
                      }
                      className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white disabled:opacity-50 shadow-lg transition-all duration-200"
                    >
                      {toolCall.status === "executing" ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : toolCall.status === "completed" ? (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      {toolCall.status === "executing"
                        ? "Executing..."
                        : toolCall.status === "completed"
                        ? "Executed"
                        : "Get Result"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* INLINE ACTION BUTTONS - All buttons in one horizontal row */}
        <div className="border-t border-gray-700/50 bg-gradient-to-r from-gray-800/90 to-gray-700/90 backdrop-blur p-4 shadow-lg">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {/* New Turn Button - Primary action */}
            <Button
              onClick={addNewTurn}
              disabled={!canStartNewTurn()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all duration-200 px-6 h-11 border-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Turn
            </Button>

            {/* Add Text Chunk Button */}
            <Button
              onClick={showTextChunkEditor}
              disabled={!canAddTextChunk() || showTextChunkInput}
              variant="outline"
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all duration-200 px-6 h-11 font-medium border-0"
            >
              <FileText className="w-4 h-4 mr-2" />
              Add Text Chunk
            </Button>

            {/* Add Tool Call Button - Only for assistant */}
            {currentStep === "assistant" && (
              <Button
                onClick={addToolCall}
                disabled={!canAddToolCall()}
                variant="outline"
                className="bg-green-700 border-green-600 text-green-300 hover:bg-green-600 hover:border-green-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all duration-200 px-6 h-11 font-medium border-0"
              >
                <Settings className="w-4 h-4 mr-2" />
                Add Tool Call
              </Button>
            )}

            {/* Get All Results Button - Always show when there are tool calls with code */}
            {toolCalls.length > 0 && getToolCallsWithCodeCount() > 0 && (
              <Button
                onClick={executeAllToolCalls}
                disabled={executeAllToolsMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white font-medium shadow-lg transition-all duration-200 px-6 h-11 border-0"
              >
                {executeAllToolsMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <PlayCircle className="w-4 h-4 mr-2" />
                )}
                Get All Results ({getToolCallsWithCodeCount()})
              </Button>
            )}

            {/* Back Step Button */}
            <Button
              onClick={goBackStep}
              disabled={!canGoBackStep()}
              variant="outline"
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all duration-200 px-6 h-11 font-medium border-0"
            >
              <Undo className="w-4 h-4 mr-2" />
              Back Step
            </Button>

            {/* Save to Database Button */}
            <div className="bg-purple-600 hover:bg-purple-700 rounded-md shadow-lg transition-all duration-200">
              {
                /* <SaveToDatabase
                messages={syncToolResultsWithMessages(
                  conversation.messages,
                  toolCalls
                )}
                tags={conversation.meta?.tags || []}
                exampleName={conversation.name}
              />
               */
                <SaveToDatabase
                  messages={conversation.messages}
                  tags={conversation.meta?.tags || []}
                  exampleName={conversation.name}
                />
              }
            </div>

            {/* Retrieve Example Button */}
            <div className="bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-lg transition-all duration-200">
              <RetrieveExample onExampleRetrieved={handleExampleRetrieved} />
            </div>

            {/* Edit Example Button */}
            <div className="bg-orange-600 hover:bg-orange-700 rounded-md shadow-lg transition-all duration-200">
              <EditExample
                currentExample={{
                  id: Number(conversation.id),
                  name: conversation.name,
                  description: conversation.description,
                  messages: conversation.messages,
                  meta: conversation.meta,
                  created_at: conversation.createdAt.toISOString(),
                  updated_at: conversation.updatedAt.toISOString(),
                }}
                onExampleUpdated={handleExampleUpdated}
              />
            </div>
          </div>

          {/* Status messages */}
          <div className="text-sm text-center mt-4">
            {!conversationStarted && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 inline-block">
                <p className="text-blue-300 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Click "New Turn" to start the conversation
                </p>
              </div>
            )}
            {currentStep === "user" && hasAddedTextChunk && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 inline-block">
                <p className="text-green-300 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Text chunk added. Click "New Turn" to switch to assistant.
                </p>
              </div>
            )}
            {currentStep === "user" &&
              !canAddTextChunk() &&
              !showTextChunkInput && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 inline-block">
                  <p className="text-blue-300 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    User can add only one text chunk per turn. Click "New Turn"
                    to continue.
                  </p>
                </div>
              )}
            {executeAllToolsMutation.isPending && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 inline-block">
                <p className="text-yellow-300 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Executing {getToolCallsWithCodeCount()} tool calls...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolTrainer;
