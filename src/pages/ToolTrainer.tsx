import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, Play, Plus, X, Save, Download, Upload } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

// Import components
import { NavigationHeader } from '@/components/ToolTrainer/NavigationHeader';
import { SaveToDatabase } from '@/components/ToolTrainer/SaveToDatabase';
import { RetrieveExample } from '@/components/ToolTrainer/RetrieveExample';
import { EditExample } from '@/components/ToolTrainer/EditExample';
import { SavedConversations } from '@/components/ToolTrainer/SavedConversations';
import { EmptyState } from '@/components/ToolTrainer/EmptyState';

// Import types
import { Content, Chunk, ChunkKind, Role, Example, ToolCall, ChunkMetadata, Trainable } from '@/types/toolTrainer';

const ToolTrainer = () => {
  const { toast } = useToast();
  
  // State for conversation
  const [conversation, setConversation] = useState<Content[]>([]);
  const [currentTurn, setCurrentTurn] = useState<'user' | 'assistant'>('user');
  const [currentExample, setCurrentExample] = useState<Example>({
    id: 1,
    name: 'New Example',
    description: '',
    messages: [],
    created_at: new Date().toISOString(),
    meta: { tags: [] }
  });
  
  // State for current tool call being created
  const [toolName, setToolName] = useState('');
  const [parameters, setParameters] = useState('{}');
  const [pythonCode, setPythonCode] = useState('');
  const [toolResult, setToolResult] = useState('');
  
  // State for text input
  const [textInput, setTextInput] = useState('');
  
  // UI state
  const [activeTab, setActiveTab] = useState('conversation');
  const [isExecuting, setIsExecuting] = useState(false);

  // Helper function to find the last assistant message or create a new one
  const getOrCreateAssistantMessage = useCallback(() => {
    const lastMessage = conversation[conversation.length - 1];
    
    // If the last message is from assistant, return its index
    if (lastMessage && lastMessage.chunks.some(chunk => chunk.role === Role.ASSISTANT)) {
      return conversation.length - 1;
    }
    
    // Otherwise, create a new assistant message
    const newAssistantMessage: Content = {
      chunks: []
    };
    
    setConversation(prev => [...prev, newAssistantMessage]);
    return conversation.length; // Return the index of the new message
  }, [conversation]);

  // Add a text chunk
  const addTextChunk = useCallback((text: string, role: Role) => {
    if (!text.trim()) return;

    const newChunk: Chunk = {
      file: null,
      kind: ChunkKind.TEXT,
      role,
      text: text.trim(),
      audio: null,
      image: null,
      video: null,
      channel: '',
      control: null,
      metadata: {
        tool: null,
        safety: null,
        finish_reason: null
      } as ChunkMetadata,
      mimetype: '',
      json_data: null,
      trainable: Trainable.INCLUDE
    };

    if (role === Role.USER) {
      // User messages always create new Content objects
      const newContent: Content = {
        chunks: [newChunk]
      };
      setConversation(prev => [...prev, newContent]);
    } else {
      // Assistant messages get added to existing assistant message or create new one
      const assistantMessageIndex = getOrCreateAssistantMessage();
      setConversation(prev => {
        const updated = [...prev];
        updated[assistantMessageIndex] = {
          ...updated[assistantMessageIndex],
          chunks: [...updated[assistantMessageIndex].chunks, newChunk]
        };
        return updated;
      });
    }

    setTextInput('');
  }, [getOrCreateAssistantMessage]);

  // Add a tool call chunk
  const addToolCall = useCallback(() => {
    if (!toolName.trim()) {
      toast({
        title: "Error",
        description: "Tool name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      // Validate parameters JSON
      JSON.parse(parameters);
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid JSON in parameters",
        variant: "destructive"
      });
      return;
    }

    const toolCallData: ToolCall = {
      tool_name: toolName,
      parameters: JSON.parse(parameters),
      python_code: pythonCode
    };

    const toolCallChunk: Chunk = {
      file: null,
      kind: ChunkKind.TOOL_CALL,
      role: Role.ASSISTANT,
      text: JSON.stringify(toolCallData),
      audio: null,
      image: null,
      video: null,
      channel: '',
      control: null,
      metadata: {
        tool: null,
        safety: null,
        finish_reason: null
      } as ChunkMetadata,
      mimetype: '',
      json_data: null,
      trainable: Trainable.INCLUDE
    };

    // Add to existing assistant message or create new one
    const assistantMessageIndex = getOrCreateAssistantMessage();
    setConversation(prev => {
      const updated = [...prev];
      updated[assistantMessageIndex] = {
        ...updated[assistantMessageIndex],
        chunks: [...updated[assistantMessageIndex].chunks, toolCallChunk]
      };
      return updated;
    });

    // Reset form
    setToolName('');
    setParameters('{}');
    setPythonCode('');
    
    toast({
      title: "Success",
      description: "Tool call added successfully"
    });
  }, [toolName, parameters, pythonCode, getOrCreateAssistantMessage, toast]);

  // Add a tool result chunk
  const addToolResult = useCallback(() => {
    if (!toolResult.trim()) {
      toast({
        title: "Error",
        description: "Tool result is required",
        variant: "destructive"
      });
      return;
    }

    const toolResultChunk: Chunk = {
      file: null,
      kind: ChunkKind.TOOL_RESULT,
      role: Role.ASSISTANT,
      text: toolResult.trim(),
      audio: null,
      image: null,
      video: null,
      channel: '',
      control: null,
      metadata: {
        tool: null,
        safety: null,
        finish_reason: null
      } as ChunkMetadata,
      mimetype: '',
      json_data: null,
      trainable: Trainable.INCLUDE
    };

    // Add to existing assistant message or create new one
    const assistantMessageIndex = getOrCreateAssistantMessage();
    setConversation(prev => {
      const updated = [...prev];
      updated[assistantMessageIndex] = {
        ...updated[assistantMessageIndex],
        chunks: [...updated[assistantMessageIndex].chunks, toolResultChunk]
      };
      return updated;
    });

    setToolResult('');
    
    toast({
      title: "Success",
      description: "Tool result added successfully"
    });
  }, [toolResult, getOrCreateAssistantMessage, toast]);

  // Execute a single tool call
  const executeTool = useCallback(async (toolCall: ToolCall) => {
    try {
      setIsExecuting(true);
      
      // Add tool call chunk to assistant message
      const toolCallChunk: Chunk = {
        file: null,
        kind: ChunkKind.TOOL_CALL,
        role: Role.ASSISTANT,
        text: JSON.stringify(toolCall),
        audio: null,
        image: null,
        video: null,
        channel: '',
        control: null,
        metadata: {
          tool: null,
          safety: null,
          finish_reason: null
        } as ChunkMetadata,
        mimetype: '',
        json_data: null,
        trainable: Trainable.INCLUDE
      };

      // Get or create assistant message and add the tool call
      const assistantMessageIndex = getOrCreateAssistantMessage();
      setConversation(prev => {
        const updated = [...prev];
        updated[assistantMessageIndex] = {
          ...updated[assistantMessageIndex],
          chunks: [...updated[assistantMessageIndex].chunks, toolCallChunk]
        };
        return updated;
      });

      // Execute the tool and get result
      const response = await fetch('/api/tools/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toolCall)
      });

      if (!response.ok) {
        throw new Error('Tool execution failed');
      }

      const result = await response.text();

      // Add tool result chunk to the same assistant message
      const toolResultChunk: Chunk = {
        file: null,
        kind: ChunkKind.TOOL_RESULT,
        role: Role.ASSISTANT,
        text: result,
        audio: null,
        image: null,
        video: null,
        channel: '',
        control: null,
        metadata: {
          tool: null,
          safety: null,
          finish_reason: null
        } as ChunkMetadata,
        mimetype: '',
        json_data: null,
        trainable: Trainable.INCLUDE
      };

      setConversation(prev => {
        const updated = [...prev];
        updated[assistantMessageIndex] = {
          ...updated[assistantMessageIndex],
          chunks: [...updated[assistantMessageIndex].chunks, toolResultChunk]
        };
        return updated;
      });

      toast({
        title: "Success",
        description: "Tool executed successfully"
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Add error as a tool result chunk to the same assistant message
      const errorChunk: Chunk = {
        file: null,
        kind: ChunkKind.TOOL_RESULT,
        role: Role.ASSISTANT,
        text: `Error: ${errorMessage}`,
        audio: null,
        image: null,
        video: null,
        channel: '',
        control: null,
        metadata: {
          tool: null,
          safety: null,
          finish_reason: null
        } as ChunkMetadata,
        mimetype: '',
        json_data: null,
        trainable: Trainable.INCLUDE
      };

      const assistantMessageIndex = getOrCreateAssistantMessage();
      setConversation(prev => {
        const updated = [...prev];
        updated[assistantMessageIndex] = {
          ...updated[assistantMessageIndex],
          chunks: [...updated[assistantMessageIndex].chunks, errorChunk]
        };
        return updated;
      });

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  }, [getOrCreateAssistantMessage, toast]);

  // Execute all tool calls in sequence
  const executeAllToolCalls = useCallback(async () => {
    const toolCalls: ToolCall[] = [];
    
    // Extract all tool calls from the conversation
    conversation.forEach(content => {
      content.chunks.forEach(chunk => {
        if (chunk.kind === ChunkKind.TOOL_CALL) {
          try {
            const toolCall = JSON.parse(chunk.text) as ToolCall;
            toolCalls.push(toolCall);
          } catch (error) {
            console.error('Failed to parse tool call:', error);
          }
        }
      });
    });

    if (toolCalls.length === 0) {
      toast({
        title: "No tool calls found",
        description: "Add some tool calls first",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsExecuting(true);
      
      // Collect all chunks that will be added to a single assistant message
      const assistantChunks: Chunk[] = [];

      for (const toolCall of toolCalls) {
        // Add tool call chunk
        const toolCallChunk: Chunk = {
          file: null,
          kind: ChunkKind.TOOL_CALL,
          role: Role.ASSISTANT,
          text: JSON.stringify(toolCall),
          audio: null,
          image: null,
          video: null,
          channel: '',
          control: null,
          metadata: {
            tool: null,
            safety: null,
            finish_reason: null
          } as ChunkMetadata,
          mimetype: '',
          json_data: null,
          trainable: Trainable.INCLUDE
        };
        assistantChunks.push(toolCallChunk);

        try {
          // Execute the tool
          const response = await fetch('/api/tools/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(toolCall)
          });

          if (!response.ok) {
            throw new Error(`Tool execution failed: ${response.statusText}`);
          }

          const result = await response.text();

          // Add tool result chunk
          const toolResultChunk: Chunk = {
            file: null,
            kind: ChunkKind.TOOL_RESULT,
            role: Role.ASSISTANT,
            text: result,
            audio: null,
            image: null,
            video: null,
            channel: '',
            control: null,
            metadata: {
              tool: null,
              safety: null,
              finish_reason: null
            } as ChunkMetadata,
            mimetype: '',
            json_data: null,
            trainable: Trainable.INCLUDE
          };
          assistantChunks.push(toolResultChunk);

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          
          // Add error as tool result chunk
          const errorChunk: Chunk = {
            file: null,
            kind: ChunkKind.TOOL_RESULT,
            role: Role.ASSISTANT,
            text: `Error: ${errorMessage}`,
            audio: null,
            image: null,
            video: null,
            channel: '',
            control: null,
            metadata: {
              tool: null,
              safety: null,
              finish_reason: null
            } as ChunkMetadata,
            mimetype: '',
            json_data: null,
            trainable: Trainable.INCLUDE
          };
          assistantChunks.push(errorChunk);
        }
      }

      // Add all chunks to a single assistant message
      const newAssistantMessage: Content = {
        chunks: assistantChunks
      };

      setConversation(prev => [...prev, newAssistantMessage]);

      toast({
        title: "Success",
        description: `Executed ${toolCalls.length} tool calls`
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to execute tool calls",
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  }, [conversation, toast]);

  // Remove a chunk from conversation
  const removeChunk = useCallback((contentIndex: number, chunkIndex: number) => {
    setConversation(prev => {
      const updated = [...prev];
      updated[contentIndex] = {
        ...updated[contentIndex],
        chunks: updated[contentIndex].chunks.filter((_, index) => index !== chunkIndex)
      };
      
      // Remove empty content objects
      return updated.filter(content => content.chunks.length > 0);
    });
  }, []);

  // Clear conversation
  const clearConversation = useCallback(() => {
    setConversation([]);
    setCurrentTurn('user');
  }, []);

  // Load example conversation
  const loadExample = useCallback((example: Example) => {
    setConversation(example.messages || []);
    setCurrentExample(example);
    toast({
      title: "Success",
      description: "Example loaded successfully"
    });
  }, [toast]);

  // Update current example when conversation changes
  React.useEffect(() => {
    setCurrentExample(prev => ({
      ...prev,
      messages: conversation
    }));
  }, [conversation]);

  // Get role color for display
  const getRoleColor = (role: Role) => {
    switch (role) {
      case Role.USER:
        return 'bg-blue-100 text-blue-800';
      case Role.ASSISTANT:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get chunk kind label
  const getChunkKindLabel = (kind: ChunkKind) => {
    switch (kind) {
      case ChunkKind.TEXT:
        return 'Text';
      case ChunkKind.TOOL_CALL:
        return 'Tool Call';
      case ChunkKind.TOOL_RESULT:
        return 'Tool Result';
      default:
        return 'Unknown';
    }
  };

  // Generate assistant response summary
  const generateAssistantResponse = useCallback(() => {
    const assistantChunks: string[] = [];
    
    conversation.forEach(content => {
      content.chunks.forEach(chunk => {
        if (chunk.role === Role.ASSISTANT) {
          if (chunk.kind === ChunkKind.TEXT) {
            assistantChunks.push(chunk.text);
          } else if (chunk.kind === ChunkKind.TOOL_CALL) {
            try {
              const toolCall = JSON.parse(chunk.text) as ToolCall;
              assistantChunks.push(`Called ${toolCall.tool_name} with parameters: ${JSON.stringify(toolCall.parameters)}`);
            } catch (error) {
              assistantChunks.push('Invalid tool call');
            }
          } else if (chunk.kind === ChunkKind.TOOL_RESULT) {
            assistantChunks.push(`Result: ${chunk.text}`);
          }
        }
      });
    });
    
    return assistantChunks.join(' ');
  }, [conversation]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <NavigationHeader 
        currentExample={currentExample}
        onNavigatePrevious={() => setCurrentExample(prev => ({ ...prev, id: Math.max(1, prev.id - 1) }))}
        onNavigateNext={() => setCurrentExample(prev => ({ ...prev, id: prev.id + 1 }))}
        onLoadConversation={loadExample}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="conversation">Conversation</TabsTrigger>
          <TabsTrigger value="save">Save</TabsTrigger>
          <TabsTrigger value="retrieve">Retrieve</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
        </TabsList>

        <TabsContent value="conversation" className="space-y-4">
          {conversation.length === 0 ? (
            <EmptyState 
              isLoading={isExecuting}
              onAddNewTurn={() => setCurrentTurn('user')}
              onAutoGenerate={() => executeAllToolCalls()}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Conversation ({conversation.length} messages)</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {conversation.map((content, contentIndex) => (
                      <div key={contentIndex} className="border rounded-lg p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Message {contentIndex + 1}</h4>
                          <Badge variant="outline">{content.chunks.length} chunks</Badge>
                        </div>
                        <div className="space-y-2">
                          {content.chunks.map((chunk, chunkIndex) => (
                            <div key={chunkIndex} className="border rounded p-3 bg-gray-50">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex gap-2">
                                  <Badge className={getRoleColor(chunk.role)}>
                                    {chunk.role === Role.USER ? 'User' : 'Assistant'}
                                  </Badge>
                                  <Badge variant="secondary">
                                    {getChunkKindLabel(chunk.kind)}
                                  </Badge>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeChunk(contentIndex, chunkIndex)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="text-sm">
                                {chunk.kind === ChunkKind.TOOL_CALL ? (
                                  <pre className="bg-blue-50 p-2 rounded text-xs overflow-x-auto">
                                    {JSON.stringify(JSON.parse(chunk.text), null, 2)}
                                  </pre>
                                ) : (
                                  <p className="whitespace-pre-wrap">{chunk.text}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Input Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Text Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Add Text
                  <Select value={currentTurn} onValueChange={(value: 'user' | 'assistant') => setCurrentTurn(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="assistant">Assistant</SelectItem>
                    </SelectContent>
                  </Select>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter text message..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  rows={3}
                />
                <Button 
                  onClick={() => addTextChunk(textInput, currentTurn === 'user' ? Role.USER : Role.ASSISTANT)}
                  disabled={!textInput.trim()}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Text
                </Button>
              </CardContent>
            </Card>

            {/* Tool Call Input */}
            <Card>
              <CardHeader>
                <CardTitle>Add Tool Call</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Tool name (e.g., get_weather)"
                  value={toolName}
                  onChange={(e) => setToolName(e.target.value)}
                />
                <Textarea
                  placeholder="Parameters (JSON format)"
                  value={parameters}
                  onChange={(e) => setParameters(e.target.value)}
                  rows={2}
                />
                <Textarea
                  placeholder="Python code (optional)"
                  value={pythonCode}
                  onChange={(e) => setPythonCode(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={addToolCall}
                    disabled={!toolName.trim()}
                    className="flex-1"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Call
                  </Button>
                  <Button 
                    onClick={() => executeTool({ tool_name: toolName, parameters: JSON.parse(parameters || '{}'), python_code: pythonCode })}
                    disabled={!toolName.trim() || isExecuting}
                    variant="outline"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Execute
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tool Result Input */}
            <Card>
              <CardHeader>
                <CardTitle>Add Tool Result</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Tool execution result..."
                  value={toolResult}
                  onChange={(e) => setToolResult(e.target.value)}
                  rows={4}
                />
                <Button 
                  onClick={addToolResult}
                  disabled={!toolResult.trim()}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Result
                </Button>
              </CardContent>
            </Card>

            {/* Execute All */}
            <Card>
              <CardHeader>
                <CardTitle>Batch Operations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={executeAllToolCalls}
                  disabled={isExecuting}
                  className="w-full"
                  variant="outline"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isExecuting ? 'Executing...' : 'Execute All Tool Calls'}
                </Button>
                <Button 
                  onClick={clearConversation}
                  variant="destructive"
                  className="w-full"
                >
                  Clear Conversation
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="save">
          <SaveToDatabase 
            messages={conversation}
            tags={currentExample.meta?.tags || []}
            exampleName={currentExample.name}
          />
        </TabsContent>

        <TabsContent value="retrieve">
          <RetrieveExample onExampleRetrieved={loadExample} />
        </TabsContent>

        <TabsContent value="edit">
          <EditExample 
            currentExample={currentExample}
            onExampleUpdated={loadExample}
          />
        </TabsContent>

        <TabsContent value="saved">
          <SavedConversations onLoadConversation={loadExample} />
        </TabsContent>
      </Tabs>

      {isExecuting && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Executing tool calls... Please wait.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ToolTrainer;
