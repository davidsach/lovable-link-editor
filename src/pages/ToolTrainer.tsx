
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Play, User, Bot, Wrench, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import { useTools, useExecuteTool } from '@/hooks/useApi';
import { ToolCallEditor } from '@/components/ToolTrainer/ToolCallEditor';
import { SaveToDatabase } from '@/components/ToolTrainer/SaveToDatabase';
import { RetrieveExample } from '@/components/ToolTrainer/RetrieveExample';
import { EditExample } from '@/components/ToolTrainer/EditExample';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ToolCall {
  id: string;
  toolName: string;
  parameters: Record<string, any>;
  result: any;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  timestamp: Date;
}

interface ExampleData {
  id: string;
  name: string;
  description: string;
  tags: string[];
  user_prompt: string;
  steps: Array<{
    thought: string;
    tool_name: string;
    tool_params: Record<string, any>;
    tool_result: string;
  }>;
  created: string;
  updated: string;
}

const ToolTrainer = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [currentExample, setCurrentExample] = useState<ExampleData | null>(null);

  const { data: tools, isLoading: toolsLoading, error: toolsError } = useTools();
  const executeToolMutation = useExecuteTool();

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const message: Message = {
      id: `msg_${Date.now()}`,
      role,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    addMessage('user', newMessage.trim());
    setNewMessage('');
    
    // Simulate assistant response
    setTimeout(() => {
      addMessage('assistant', 'I understand your request. Let me help you with that using the available tools.');
    }, 1000);
  };

  const handleToolExecution = (toolName: string, parameters: Record<string, any>) => {
    const toolCall: ToolCall = {
      id: `tool_${Date.now()}`,
      toolName,
      parameters,
      result: null,
      status: 'executing',
      timestamp: new Date()
    };
    
    setToolCalls(prev => [...prev, toolCall]);
    
    executeToolMutation.mutate(
      { tool_name: toolName, parameters },
      {
        onSuccess: (result) => {
          setToolCalls(prev => 
            prev.map(tc => 
              tc.id === toolCall.id 
                ? { ...tc, result, status: 'completed' }
                : tc
            )
          );
        },
        onError: (error) => {
          setToolCalls(prev => 
            prev.map(tc => 
              tc.id === toolCall.id 
                ? { ...tc, result: error.message, status: 'failed' }
                : tc
            )
          );
        }
      }
    );
  };

  const handleExampleLoaded = (example: ExampleData) => {
    setCurrentExample(example);
    
    // Clear current conversation
    setMessages([]);
    setToolCalls([]);
    
    // Load the example data
    addMessage('user', example.user_prompt);
    
    // Simulate loading steps as tool calls
    example.steps.forEach((step, index) => {
      setTimeout(() => {
        const toolCall: ToolCall = {
          id: `tool_${Date.now()}_${index}`,
          toolName: step.tool_name,
          parameters: step.tool_params,
          result: step.tool_result,
          status: 'completed',
          timestamp: new Date()
        };
        setToolCalls(prev => [...prev, toolCall]);
      }, (index + 1) * 500);
    });
  };

  const handleExampleUpdated = (example: ExampleData) => {
    setCurrentExample(example);
  };

  const getConversationData = () => {
    const userPrompt = messages.find(m => m.role === 'user')?.content || '';
    const assistantMessage = messages.find(m => m.role === 'assistant')?.content || '';
    
    return {
      userPrompt,
      assistantMessage,
      toolCalls: toolCalls.map(tc => ({
        toolName: tc.toolName,
        parameters: tc.parameters,
        result: tc.result
      }))
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar - Available Tools */}
      <div className={`bg-white border-r transition-all duration-300 ${
        isLeftSidebarCollapsed ? 'w-16' : 'w-80'
      }`}>
        <div className="p-4 border-b flex items-center justify-between">
          <div className={`${isLeftSidebarCollapsed ? 'hidden' : 'block'}`}>
            <h2 className="font-semibold text-lg">Available Tools</h2>
            <p className="text-sm text-gray-600">Click a tool to use it</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
          >
            {isLeftSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
        
        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="p-4 space-y-3">
            {toolsLoading && (
              <div className="text-center text-gray-500">Loading tools...</div>
            )}
            
            {toolsError && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load tools. Please check your backend connection.
                </AlertDescription>
              </Alert>
            )}
            
            {tools && tools.map((tool) => (
              <Card 
                key={tool.tool_name}
                className={`cursor-pointer transition-colors hover:bg-blue-50 ${
                  selectedTool === tool.tool_name ? 'ring-2 ring-blue-500' : ''
                } ${isLeftSidebarCollapsed ? 'p-2' : ''}`}
                onClick={() => setSelectedTool(tool.tool_name)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className={`text-sm ${isLeftSidebarCollapsed ? 'hidden' : 'block'}`}>
                    {tool.tool_name}
                  </CardTitle>
                  {isLeftSidebarCollapsed && (
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <Wrench className="w-4 h-4 text-blue-600" />
                    </div>
                  )}
                </CardHeader>
                {!isLeftSidebarCollapsed && (
                  <CardContent className="pt-0">
                    <p className="text-xs text-gray-600 mb-2">{tool.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {tool.functions?.slice(0, 2).map((func) => (
                        <Badge key={func.func_name} variant="outline" className="text-xs">
                          {func.func_name}
                        </Badge>
                      ))}
                      {tool.functions && tool.functions.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{tool.functions.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="outline" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Link to="/toy-examples">
                <Button variant="outline" size="sm">
                  Manage Examples
                </Button>
              </Link>
              <h1 className="text-xl font-semibold">Tool Training Interface</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <SaveToDatabase conversationData={getConversationData()} />
              <RetrieveExample onExampleLoaded={handleExampleLoaded} />
              <EditExample 
                example={currentExample} 
                onExampleUpdated={handleExampleUpdated} 
              />
            </div>
          </div>
          
          {currentExample && (
            <div className="mt-2 p-2 bg-blue-50 rounded border">
              <div className="text-sm">
                <strong>Current Example:</strong> {currentExample.name}
                {currentExample.description && (
                  <span className="text-gray-600"> - {currentExample.description}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Conversation Area */}
        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Messages Column */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Conversation
                  <Badge variant="outline">{messages.length} messages</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 mb-4 border rounded p-4">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        Start a conversation by typing a message below
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div className={`flex gap-2 max-w-[80%] ${
                            message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                          }`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              message.role === 'user' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                            </div>
                            <div className={`p-3 rounded-lg ${
                              message.role === 'user'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              <p className="text-sm">{message.content}</p>
                              <p className="text-xs mt-1 opacity-70">
                                {message.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
                
                <div className="flex gap-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="flex-1"
                    rows={2}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Play className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tool Calls Column */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Tool Calls
                  <Badge variant="outline">{toolCalls.length} calls</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 mb-4 border rounded p-4">
                  <div className="space-y-4">
                    {toolCalls.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        No tool calls yet. Use the tool editor below to make calls.
                      </div>
                    ) : (
                      toolCalls.map((toolCall) => (
                        <div key={toolCall.id} className="border rounded p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{toolCall.toolName}</h4>
                            <Badge 
                              variant={
                                toolCall.status === 'completed' ? 'default' :
                                toolCall.status === 'failed' ? 'destructive' :
                                'secondary'
                              }
                            >
                              {toolCall.status}
                            </Badge>
                          </div>
                          <div className="text-sm space-y-2">
                            <div>
                              <strong>Parameters:</strong>
                              <pre className="bg-gray-50 p-2 rounded text-xs mt-1 overflow-x-auto">
                                {JSON.stringify(toolCall.parameters, null, 2)}
                              </pre>
                            </div>
                            {toolCall.result && (
                              <div>
                                <strong>Result:</strong>
                                <pre className="bg-gray-50 p-2 rounded text-xs mt-1 overflow-x-auto">
                                  {typeof toolCall.result === 'string' 
                                    ? toolCall.result 
                                    : JSON.stringify(toolCall.result, null, 2)
                                  }
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
                
                <Separator className="my-4" />
                
                {selectedTool && (
                  <ToolCallEditor
                    toolName={selectedTool}
                    onExecute={handleToolExecution}
                  />
                )}
                
                {!selectedTool && (
                  <div className="text-center text-gray-500 py-4">
                    Select a tool from the sidebar to create a tool call
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolTrainer;
