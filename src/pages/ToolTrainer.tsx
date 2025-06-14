
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ConnectionStatus } from '@/components/ui/connection-status';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { ErrorDisplay } from '@/components/ui/error-display';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Trash2, 
  Play, 
  Save, 
  Settings, 
  Code, 
  MessageSquare, 
  User, 
  Bot,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';
import { useTools, useExecuteTool, useExecuteToolResult, useExecuteAllTools } from '@/hooks/useApi';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useToast } from '@/hooks/use-toast';
import { Tool, ToolCall, Message, ConversationState } from '@/types/toolTrainer';

const ToolTrainer = () => {
  const [conversation, setConversation] = useState<ConversationState>({
    id: '',
    title: '',
    messages: [],
    toolCalls: [],
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const [activeTab, setActiveTab] = useState('conversation');
  const [isExecuting, setIsExecuting] = useState(false);
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  const { data: tools, isLoading: toolsLoading, error: toolsError, refetch: refetchTools } = useTools();
  const executeTool = useExecuteTool();
  const executeToolResult = useExecuteToolResult();
  const executeAllTools = useExecuteAllTools();
  const { errors, addError, removeError, clearErrors } = useErrorHandler();
  const { toast } = useToast();

  const isConnected = !toolsError;

  const handleRetryConnection = () => {
    refetchTools();
  };

  const addMessage = () => {
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: '',
      timestamp: new Date()
    };
    setConversation(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));
  };

  const addToolCall = () => {
    if (!tools || tools.length === 0) {
      toast({
        title: 'No Tools Available',
        description: 'Please ensure your backend is running and tools are available.',
        variant: 'destructive',
      });
      return;
    }

    const newToolCall: ToolCall = {
      id: `tool_${Date.now()}`,
      toolName: tools[0].tool_name || tools[0].name,
      parameters: {},
      result: null,
      status: 'pending',
      timestamp: new Date()
    };
    setConversation(prev => ({
      ...prev,
      toolCalls: [...prev.toolCalls, newToolCall]
    }));
  };

  const updateMessage = (messageId: string, updates: Partial<Message>) => {
    setConversation(prev => ({
      ...prev,
      messages: prev.messages.map(msg => 
        msg.id === messageId ? { ...msg, ...updates } : msg
      )
    }));
  };

  const updateToolCall = (toolCallId: string, updates: Partial<ToolCall>) => {
    setConversation(prev => ({
      ...prev,
      toolCalls: prev.toolCalls.map(call => 
        call.id === toolCallId ? { ...call, ...updates } : call
      )
    }));
  };

  const deleteMessage = (messageId: string) => {
    setConversation(prev => ({
      ...prev,
      messages: prev.messages.filter(msg => msg.id !== messageId)
    }));
  };

  const deleteToolCall = (toolCallId: string) => {
    setConversation(prev => ({
      ...prev,
      toolCalls: prev.toolCalls.filter(call => call.id !== toolCallId)
    }));
  };

  const executeToolCall = async (toolCall: ToolCall) => {
    if (!isConnected) {
      toast({
        title: 'Backend Disconnected',
        description: 'Cannot execute tools without backend connection.',
        variant: 'destructive',
      });
      return;
    }

    setIsExecuting(true);
    updateToolCall(toolCall.id, { status: 'executing' });

    try {
      const result = await executeTool.mutateAsync({
        tool_name: toolCall.toolName,
        parameters: toolCall.parameters
      });

      updateToolCall(toolCall.id, {
        result: result,
        status: 'completed'
      });

      toast({
        title: 'Tool Executed',
        description: `Successfully executed ${toolCall.toolName}`,
      });
    } catch (error) {
      updateToolCall(toolCall.id, {
        result: { error: error instanceof Error ? error.message : 'Unknown error' },
        status: 'failed'
      });
      
      addError({
        message: `Failed to execute ${toolCall.toolName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
        field: toolCall.id
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const executeAllToolCalls = async () => {
    if (!isConnected) {
      toast({
        title: 'Backend Disconnected',
        description: 'Cannot execute tools without backend connection.',
        variant: 'destructive',
      });
      return;
    }

    const pendingToolCalls = conversation.toolCalls.filter(call => call.status === 'pending');
    if (pendingToolCalls.length === 0) {
      toast({
        title: 'No Pending Tools',
        description: 'All tools have already been executed or there are no tools to execute.',
      });
      return;
    }

    setIsExecuting(true);
    
    try {
      const toolCallsData = {
        code_chunks: pendingToolCalls.map((call, index) => ({
          chunk_id: index,
          code: `# Execute ${call.toolName} with parameters: ${JSON.stringify(call.parameters)}`
        }))
      };

      const results = await executeAllTools.mutateAsync(toolCallsData);

      // Update tool calls with results
      if (results.code_chunk_output) {
        results.code_chunk_output.forEach((result, index) => {
          const toolCall = pendingToolCalls[index];
          updateToolCall(toolCall.id, {
            result: result.code_output,
            status: result.code_output.error ? 'failed' : 'completed'
          });
        });

        toast({
          title: 'Tools Executed',
          description: `Successfully executed ${results.code_chunk_output.length} tools`,
        });
      }
    } catch (error) {
      pendingToolCalls.forEach(call => {
        updateToolCall(call.id, {
          result: { error: error instanceof Error ? error.message : 'Unknown error' },
          status: 'failed'
        });
      });
      
      addError({
        message: `Failed to execute tools: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error'
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [id]: false }));
      }, 2000);
      
      toast({
        title: 'Copied!',
        description: 'Content copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const renderMessage = (message: Message) => (
    <Card key={message.id} className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {message.role === 'user' ? (
              <User className="w-4 h-4" />
            ) : (
              <Bot className="w-4 h-4" />
            )}
            <Badge variant={message.role === 'user' ? 'default' : 'secondary'}>
              {message.role}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteMessage(message.id)}
            className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Textarea
          value={message.content}
          onChange={(e) => updateMessage(message.id, { content: e.target.value })}
          placeholder="Enter message content..."
          className="min-h-[100px]"
        />
      </CardContent>
    </Card>
  );

  const renderToolCall = (toolCall: ToolCall) => {
    const tool = tools?.find(t => (t.tool_name || t.name) === toolCall.toolName);
    
    return (
      <Card key={toolCall.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              <Badge variant="outline">{toolCall.toolName}</Badge>
              <Badge 
                variant={
                  toolCall.status === 'completed' ? 'default' :
                  toolCall.status === 'failed' ? 'destructive' :
                  toolCall.status === 'executing' ? 'secondary' : 'outline'
                }
              >
                {toolCall.status}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => executeToolCall(toolCall)}
                disabled={isExecuting || !isConnected}
                className="h-6 w-6 p-0"
              >
                <Play className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteToolCall(toolCall.id)}
                className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Tool</label>
            <Select
              value={toolCall.toolName}
              onValueChange={(value) => updateToolCall(toolCall.id, { toolName: value, parameters: {} })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tools?.map(tool => (
                  <SelectItem key={tool.tool_name || tool.name} value={tool.tool_name || tool.name}>
                    {tool.tool_name || tool.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Parameters (JSON)</label>
            <Textarea
              value={JSON.stringify(toolCall.parameters, null, 2)}
              onChange={(e) => {
                try {
                  const params = JSON.parse(e.target.value);
                  updateToolCall(toolCall.id, { parameters: params });
                } catch (error) {
                  // Invalid JSON, don't update
                }
              }}
              placeholder='{"key": "value"}'
              className="font-mono text-sm"
            />
          </div>

          {toolCall.result && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Result</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(JSON.stringify(toolCall.result, null, 2), toolCall.id)}
                  className="h-6 w-6 p-0"
                >
                  {copiedStates[toolCall.id] ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
              <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                {JSON.stringify(toolCall.result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tool Trainer</h1>
          <p className="text-gray-600">Create and test tool-calling conversations</p>
        </div>

        <div className="mb-4">
          <ConnectionStatus 
            isConnected={isConnected}
            isLoading={toolsLoading}
            onRetry={handleRetryConnection}
          />
        </div>

        <ErrorDisplay 
          errors={errors}
          onDismiss={removeError}
          className="mb-4"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Conversation Builder</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={executeAllToolCalls}
                      disabled={isExecuting || !isConnected}
                    >
                      {isExecuting ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      Execute All
                    </Button>
                    <Button variant="outline" size="sm">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="conversation">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Messages
                    </TabsTrigger>
                    <TabsTrigger value="tools">
                      <Code className="w-4 h-4 mr-2" />
                      Tool Calls
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="conversation" className="mt-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Messages</h3>
                        <Button onClick={addMessage} size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Message
                        </Button>
                      </div>
                      
                      <ScrollArea className="h-[600px]">
                        <div className="pr-4">
                          {conversation.messages.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              No messages yet. Click "Add Message" to start building your conversation.
                            </div>
                          ) : (
                            conversation.messages.map(renderMessage)
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </TabsContent>

                  <TabsContent value="tools" className="mt-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Tool Calls</h3>
                        <Button 
                          onClick={addToolCall} 
                          size="sm"
                          disabled={!isConnected || !tools || tools.length === 0}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Tool Call
                        </Button>
                      </div>
                      
                      <ScrollArea className="h-[600px]">
                        <div className="pr-4">
                          {conversation.toolCalls.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              No tool calls yet. Click "Add Tool Call" to start testing tools.
                            </div>
                          ) : (
                            conversation.toolCalls.map(renderToolCall)
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Available Tools</CardTitle>
              </CardHeader>
              <CardContent>
                {toolsLoading ? (
                  <div className="text-center py-4">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Loading tools...</p>
                  </div>
                ) : !isConnected ? (
                  <div className="text-center py-4">
                    <Alert>
                      <AlertDescription>
                        Backend disconnected. Using mock data for development.
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : tools && tools.length > 0 ? (
                  <div className="space-y-2">
                    {tools.map(tool => (
                      <div key={tool.tool_name || tool.name} className="p-3 border rounded-lg">
                        <div className="font-medium text-sm">{tool.tool_name || tool.name}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {tool.functions?.[0]?.func_name || 'No description available'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No tools available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <LoadingOverlay 
          isLoading={isExecuting}
          message="Executing tools..."
        />
      </div>
    </div>
  );
};

export default ToolTrainer;
