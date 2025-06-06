import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Play, 
  RotateCcw, 
  ArrowLeft, 
  Upload, 
  Download,
  MessageSquare,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { Sidebar } from '@/components/ToolTrainer/Sidebar';
import { MessageBuilder } from '@/components/ToolTrainer/MessageBuilder';
import { ExampleHeader } from '@/components/ToolTrainer/ExampleHeader';
import { useTools, useExamples, useCreateExample, useUpdateExample, useExecuteTool } from '@/hooks/useApi';
import { CreateExampleRequest, Step } from '@/services/api';

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
  id: string;
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
    id: 'new',
    name: 'Untitled Example',
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

  // API hooks
  const { data: tools = [], isLoading: toolsLoading } = useTools();
  const { data: examples = [], isLoading: examplesLoading } = useExamples();
  const createExampleMutation = useCreateExample();
  const updateExampleMutation = useUpdateExample();
  const executeToolMutation = useExecuteTool();

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
      id: example.id === 'new' ? `example_${Date.now()}` : example.id,
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

  // Validation functions
  const validateMessages = () => {
    const messages = currentExample.messages;
    const errors = [];

    // Check if first message is user
    if (messages.length > 0 && messages[0].role !== 'user') {
      errors.push('First message must be from user');
    }

    // Check if last message is assistant
    if (messages.length > 0 && messages[messages.length - 1].role !== 'assistant') {
      errors.push('Last message must be from assistant');
    }

    // Check for empty content
    messages.forEach((msg, msgIndex) => {
      msg.content.forEach((messageContent, contentIndex) => {
        if (!messageContent.content.trim()) {
          errors.push(`Message ${msgIndex + 1}, chunk ${contentIndex + 1} is empty`);
        }
      });
    });

    // Check user messages have only one text chunk
    messages.forEach((msg, msgIndex) => {
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

    return errors;
  };

  const addNewTurn = () => {
    const messages = currentExample.messages;
    const lastRole = messages.length > 0 ? messages[messages.length - 1].role : 'assistant';
    const newRole = lastRole === 'user' ? 'assistant' : 'user';
    
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      role: newRole,
      content: newRole === 'user' ? [{ type: 'text', content: '' }] : []
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

  const getToolResult = async (toolId: string) => {
    setIsLoading(true);
    
    // Find the tool call
    const messageWithTool = currentExample.messages.find(msg => 
      msg.content.some(messageContent => messageContent.tool_id === toolId)
    );
    
    if (!messageWithTool) {
      setIsLoading(false);
      return;
    }

    const toolCall = messageWithTool.content.find(messageContent => messageContent.tool_id === toolId);
    if (!toolCall || !toolCall.tool_name) {
      setIsLoading(false);
      return;
    }

    try {
      // Try to parse parameters from tool call content
      let parameters = {};
      try {
        // Simple parameter extraction from tool call content
        const paramMatch = toolCall.content.match(/\{[\s\S]*\}/);
        if (paramMatch) {
          parameters = JSON.parse(paramMatch[0]);
        }
      } catch (e) {
        console.warn('Could not parse parameters from tool call');
      }

      const result = await executeToolMutation.mutateAsync({
        tool_name: toolCall.tool_name,
        parameters
      });

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
    } catch (error) {
      console.error('Failed to get tool result:', error);
    }
    
    setIsLoading(false);
  };

  const getAllResults = async () => {
    setIsLoading(true);
    
    // Collect all tool calls
    const toolCalls: Array<{messageId: string, contentIndex: number, toolCall: any}> = [];
    
    currentExample.messages.forEach(msg => {
      msg.content.forEach((messageContent, index) => {
        if (messageContent.type === 'tool_call' && messageContent.tool_name && messageContent.tool_id) {
          toolCalls.push({
            messageId: msg.id,
            contentIndex: index,
            toolCall: messageContent
          });
        }
      });
    });

    try {
      // Execute all tool calls
      const results = await Promise.all(
        toolCalls.map(async ({ toolCall }) => {
          try {
            let parameters = {};
            try {
              const paramMatch = toolCall.content.match(/\{[\s\S]*\}/);
              if (paramMatch) {
                parameters = JSON.parse(paramMatch[0]);
              }
            } catch (e) {
              console.warn('Could not parse parameters from tool call');
            }

            const result = await executeToolMutation.mutateAsync({
              tool_name: toolCall.tool_name,
              parameters
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
      console.error('Failed to get all tool results:', error);
    }
    
    setIsLoading(false);
  };

  const goBack = () => {
    if (currentExample.messages.length > 0) {
      setCurrentExample(prev => ({
        ...prev,
        messages: prev.messages.slice(0, -1)
      }));
    }
  };

  const submitExample = async () => {
    try {
      const apiExample = convertToApiFormat(currentExample);
      
      if (currentExample.id === 'new') {
        await createExampleMutation.mutateAsync(apiExample);
      } else {
        await updateExampleMutation.mutateAsync({
          exampleId: currentExample.id,
          example: apiExample
        });
      }
    } catch (error) {
      console.error('Error submitting example:', error);
      // Fallback to download if API fails
      const dataStr = JSON.stringify(currentExample, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `training_example_${Date.now()}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
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
        id: `auto_${Date.now()}`,
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
  const canSubmit = validationErrors.length === 0 && currentExample.messages.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      <Sidebar 
        tools={availableTools}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-80'} flex flex-col`}>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6 max-w-6xl mx-auto pb-32">
              <ExampleHeader 
                example={currentExample}
                onExampleChange={setCurrentExample}
                onLoad={loadExample}
                onAutoGenerate={autoGenerateExample}
                isLoading={isLoading || createExampleMutation.isPending || updateExampleMutation.isPending}
              />
              
              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <Card className="mt-6 border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <h3 className="font-medium text-red-800">Validation Errors</h3>
                    </div>
                    <ul className="text-sm text-red-700 space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              
              <div className="grid gap-6 mt-6">
                <div className="space-y-4">
                  {currentExample.messages.map((message, index) => (
                    <MessageBuilder
                      key={message.id}
                      message={message}
                      isSelected={selectedMessageId === message.id}
                      onSelect={() => setSelectedMessageId(message.id)}
                      onUpdate={(updatedMessage) => {
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
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Turn
                          </Button>
                          <Button 
                            onClick={autoGenerateExample}
                            variant="outline"
                            disabled={isLoading}
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

        {/* Fixed Action Bar */}
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
                onClick={getAllResults}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Get All Results
              </Button>
              
              <Button 
                onClick={goBack}
                variant="outline"
                disabled={currentExample.messages.length === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              <Button 
                onClick={submitExample}
                disabled={!canSubmit || createExampleMutation.isPending || updateExampleMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700 ml-auto"
              >
                <Download className="w-4 h-4 mr-2" />
                {createExampleMutation.isPending || updateExampleMutation.isPending ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ToolTrainer;
