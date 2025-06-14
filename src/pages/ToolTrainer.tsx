
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sidebar } from '@/components/ToolTrainer/Sidebar';
import { MessageBuilder } from '@/components/ToolTrainer/MessageBuilder';
import { ExampleHeader } from '@/components/ToolTrainer/ExampleHeader';
import { NavigationHeader } from '@/components/ToolTrainer/NavigationHeader';
import { ActionBar } from '@/components/ToolTrainer/ActionBar';
import { EmptyState } from '@/components/ToolTrainer/EmptyState';
import { useTools } from '@/hooks/useApi';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { ErrorDisplay } from '@/components/ui/error-display';
import { useToolTrainerLogic } from '@/hooks/useToolTrainerLogic';
import { Message, TrainingExample } from '@/types/toolTrainer';
import { Tool, CodeChunk } from '@/services/api';

// Mock tools data for when API fails
const mockTools: Tool[] = [
  {
    tool_name: "email_api_tool",
    functions: [
      {
        func_name: "send_email",
        params: [
          { param_name: "to", param_type: "str", is_required: true, default_value: "" },
          { param_name: "subject", param_type: "str", is_required: true, default_value: "" },
          { param_name: "body", param_type: "str", is_required: true, default_value: "" }
        ],
        return_value: { param_name: "success", param_type: "bool", is_required: true, default_value: "True" }
      }
    ],
    classes: []
  },
  {
    tool_name: "contact_api_tool",
    functions: [
      {
        func_name: "get_contact",
        params: [
          { param_name: "name", param_type: "str", is_required: true, default_value: "" }
        ],
        return_value: { param_name: "contact", param_type: "dict", is_required: true, default_value: "{}" }
      }
    ],
    classes: []
  },
  {
    tool_name: "drive_api_tool",
    functions: [
      {
        func_name: "upload_file",
        params: [
          { param_name: "file_path", param_type: "str", is_required: true, default_value: "" },
          { param_name: "folder_id", param_type: "str", is_required: false, default_value: "" }
        ],
        return_value: { param_name: "file_id", param_type: "str", is_required: true, default_value: "" }
      }
    ],
    classes: []
  },
  {
    tool_name: "calendar_api_tool",
    functions: [
      {
        func_name: "create_event",
        params: [
          { param_name: "title", param_type: "str", is_required: true, default_value: "" },
          { param_name: "start_time", param_type: "str", is_required: true, default_value: "" },
          { param_name: "end_time", param_type: "str", is_required: true, default_value: "" }
        ],
        return_value: { param_name: "event_id", param_type: "str", is_required: true, default_value: "" }
      }
    ],
    classes: []
  },
  {
    tool_name: "weather_tool",
    functions: [
      {
        func_name: "get_weather",
        params: [
          { param_name: "location", param_type: "str", is_required: true, default_value: "" }
        ],
        return_value: { param_name: "weather_data", param_type: "dict", is_required: true, default_value: "{}" }
      }
    ],
    classes: []
  }
];

const ToolTrainer = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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

  const { data: tools = [], isLoading: toolsLoading, error: toolsError } = useTools();
  
  const {
    currentExample,
    setCurrentExample,
    selectedMessageId,
    setSelectedMessageId,
    isLoading,
    setIsLoading,
    history,
    executionTimeouts,
    setExecutionTimeouts,
    errors,
    hasErrors,
    addError,
    clearErrors,
    createExampleMutation,
    updateExampleMutation,
    executeToolResultMutation,
    executeAllToolsMutation,
    saveToHistory,
    loadSavedConversation,
    convertToApiFormat,
    validateMessages
  } = useToolTrainerLogic();

  // Use mock tools if API fails or returns empty array
  const availableTools = tools.length > 0 ? tools : mockTools;

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
    
    if (lastMessage.role === 'user') {
      const hasTextChunk = lastMessage.content.some(c => c.type === 'text');
      if (hasTextChunk) return;
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
    
    if (lastMessage.role !== 'assistant') return;
    
    const hasPendingToolCall = lastMessage.content.some(content => {
      if (content.type === 'tool_call') {
        const toolCallIndex = lastMessage.content.findIndex(c => c === content);
        const nextContent = lastMessage.content[toolCallIndex + 1];
        return !nextContent || nextContent.type !== 'tool_result';
      }
      return false;
    });
    
    if (hasPendingToolCall) return;
    
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
    const EXECUTION_TIMEOUT = 30000;
    
    setIsLoading(true);
    clearErrors(`execution-${toolId}`);
    
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
      const result = await executeToolResultMutation.mutateAsync({
        code: toolCall.content
      });

      clearTimeout(timeoutId);
      setExecutionTimeouts(prev => {
        const { [toolId]: removed, ...rest } = prev;
        return rest;
      });

      const formattedResult = typeof result.code_output === 'object' 
        ? JSON.stringify(result.code_output, null, 2)
        : String(result.code_output);

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

    } catch (error) {
      clearTimeout(timeoutId);
      setExecutionTimeouts(prev => {
        const { [toolId]: removed, ...rest } = prev;
        return rest;
      });

      const errorMessage = error instanceof Error ? error.message : 'Code execution failed';
      
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
    
    const codeChunks: CodeChunk[] = [];
    let chunkId = 0;
    
    currentExample.messages.forEach(msg => {
      msg.content.forEach((messageContent) => {
        if (messageContent.type === 'tool_call' && messageContent.content.trim() && messageContent.tool_id) {
          codeChunks.push({
            chunk_id: chunkId++,
            code: messageContent.content
          });
        }
      });
    });

    if (codeChunks.length === 0) {
      setIsLoading(false);
      addError({
        message: 'No Python code to execute',
        type: 'warning',
        field: 'execution-all'
      });
      return;
    }

    try {
      const result = await executeAllToolsMutation.mutateAsync({
        code_chunks: codeChunks
      });

      let resultIndex = 0;
      setCurrentExample(prev => ({
        ...prev,
        messages: prev.messages.map(msg => ({
          ...msg,
          content: msg.content.map(messageContent => {
            if (messageContent.type === 'tool_call' && messageContent.tool_id) {
              const chunkOutput = result.code_chunk_output[resultIndex];
              if (chunkOutput) {
                resultIndex++;
                return messageContent;
              }
            }
            return messageContent;
          }).concat(
            msg.content
              .filter(content => content.type === 'tool_call' && content.tool_id)
              .map((content, index) => {
                const chunkOutput = result.code_chunk_output[index];
                return chunkOutput ? {
                  type: 'tool_result' as const,
                  content: typeof chunkOutput.code_output === 'object' 
                    ? JSON.stringify(chunkOutput.code_output, null, 2)
                    : String(chunkOutput.code_output)
                } : null;
              })
              .filter(Boolean)
          )
        }))
      }));

      addError({
        message: `Successfully executed ${codeChunks.length} code chunks`,
        type: 'info',
        field: 'execution-all'
      });

    } catch (error) {
      console.error('Failed to execute all Python code:', error);
      addError({
        message: 'Failed to execute all Python code',
        type: 'error',
        field: 'execution-all',
        retryable: true
      });
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

  const validationErrors = validateMessages();
  const canSubmit = validateMessages().length === 0 && currentExample.messages.length > 0 && !hasErrors;
  
  const lastMessage = currentExample.messages[currentExample.messages.length - 1];
  const isAssistantTurn = lastMessage?.role === 'assistant';
  
  const canAddTextChunk = currentExample.messages.length > 0;
  
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
              <NavigationHeader
                currentExample={currentExample}
                onNavigatePrevious={() => {
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
                }}
                onNavigateNext={() => {
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
                }}
                onLoadConversation={loadSavedConversation}
              />

              <ExampleHeader 
                example={currentExample}
                onExampleChange={setCurrentExample}
                onLoad={(event: React.ChangeEvent<HTMLInputElement>) => {
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
                }}
                onAutoGenerate={async () => {
                  setIsLoading(true);
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
                }}
                isLoading={isLoading || createExampleMutation.isPending || updateExampleMutation.isPending}
              />
              
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
                    <EmptyState
                      isLoading={isLoading}
                      onAddNewTurn={addNewTurn}
                      onAutoGenerate={async () => {
                        setIsLoading(true);
                        setTimeout(() => {
                          const newExample: TrainingExample = {
                            id: Math.floor(Math.random() * 1000) + 1,
                            name: 'Auto-generated Example',
                            description: 'Automatically generated training example',
                            messages: [
                              {
                                id: 'msg_1',
                                role: 'user',
                                content: [{ type: 'text', content: 'Help me send an email using the email API.' }]
                              },
                              {
                                id: 'msg_2',
                                role: 'assistant',
                                content: [
                                  { type: 'text', content: 'I\'ll help you send an email. Let me use the email API.' },
                                  { 
                                    type: 'tool_call', 
                                    content: '# Send email using email API\nemail_api_tool.send_email(\n    to="user@example.com",\n    subject="Hello World",\n    body="This is a test email."\n)',
                                    tool_name: 'email_api_tool',
                                    tool_id: 'tool_auto_1'
                                  }
                                ]
                              }
                            ],
                            metadata: {
                              created_at: new Date().toISOString(),
                              updated_at: new Date().toISOString(),
                              tags: ['auto-generated', 'email']
                            }
                          };
                          setCurrentExample(newExample);
                          setIsLoading(false);
                        }, 1000);
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        <ActionBar
          sidebarCollapsed={sidebarCollapsed}
          currentExample={currentExample}
          isLoading={isLoading}
          canSubmit={canSubmit}
          canAddTextChunk={canAddTextChunk}
          canAddToolCall={canAddToolCall}
          historyLength={history.length}
          isSaving={createExampleMutation.isPending || updateExampleMutation.isPending}
          onAddNewTurn={addNewTurn}
          onAddTextChunk={addTextChunk}
          onAddToolCall={addToolCall}
          onGetAllResults={getAllResults}
          onGoBack={goBack}
          onSubmitExample={submitExample}
        />

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
