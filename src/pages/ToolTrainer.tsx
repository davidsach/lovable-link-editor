import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Play, 
  RotateCcw, 
  ArrowLeft, 
  Upload, 
  Download,
  Code,
  MessageSquare,
  Wrench,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Sidebar } from '@/components/ToolTrainer/Sidebar';
import { MessageBuilder } from '@/components/ToolTrainer/MessageBuilder';
import { ToolCallEditor } from '@/components/ToolTrainer/ToolCallEditor';
import { ExampleHeader } from '@/components/ToolTrainer/ExampleHeader';

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

  const availableTools = [
    {
      name: 'codenav_api',
      description: 'Navigate and search code repositories',
      functions: ['code_search', 'find_definition', 'find_references']
    },
    {
      name: 'file_api',
      description: 'File operations and content management',
      functions: ['show_file', 'edit_file']
    },
    {
      name: 'browsing_api',
      description: 'Web browsing and content extraction',
      functions: ['browse']
    },
    {
      name: 'workspace_api',
      description: 'Workspace management and state',
      functions: ['get_ide_state']
    }
  ];

  const addNewMessage = (role: 'user' | 'assistant') => {
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      role,
      content: [{ type: 'text', content: '' }]
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
    if (!selectedMessageId) return;
    
    setCurrentExample(prev => ({
      ...prev,
      messages: prev.messages.map(msg => 
        msg.id === selectedMessageId
          ? {
              ...msg,
              content: [...msg.content, { type: 'text', content: '' }]
            }
          : msg
      )
    }));
  };

  const addToolCall = () => {
    if (!selectedMessageId) return;
    
    setCurrentExample(prev => ({
      ...prev,
      messages: prev.messages.map(msg => 
        msg.id === selectedMessageId
          ? {
              ...msg,
              content: [...msg.content, { 
                type: 'tool_call', 
                content: '{\n  "function": "",\n  "parameters": {}\n}',
                tool_name: '',
                tool_id: `tool_${Date.now()}`
              }]
            }
          : msg
      )
    }));
  };

  const getToolResult = async (toolId: string) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setCurrentExample(prev => ({
        ...prev,
        messages: prev.messages.map(msg => ({
          ...msg,
          content: msg.content.map(content => 
            content.tool_id === toolId
              ? { ...content, type: 'tool_result' as const, content: 'Tool result placeholder' }
              : content
          )
        }))
      }));
      setIsLoading(false);
    }, 1000);
  };

  const getAllResults = async () => {
    setIsLoading(true);
    // Simulate getting all tool results
    setTimeout(() => {
      console.log('Getting all tool results...');
      setIsLoading(false);
    }, 1500);
  };

  const goBack = () => {
    if (currentExample.messages.length > 0) {
      setCurrentExample(prev => ({
        ...prev,
        messages: prev.messages.slice(0, -1)
      }));
    }
  };

  const submitExample = () => {
    const dataStr = JSON.stringify(currentExample, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `training_example_${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
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
                content: '{\n  "function": "find_definition",\n  "parameters": {\n    "symbol": "main",\n    "file_path": "src/app.py"\n  }\n}',
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      <Sidebar 
        tools={availableTools}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-80'} flex flex-col`}>
        {/* Scrollable content area */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6 max-w-6xl mx-auto pb-32">
              <ExampleHeader 
                example={currentExample}
                onExampleChange={setCurrentExample}
                onLoad={loadExample}
                onAutoGenerate={autoGenerateExample}
                isLoading={isLoading}
              />
              
              <div className="grid gap-6 mt-6">
                {/* Messages */}
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
                            onClick={() => addNewMessage('user')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Add User Message
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

        {/* Fixed Action Bar at bottom */}
        <div className="fixed bottom-0 right-0 left-0 bg-white border-t border-gray-200 shadow-lg z-10" 
             style={{ marginLeft: sidebarCollapsed ? '64px' : '320px' }}>
          <div className="p-4 max-w-6xl mx-auto">
            <div className="flex flex-wrap gap-3 items-center">
              <Button 
                onClick={() => addNewMessage('user')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                New Turn (User)
              </Button>
              
              <Button 
                onClick={() => addNewMessage('assistant')}
                variant="outline"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                New Turn (Assistant)
              </Button>
              
              <Separator orientation="vertical" className="h-8" />
              
              <Button 
                onClick={addTextChunk}
                variant="outline"
                disabled={!selectedMessageId}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Text Chunk
              </Button>
              
              <Button 
                onClick={addToolCall}
                variant="outline"
                disabled={!selectedMessageId}
              >
                <Code className="w-4 h-4 mr-2" />
                Add Tool Call
              </Button>
              
              <Separator orientation="vertical" className="h-8" />
              
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
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              <Button 
                onClick={submitExample}
                className="bg-purple-600 hover:bg-purple-700 ml-auto"
              >
                <Download className="w-4 h-4 mr-2" />
                Submit
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ToolTrainer;
