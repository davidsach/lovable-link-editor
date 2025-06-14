
import React, { useState, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { ErrorDisplay } from '@/components/ui/error-display';
import { 
  ChevronLeft, 
  ChevronRight, 
  Wrench, 
  Code, 
  Plus, 
  Play, 
  ArrowLeft, 
  Save, 
  Type, 
  MessageSquare, 
  User, 
  Bot, 
  Loader2, 
  X, 
  FileText, 
  Calendar
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTools, useCreateExample, useUpdateExample, useExecuteToolResult } from '@/hooks/useApi';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Tool, CreateExampleRequest, Step } from '@/services/api';
import { Message, TrainingExample } from '@/types/toolTrainer';
import { NavigationHeader } from '@/components/ToolTrainer/NavigationHeader';
import { ExampleHeader } from '@/components/ToolTrainer/ExampleHeader';

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
  }
];

const ToolTrainer = () => {
  // State
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

  // Hooks
  const { data: tools = [], isLoading: toolsLoading } = useTools();
  const { errors, hasErrors, addError, clearErrors } = useErrorHandler();
  const createExampleMutation = useCreateExample();
  const updateExampleMutation = useUpdateExample();
  const executeToolResultMutation = useExecuteToolResult();

  // Use mock tools if API fails
  const availableTools = tools.length > 0 ? tools : mockTools;

  // Helper functions
  const saveToHistory = () => {
    setHistory(prev => [...prev, currentExample.messages]);
  };

  const convertToApiFormat = (example: TrainingExample): CreateExampleRequest => {
    const steps: Step[] = [];
    
    const firstUserMessage = example.messages.find(msg => msg.role === 'user');
    const userPrompt = firstUserMessage?.content
      .filter(c => c.type === 'text')
      .map(c => c.content)
      .join(' ') || '';

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

  const validateMessages = () => {
    const messages = currentExample.messages;
    const errors = [];

    if (messages.length === 0) {
      errors.push('At least one message is required');
      return errors;
    }

    if (messages[0].role !== 'user') {
      errors.push('First message must be from user');
    }

    messages.forEach((msg, msgIndex) => {
      if (msg.content.length === 0) {
        errors.push(`Message ${msgIndex + 1} has no content chunks`);
        return;
      }

      msg.content.forEach((messageContent, contentIndex) => {
        if (!messageContent.content.trim()) {
          errors.push(`Message ${msgIndex + 1}, chunk ${contentIndex + 1} is empty`);
        }
      });
    });

    return errors;
  };

  // Action handlers
  const addNewTurn = () => {
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
    setIsLoading(true);
    
    const messageWithTool = currentExample.messages.find(msg => 
      msg.content.some(messageContent => messageContent.tool_id === toolId)
    );
    
    if (!messageWithTool) {
      setIsLoading(false);
      return;
    }

    const toolCall = messageWithTool.content.find(messageContent => messageContent.tool_id === toolId);
    if (!toolCall || !toolCall.content.trim()) {
      setIsLoading(false);
      return;
    }

    try {
      const result = await executeToolResultMutation.mutateAsync({
        code: toolCall.content
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

    } catch (error) {
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
    }
    
    setIsLoading(false);
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
      
      addError({
        message: 'Training example saved successfully',
        type: 'info',
        field: 'submission'
      });
    } catch (error) {
      console.error('Error submitting example:', error);
    }
  };

  // Handle file loading
  const handleLoadExample = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        setCurrentExample(data);
      } catch (error) {
        console.error('Error loading example:', error);
      }
    };
    reader.readAsText(file);
  };

  const handleAutoGenerate = () => {
    // Auto-generate a sample conversation
    const sampleExample: TrainingExample = {
      id: currentExample.id,
      name: 'Auto-generated Example',
      description: 'Sample conversation with tool usage',
      messages: [
        {
          id: 'msg_1',
          role: 'user',
          content: [{ type: 'text', content: 'Send an email to john@example.com with subject "Meeting" and body "Let\'s meet tomorrow"' }]
        },
        {
          id: 'msg_2',
          role: 'assistant',
          content: [
            { type: 'text', content: 'I\'ll help you send that email. Let me use the email tool.' },
            { type: 'tool_call', content: 'send_email(to="john@example.com", subject="Meeting", body="Let\'s meet tomorrow")', tool_name: 'email_api_tool', tool_id: 'tool_1' },
            { type: 'tool_result', content: '{"success": true, "message_id": "msg_12345"}' }
          ]
        }
      ],
      metadata: {
        ...currentExample.metadata,
        updated_at: new Date().toISOString()
      }
    };
    
    setCurrentExample(sampleExample);
  };

  // Validation
  const canSubmit = validateMessages().length === 0 && currentExample.messages.length > 0;
  const lastMessage = currentExample.messages[currentExample.messages.length - 1];
  const isAssistantTurn = lastMessage?.role === 'assistant';
  const canAddTextChunk = currentExample.messages.length > 0;
  const canAddToolCall = isAssistantTurn;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
        {/* Sidebar */}
        <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-10 ${
          sidebarCollapsed ? 'w-16' : 'w-80'
        }`}>
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            {!sidebarCollapsed && (
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <Wrench className="w-5 h-5 mr-2 text-blue-600" />
                Available Tools
              </h2>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </div>
          
          {!sidebarCollapsed && (
            <div className="p-4 space-y-4 overflow-y-auto h-full pb-20">
              {availableTools.length > 0 ? (
                availableTools.map((tool, index) => (
                  <Card key={index} className="border border-gray-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-blue-600 flex items-center">
                        <Code className="w-4 h-4 mr-2" />
                        {tool.tool_name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      {tool.functions && tool.functions.length > 0 && (
                        <div>
                          <div className="flex items-center text-xs font-medium text-gray-700 mb-2">
                            <Code className="w-3 h-3 mr-1" />
                            Functions
                          </div>
                          <div className="space-y-2">
                            {tool.functions.map((func, funcIndex) => (
                              <div key={funcIndex} className="bg-gray-50 p-2 rounded text-xs">
                                <div className="font-medium text-gray-800">{func.func_name}</div>
                                {func.params && func.params.length > 0 && (
                                  <div className="mt-1 space-y-1">
                                    {func.params.map((param, paramIndex) => (
                                      <div key={paramIndex} className="text-gray-600">
                                        <span className="font-mono">{param.param_name}</span>
                                        <span className="text-gray-500">: {param.param_type}</span>
                                        {param.is_required && (
                                          <Badge variant="outline" className="ml-1 text-xs">required</Badge>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-sm text-gray-500 text-center">
                  {toolsLoading ? 'Loading tools...' : 'No tools available'}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-80'} flex flex-col`}>
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6 max-w-6xl mx-auto pb-32">
                {/* Navigation Header */}
                <NavigationHeader
                  currentExample={currentExample}
                  onNavigatePrevious={() => {
                    if (currentExample.id > 1) {
                      setCurrentExample(prev => ({
                        ...prev,
                        id: prev.id - 1,
                        name: `Example ${prev.id - 1}`,
                        messages: []
                      }));
                    }
                  }}
                  onNavigateNext={() => {
                    setCurrentExample(prev => ({
                      ...prev,
                      id: prev.id + 1,
                      name: `Example ${prev.id + 1}`,
                      messages: []
                    }));
                  }}
                  onLoadConversation={(conversation) => {
                    setCurrentExample({
                      ...currentExample,
                      name: conversation.name,
                      description: conversation.description,
                      messages: conversation.messages
                    });
                  }}
                />

                {/* Example Header */}
                <ExampleHeader
                  example={currentExample}
                  onExampleChange={setCurrentExample}
                  onLoad={handleLoadExample}
                  onAutoGenerate={handleAutoGenerate}
                  isLoading={isLoading}
                />
                
                <ErrorDisplay 
                  errors={errors}
                  onDismiss={clearErrors}
                  className="mb-6"
                />
                
                {/* Messages */}
                <div className="space-y-4">
                  {currentExample.messages.map((message, index) => (
                    <Card 
                      key={message.id}
                      className={`transition-all cursor-pointer ${
                        selectedMessageId === message.id 
                          ? 'ring-2 ring-blue-500 shadow-lg' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedMessageId(message.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {message.role === 'user' ? (
                              <User className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Bot className="w-5 h-5 text-green-600" />
                            )}
                            <Badge 
                              variant={message.role === 'user' ? 'default' : 'secondary'}
                              className="capitalize"
                            >
                              {message.role}
                            </Badge>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {message.content.length} chunk{message.content.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {message.content.map((content, contentIndex) => (
                          <div key={contentIndex} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  content.type === 'text' ? 'bg-gray-50' :
                                  content.type === 'tool_call' ? 'bg-blue-50' :
                                  'bg-green-50'
                                }`}
                              >
                                {content.type.replace('_', ' ')}
                              </Badge>
                              {message.content.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const updatedMessage = {
                                      ...message,
                                      content: message.content.filter((_, i) => i !== contentIndex)
                                    };
                                    setCurrentExample(prev => ({
                                      ...prev,
                                      messages: prev.messages.map(msg => 
                                        msg.id === message.id ? updatedMessage : msg
                                      )
                                    }));
                                  }}
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                            
                            {content.type === 'text' && (
                              <Textarea
                                value={content.content}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  const updatedMessage = {
                                    ...message,
                                    content: message.content.map((c, i) => 
                                      i === contentIndex ? { ...c, content: e.target.value } : c
                                    )
                                  };
                                  setCurrentExample(prev => ({
                                    ...prev,
                                    messages: prev.messages.map(msg => 
                                      msg.id === message.id ? updatedMessage : msg
                                    )
                                  }));
                                }}
                                placeholder="Enter message content..."
                                className="min-h-[80px]"
                                onClick={(e) => e.stopPropagation()}
                              />
                            )}
                            
                            {content.type === 'tool_call' && (
                              <div className="space-y-4">
                                <Textarea
                                  value={content.content}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    const updatedMessage = {
                                      ...message,
                                      content: message.content.map((c, i) => 
                                        i === contentIndex ? { ...c, content: e.target.value } : c
                                      )
                                    };
                                    setCurrentExample(prev => ({
                                      ...prev,
                                      messages: prev.messages.map(msg => 
                                        msg.id === message.id ? updatedMessage : msg
                                      )
                                    }));
                                  }}
                                  placeholder="# Write your Python code here..."
                                  className="font-mono text-sm min-h-[150px] bg-gray-50"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    getToolResult(content.tool_id || '');
                                  }}
                                  disabled={isLoading || !content.content.trim()}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  {isLoading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  ) : (
                                    <Play className="w-4 h-4 mr-2" />
                                  )}
                                  Execute Code
                                </Button>
                              </div>
                            )}
                            
                            {content.type === 'tool_result' && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <div className="text-sm font-medium text-green-800 mb-2">Execution Result:</div>
                                <pre className="text-sm text-green-700 whitespace-pre-wrap font-mono max-h-40 overflow-y-auto">
                                  {content.content}
                                </pre>
                              </div>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                  
                  {currentExample.messages.length === 0 && (
                    <Card className="border-dashed border-2 border-gray-300">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <MessageSquare className="w-12 h-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                        <p className="text-gray-500 text-center mb-6">
                          Start building your training example by adding a conversation turn.
                        </p>
                        <Button onClick={addNewTurn} className="bg-blue-600 hover:bg-blue-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Add First Message
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Action Bar */}
          <div className="fixed bottom-0 right-0 left-0 bg-white border-t border-gray-200 shadow-lg z-10" 
               style={{ marginLeft: sidebarCollapsed ? '64px' : '320px' }}>
            <div className="p-4 max-w-6xl mx-auto">
              <div className="flex flex-wrap gap-3 items-center">
                <Button 
                  onClick={addNewTurn}
                  className="bg-blue-600 hover:bg-blue-700"
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
                  onClick={() => {
                    if (history.length > 0) {
                      const previousState = history[history.length - 1];
                      setCurrentExample(prev => ({
                        ...prev,
                        messages: previousState
                      }));
                    }
                  }}
                  variant="outline"
                  disabled={history.length === 0}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                
                <Button 
                  onClick={submitExample}
                  disabled={!canSubmit || createExampleMutation.isPending || updateExampleMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700 ml-auto"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {createExampleMutation.isPending || updateExampleMutation.isPending ? 'Saving...' : 'Save Trace'}
                </Button>
              </div>
            </div>
          </div>

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
    </TooltipProvider>
  );
};

export default ToolTrainer;
