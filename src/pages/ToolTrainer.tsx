import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Play, 
  RotateCcw, 
  ArrowLeft, 
  ArrowRight,
  Upload, 
  Download,
  MessageSquare,
  Sparkles,
  AlertTriangle,
  Save,
  Type,
  Wrench,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Sidebar } from '@/components/ToolTrainer/Sidebar';
import { MessageBuilder } from '@/components/ToolTrainer/MessageBuilder';
import { ExampleHeader } from '@/components/ToolTrainer/ExampleHeader';
import { useTools, useExamples, useCreateExample, useUpdateExample, useExecuteTool } from '@/hooks/useApi';
import { CreateExampleRequest, Step } from '@/services/api';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { ErrorDisplay } from '@/components/ui/error-display';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { validateExampleMetadata } from '@/utils/validation';
import { SaveConversationDialog } from '@/components/ToolTrainer/SaveConversationDialog';
import { SavedConversations } from '@/components/ToolTrainer/SavedConversations';
import { conversationService, SavedConversation } from '@/services/conversationService';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: Array<{
    type: 'text' | 'tool_call' | 'tool_result';
    content: string;
    tool_name?: string;
    tool_id?: string;
  }>;
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

const ToolTrainer = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentExample, setCurrentExample] = useState<TrainingExample>({
    id: 1,
    name: 'Example 1',
    description: '',
    messages: [],
    metadata: {
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: []
    }
  });
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<Message[][]>([]);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => void;
  }>({
    open: false,
    title: '',
    description: '',
    action: () => {}
  });
  const [executionTimeouts, setExecutionTimeouts] = useState<Record<string, NodeJS.Timeout>>({});

  // Enhanced error handling
  const { errors, hasErrors, addError, clearErrors } = useErrorHandler();

  // API hooks
  const { data: tools = [], isLoading: toolsLoading } = useTools();
  const { data: examples = [], isLoading: examplesLoading } = useExamples();
  const createExampleMutation = useCreateExample();
  const updateExampleMutation = useUpdateExample();
  const executeToolMutation = useExecuteTool();

  // Add new function to load saved conversation
  const loadSavedConversation = (conversation: SavedConversation) => {
    setCurrentExample({
      id: parseInt(conversation.id.replace('conv_', '')) || 1,
      name: conversation.name,
      description: conversation.description,
      messages: conversation.messages,
      metadata: {
        created_at: conversation.createdAt,
        updated_at: conversation.updatedAt,
        tags: []
      }
    });
  };

  // Save current state to history
  const saveToHistory = () => {
    setHistory(prev => [...prev, currentExample.messages]);
  };

  // Convert messages to API format
  const convertToApiFormat = (example: TrainingExample): CreateExampleRequest => {
    const steps: Step[] = [];
    
    // Extract user prompt from first user message
    const firstUserMessage = example.messages.find(msg => msg.role === 'user');
    const userPrompt = firstUserMessage?.content
      .filter(c => c.type === 'text')
      .map(c => c.content)
      .join(' ') || '';

    // Convert tool calls to steps
    example.messages.forEach(message => {
      if (message.role === 'assistant') {
        message.content.forEach(messageContent => {
          if (messageContent.type === 'tool_call' && messageContent.tool_name) {
            steps.push({
              thought: `Using ${messageContent.tool_name} to process the request`,
              tool_name: messageContent.tool_name,
              tool_params: { code: messageContent.content },
              tool_result: 'Result pending...'
            });
          }
        });
      }
    });

    return {
      id: example.id === 0 ? `example_${Date.now()}` : example.id.toString(),
      name: example.name,
      description: example.description,
      tags: example.metadata.tags,
      user_prompt: userPrompt,
      steps,
      created: example.metadata.created_at,
      updated: new Date().toISOString()
    };
  };

  // Use tools from API or fallback to static data
  const availableTools = tools.length > 0 ? tools : [
    {
      name: 'browser_tools',
      description: 'Tools for web browsing and content extraction',
      functions: ['browse', 'extract_content', 'screenshot']
    },
    {
      name: 'codenav_api',
      description: 'Tools for code navigation and analysis',
      functions: ['code_search', 'find_definition', 'find_references']
    },
    {
      name: 'str_replace_editor',
      description: 'Tools for file editing and manipulation',
      functions: ['show_file', 'edit_file', 'create_file']
    },
    {
      name: 'bash',
      description: 'Execute bash commands and scripts',
      functions: ['execute_command']
    }
  ];

  // Enhanced validation functions
  const validateMessages = () => {
    const messages = currentExample.messages;
    const errors = [];

    if (messages.length === 0) {
      errors.push('At least one message is required');
      return errors;
    }

    // Check if first message is user
    if (messages[0].role !== 'user') {
      errors.push('First message must be from user');
    }

    // Check if last message is assistant
    if (messages[messages.length - 1].role !== 'assistant') {
      errors.push('Last message must be from assistant');
    }

    // Check for empty content and validate each chunk
    messages.forEach((msg, msgIndex) => {
      if (msg.content.length === 0) {
        errors.push(`Message ${msgIndex + 1} has no content chunks`);
        return;
      }

      msg.content.forEach((messageContent, contentIndex) => {
        if (!messageContent.content.trim()) {
          errors.push(`Message ${msgIndex + 1}, chunk ${contentIndex + 1} is empty`);
        }

        // Validate Python code in tool calls
        if (messageContent.type === 'tool_call') {
          if (!messageContent.tool_name) {
            errors.push(`Message ${msgIndex + 1}, chunk ${contentIndex + 1} missing tool name`);
          }
          
          // Check for unmatched tool calls (tool calls without results)
          const nextContent = msg.content[contentIndex + 1];
          if (!nextContent || nextContent.type !== 'tool_result') {
            errors.push(`Message ${msgIndex + 1}, chunk ${contentIndex + 1} tool call needs execution result`);
          }
        }
      });

      // Check user messages have only one text chunk
      if (msg.role === 'user') {
        const textChunks = msg.content.filter(c => c.type === 'text');
        if (textChunks.length > 1) {
          errors.push(`User message ${msgIndex + 1} has multiple text chunks (only one allowed)`);
        }
        if (textChunks.length === 0) {
          errors.push(`User message ${msgIndex + 1} must have a text chunk`);
        }
      }
    });

    // Validate example metadata
    const metadataValidation = validateExampleMetadata(currentExample.name, currentExample.description);
    errors.push(...metadataValidation.errors);

    return errors;
  };

  // Navigation functions
  const navigateToPreviousExample = () => {
    if (currentExample.id > 1) {
      setCurrentExample(prev => ({
        ...prev,
        id: prev.id - 1,
        name: `Example ${prev.id - 1}`,
        messages: [],
        metadata: {
          ...prev.metadata,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }));
    }
  };

  const navigateToNextExample = () => {
    setCurrentExample(prev => ({
      ...prev,
      id: prev.id + 1,
      name: `Example ${prev.id + 1}`,
      messages: [],
      metadata: {
        ...prev.metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }));
  };

  const addNewTurn = () => {
    if (currentExample.messages.length > 0) {
      const lastMessage = currentExample.messages[currentExample.messages.length - 1];
      if (lastMessage.content.some(c => c.type === 'tool_call' && !lastMessage.content.some(content => content.type === 'tool_result'))) {
        addError({
          message: 'Please execute pending tool calls before adding a new turn',
          type: 'warning',
          field: 'new-turn'
        });
        return;
      }
    }

    saveToHistory();
    const messages = currentExample.messages;
    const lastRole = messages.length > 0 ? messages[messages.length - 1].role : 'assistant';
    const newRole = lastRole === 'user' ? 'assistant' : 'user';
    
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      role: newRole,
      content: []
    };
    
    setCurrentExample(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      metadata: {
        ...prev.metadata,
        updated_at: new Date().toISOString()
      }
    }));
    
    setSelectedMessageId(newMessage.id);
    clearErrors('new-turn');
  };

  const addTextChunk = () => {
    if (currentExample.messages.length === 0) return;
    
    saveToHistory();
    const lastMessage = currentExample.messages[currentExample.messages.length - 1];
    
    // Check if user can add text chunk (only for user messages and only one allowed)
    if (lastMessage.role === 'user') {
      const hasTextChunk = lastMessage.content.some(c => c.type === 'text');
      if (hasTextChunk) return; // User already has text chunk
    }
    
    const updatedMessage = {
      ...lastMessage,
      content: [...lastMessage.content, { type: 'text' as const, content: '' }]
    };
    
    setCurrentExample(prev => ({
      ...prev,
      messages: prev.messages.map(msg => 
        msg.id === lastMessage.id ? updatedMessage : msg
      )
    }));
  };

  const addToolCall = () => {
    if (currentExample.messages.length === 0) return;
    
    saveToHistory();
    const lastMessage = currentExample.messages[currentExample.messages.length - 1];
    
    // Only allow tool calls for assistant messages
    if (lastMessage.role !== 'assistant') return;
    
    // Check if there's a pending tool call without result
    const hasPendingToolCall = lastMessage.content.some(content => {
      if (content.type === 'tool_call') {
        const toolCallIndex = lastMessage.content.findIndex(c => c === content);
        const nextContent = lastMessage.content[toolCallIndex + 1];
        return !nextContent || nextContent.type !== 'tool_result';
      }
      return false;
    });
    
    if (hasPendingToolCall) return; // Don't allow new tool call until previous one has result
    
    const updatedMessage = {
      ...lastMessage,
      content: [...lastMessage.content, { 
        type: 'tool_call' as const, 
        content: '',
        tool_name: 'python_executor',
        tool_id: `tool_${Date.now()}`
      }]
    };
    
    setCurrentExample(prev => ({
      ...prev,
      messages: prev.messages.map(msg => 
        msg.id === lastMessage.id ? updatedMessage : msg
      )
    }));
  };

  const getToolResult = async (toolId: string) => {
    const EXECUTION_TIMEOUT = 30000; // 30 seconds
    
    setIsLoading(true);
    clearErrors(`execution-${toolId}`);
    
    // Find the tool call
    const messageWithTool = currentExample.messages.find(msg => 
      msg.content.some(messageContent => messageContent.tool_id === toolId)
    );
    
    if (!messageWithTool) {
      setIsLoading(false);
      addError({
        message: 'Tool call not found',
        type: 'error',
        field: `execution-${toolId}`
      });
      return;
    }

    const toolCall = messageWithTool.content.find(messageContent => messageContent.tool_id === toolId);
    if (!toolCall || !toolCall.content.trim()) {
      setIsLoading(false);
      addError({
        message: 'Python code cannot be empty',
        type: 'error',
        field: `execution-${toolId}`
      });
      return;
    }

    // Set up timeout
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
      addError({
        message: 'Code execution timed out after 30 seconds',
        type: 'error',
        field: `execution-${toolId}`,
        retryable: true
      });
    }, EXECUTION_TIMEOUT);

    setExecutionTimeouts(prev => ({ ...prev, [toolId]: timeoutId }));

    try {
      // Use your backend API instead of the default one
      const result = await conversationService.executePythonCode({
        code: toolCall.content,
        language: 'python'
      });

      // Clear timeout
      clearTimeout(timeoutId);
      setExecutionTimeouts(prev => {
        const { [toolId]: removed, ...rest } = prev;
        return rest;
      });

      if (result.status === 'error') {
        // Add error as tool result
        setCurrentExample(prev => ({
          ...prev,
          messages: prev.messages.map(msg => ({
            ...msg,
            content: msg.content.map(content => 
              content.tool_id === toolId
                ? content
                : content
            ).concat(
              msg.content.some(content => content.tool_id === toolId) 
                ? [{ type: 'tool_result' as const, content: `Error: ${result.error}` }]
                : []
            )
          }))
        }));

        addError({
          message: result.error || 'Code execution failed',
          type: 'error',
          field: `execution-${toolId}`,
          retryable: true
        });
      } else {
        const formattedResult = typeof result.result === 'object' 
          ? JSON.stringify(result.result, null, 2)
          : String(result.result);

        // Add tool result after the tool call
        setCurrentExample(prev => ({
          ...prev,
          messages: prev.messages.map(msg => ({
            ...msg,
            content: msg.content.map(content => 
              content.tool_id === toolId
                ? content
                : content
            ).concat(
              msg.content.some(content => content.tool_id === toolId) 
                ? [{ type: 'tool_result' as const, content: formattedResult }]
                : []
            )
          }))
        }));

        addError({
          message: 'Code executed successfully',
          type: 'info',
          field: `execution-${toolId}`
        });
      }

    } catch (error) {
      // Clear timeout
      clearTimeout(timeoutId);
      setExecutionTimeouts(prev => {
        const { [toolId]: removed, ...rest } = prev;
        return rest;
      });

      const errorMessage = error instanceof Error ? error.message : 'Code execution failed';
      
      // Add error as tool result
      setCurrentExample(prev => ({
        ...prev,
        messages: prev.messages.map(msg => ({
          ...msg,
          content: msg.content.map(content => 
            content.tool_id === toolId
              ? content
              : content
          ).concat(
            msg.content.some(content => content.tool_id === toolId) 
              ? [{ type: 'tool_result' as const, content: `Error: ${errorMessage}` }]
              : []
          )
        }))
      }));

      addError({
        message: errorMessage,
        type: 'error',
        field: `execution-${toolId}`,
        retryable: true
      });
    }
    
    setIsLoading(false);
  };

  const getAllResults = async () => {
    setIsLoading(true);
    
    // Collect all tool calls
    const toolCalls: Array<{messageId: string, contentIndex: number, toolCall: any}> = [];
    
    currentExample.messages.forEach(msg => {
      msg.content.forEach((messageContent, index) => {
        if (messageContent.type === 'tool_call' && messageContent.content.trim() && messageContent.tool_id) {
          toolCalls.push({
            messageId: msg.id,
            contentIndex: index,
            toolCall: messageContent
          });
        }
      });
    });

    try {
      // Execute all tool calls (Python code)
      const results = await Promise.all(
        toolCalls.map(async ({ toolCall }) => {
          try {
            const result = await executeToolMutation.mutateAsync({
              tool_name: 'python_executor',
              parameters: {
                code: toolCall.content,
                language: 'python'
              }
            });

            return {
              toolId: toolCall.tool_id,
              result: typeof result.result === 'object' 
                ? JSON.stringify(result.result, null, 2)
                : String(result.result)
            };
          } catch (error) {
            return {
              toolId: toolCall.tool_id,
              result: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
          }
        })
      );

      // Update all tool results
      setCurrentExample(prev => ({
        ...prev,
        messages: prev.messages.map(msg => ({
          ...msg,
          content: msg.content.map(messageContent => {
            if (messageContent.type === 'tool_call' && messageContent.tool_id) {
              const result = results.find(r => r.toolId === messageContent.tool_id);
              if (result) {
                return messageContent;
              }
            }
            return messageContent;
          }).concat(
            // Add tool results after tool calls
            msg.content
              .filter(content => content.type === 'tool_call' && content.tool_id)
              .map(content => {
                const result = results.find(r => r.toolId === content.tool_id);
                return result ? {
                  type: 'tool_result' as const,
                  content: result.result
                } : null;
              })
              .filter(Boolean)
          )
        }))
      }));
    } catch (error) {
      console.error('Failed to execute all Python code:', error);
    }
    
    setIsLoading(false);
  };

  const goBack = () => {
    if (history.length > 0) {
      const previousState = history[history.length - 1];
      setCurrentExample(prev => ({
        ...prev,
        messages: previousState
      }));
      setHistory(prev => prev.slice(0, -1));
    }
  };

  const submitExample = async () => {
    const validationErrors = validateMessages();
    
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => {
        addError({
          message: error,
          type: 'error',
          field: 'submission'
        });
      });
      return;
    }

    setConfirmationDialog({
      open: true,
      title: 'Save Training Example',
      description: `Are you sure you want to save "${currentExample.name}"? This will ${currentExample.id === 0 ? 'create a new' : 'update the existing'} training example.`,
      action: async () => {
        try {
          const apiExample = convertToApiFormat(currentExample);
          
          if (currentExample.id === 0) {
            await createExampleMutation.mutateAsync(apiExample);
          } else {
            await updateExampleMutation.mutateAsync({
              exampleId: currentExample.id.toString(),
              example: apiExample
            });
          }
          
          clearErrors('submission');
          addError({
            message: 'Training example saved successfully',
            type: 'info',
            field: 'submission'
          });
        } catch (error) {
          console.error('Error submitting example:', error);
          addError({
            message: 'Failed to save example. Please try again.',
            type: 'error',
            field: 'submission',
            retryable: true
          });
        }
      }
    });
  };

  const loadExample = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const example = JSON.parse(e.target?.result as string);
          setCurrentExample(example);
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const autoGenerateExample = async () => {
    setIsLoading(true);
    // Simulate auto-generation
    setTimeout(() => {
      const newExample: TrainingExample = {
        id: Math.floor(Math.random() * 1000) + 1,
        name: 'Auto-generated Example',
        description: 'Automatically generated training example',
        messages: [
          {
            id: 'msg_1',
            role: 'user',
            content: [{ type: 'text', content: 'Help me find the definition of a function in my codebase.' }]
          },
          {
            id: 'msg_2',
            role: 'assistant',
            content: [
              { type: 'text', content: 'I\'ll help you find the function definition. Let me search your codebase.' },
              { 
                type: 'tool_call', 
                content: '# Search for function definition\nresult = codenav_api.find_definition(\n    symbol="main",\n    file_path="src/app.py"\n)',
                tool_name: 'codenav_api',
                tool_id: 'tool_auto_1'
              }
            ]
          }
        ],
        metadata: {
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tags: ['auto-generated', 'code-search']
        }
      };
      setCurrentExample(newExample);
      setIsLoading(false);
    }, 1000);
  };

  const validationErrors = validateMessages();
  const canSubmit = validationErrors.length === 0 && currentExample.messages.length > 0 && !hasErrors;
  
  // Determine current turn and button availability
  const lastMessage = currentExample.messages[currentExample.messages.length - 1];
  const isUserTurn = lastMessage?.role === 'user';
  const isAssistantTurn = lastMessage?.role === 'assistant';
  
  // Text chunk can be added to both user and assistant messages
  const canAddTextChunk = currentExample.messages.length > 0;
  
  // Check if can add tool call (only assistant turn and no pending tool calls)
  const canAddToolCall = isAssistantTurn && !lastMessage?.content.some(content => {
    if (content.type === 'tool_call') {
      const toolCallIndex = lastMessage.content.findIndex(c => c === content);
      const nextContent = lastMessage.content[toolCallIndex + 1];
      return !nextContent || nextContent.type !== 'tool_result';
    }
    return false;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      <Sidebar 
        tools={availableTools}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-80'} flex flex-col`} role="main">
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6 max-w-6xl mx-auto pb-32">
              {/* Navigation Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Button
                    onClick={navigateToPreviousExample}
                    disabled={currentExample.id <= 1}
                    variant="outline"
                    size="sm"
                    aria-label="Previous example"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <span className="font-medium text-gray-600">
                    Example ID: {currentExample.id}
                  </span>
                  <Button
                    onClick={navigateToNextExample}
                    variant="outline"
                    size="sm"
                    aria-label="Next example"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Add Save and Load functionality */}
                <div className="flex items-center gap-3">
                  <SavedConversations onLoadConversation={loadSavedConversation} />
                  <SaveConversationDialog 
                    messages={currentExample.messages}
                    exampleName={currentExample.name}
                  />
                </div>
              </div>

              <ExampleHeader 
                example={currentExample}
                onExampleChange={setCurrentExample}
                onLoad={loadExample}
                onAutoGenerate={autoGenerateExample}
                isLoading={isLoading || createExampleMutation.isPending || updateExampleMutation.isPending}
              />
              
              {/* Enhanced Error Display */}
              <ErrorDisplay 
                errors={errors}
                onDismiss={clearErrors}
                onRetry={(errorId) => {
                  const error = errors.find(e => e.id === errorId);
                  if (error?.field?.startsWith('execution-')) {
                    const toolId = error.field.replace('execution-', '');
                    getToolResult(toolId);
                  } else if (error?.field === 'submission') {
                    submitExample();
                  }
                  clearErrors();
                }}
                className="mt-6"
              />
              
              <div className="grid gap-6 mt-6">
                <div className="space-y-4">
                  {currentExample.messages.map((message, index) => (
                    <MessageBuilder
                      key={message.id}
                      message={message}
                      isSelected={selectedMessageId === message.id}
                      onSelect={() => setSelectedMessageId(message.id)}
                      onUpdate={(updatedMessage) => {
                        saveToHistory();
                        setCurrentExample(prev => ({
                          ...prev,
                          messages: prev.messages.map(msg => 
                            msg.id === message.id ? updatedMessage : msg
                          )
                        }));
                      }}
                      onGetToolResult={getToolResult}
                      isLoading={isLoading}
                      availableTools={availableTools}
                      isFirstMessage={index === 0}
                      isLastMessage={index === currentExample.messages.length - 1}
                    />
                  ))}
                  
                  {currentExample.messages.length === 0 && (
                    <Card className="border-dashed border-2 border-gray-300">
                      <CardContent className="p-12 text-center">
                        <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                        <p className="text-gray-500 mb-6">Start building your training example by adding a new turn</p>
                        <div className="flex gap-3 justify-center">
                          <Button 
                            onClick={addNewTurn}
                            className="bg-blue-600 hover:bg-blue-700"
                            aria-label="Add new conversation turn"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Turn
                          </Button>
                          <Button 
                            onClick={autoGenerateExample}
                            variant="outline"
                            disabled={isLoading}
                            aria-label="Auto generate example"
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Auto Generate
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Enhanced Action Bar with accessibility */}
        <div className="fixed bottom-0 right-0 left-0 bg-white border-t border-gray-200 shadow-lg z-10" 
             style={{ marginLeft: sidebarCollapsed ? '64px' : '320px' }}>
          <div className="p-4 max-w-6xl mx-auto">
            <div className="flex flex-wrap gap-3 items-center">
              <Button 
                onClick={addNewTurn}
                className="bg-blue-600 hover:bg-blue-700"
                aria-label="Add new conversation turn"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Turn
              </Button>
              
              <Button 
                onClick={addTextChunk}
                disabled={!canAddTextChunk}
                variant="outline"
                className={`${canAddTextChunk ? 'border-blue-500 text-blue-600 hover:bg-blue-50' : ''}`}
              >
                <Type className="w-4 h-4 mr-2" />
                Add Text Chunk
              </Button>
              
              <Button 
                onClick={addToolCall}
                disabled={!canAddToolCall}
                variant="outline"
                className={`${canAddToolCall ? 'border-green-500 text-green-600 hover:bg-green-50' : ''}`}
              >
                <Wrench className="w-4 h-4 mr-2" />
                Add Python Code
              </Button>
              
              <Button 
                onClick={getAllResults}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Execute All Code
              </Button>
              
              <Button 
                onClick={goBack}
                variant="outline"
                disabled={history.length === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              {/* Add save button in the action bar too */}
              <SaveConversationDialog 
                messages={currentExample.messages}
                exampleName={currentExample.name}
              />
              
              <Button 
                onClick={submitExample}
                disabled={!canSubmit || createExampleMutation.isPending || updateExampleMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700 ml-auto"
                aria-label="Save training example"
              >
                <Save className="w-4 h-4 mr-2" />
                {createExampleMutation.isPending || updateExampleMutation.isPending ? 'Saving...' : 'Save Trace'}
              </Button>
            </div>
          </div>
        </div>

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          open={confirmationDialog.open}
          onOpenChange={(open) => setConfirmationDialog(prev => ({ ...prev, open }))}
          title={confirmationDialog.title}
          description={confirmationDialog.description}
          onConfirm={() => {
            confirmationDialog.action();
            setConfirmationDialog(prev => ({ ...prev, open: false }));
          }}
        />
      </main>
    </div>
  );
};

export default ToolTrainer;
