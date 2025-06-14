
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
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
  ChevronUp
} from 'lucide-react';
import { useTools } from '@/hooks/useApi';
import { Tool, Message, ConversationState } from '@/types/toolTrainer';

// Mock tools data
const mockTools: Tool[] = [
  {
    tool_name: 'contact_api_tool',
    description: 'Contact API tool for managing contacts',
    functions: [
      {
        func_name: 'get_contact',
        params: [
          {
            param_name: 'name',
            param_type: 'string',
            is_required: true,
            default_value: ''
          }
        ]
      }
    ]
  },
  {
    tool_name: 'drive_api_tool',
    description: 'Drive API tool for file operations',
    functions: [
      {
        func_name: 'upload_file',
        params: [
          {
            param_name: 'file_path',
            param_type: 'string',
            is_required: true,
            default_value: ''
          },
          {
            param_name: 'folder_id',
            param_type: 'string',
            is_required: false,
            default_value: ''
          }
        ]
      }
    ]
  },
  {
    tool_name: 'calendar_api_tool',
    description: 'Calendar API tool for event management',
    functions: [
      {
        func_name: 'create_event',
        params: [
          {
            param_name: 'title',
            param_type: 'string',
            is_required: true,
            default_value: ''
          },
          {
            param_name: 'start_time',
            param_type: 'string',
            is_required: true,
            default_value: ''
          },
          {
            param_name: 'end_time',
            param_type: 'string',
            is_required: true,
            default_value: ''
          }
        ]
      }
    ]
  },
  {
    tool_name: 'weather_tool',
    description: 'Weather tool for getting weather information',
    functions: [
      {
        func_name: 'get_weather',
        params: [
          {
            param_name: 'location',
            param_type: 'string',
            is_required: true,
            default_value: ''
          }
        ]
      }
    ]
  }
];

const ToolTrainer = () => {
  const [conversation, setConversation] = useState<ConversationState>({
    id: '1',
    title: 'Example 1',
    messages: [],
    toolCalls: [],
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const [exampleName, setExampleName] = useState('Example 1');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({});
  const [currentStep, setCurrentStep] = useState<'user' | 'assistant' | 'tool'>('user');
  const [messageContent, setMessageContent] = useState('');
  const [selectedTool, setSelectedTool] = useState('');
  const [toolParameters, setToolParameters] = useState('{}');
  const [currentExampleId, setCurrentExampleId] = useState(1);

  const { data: tools, isLoading: toolsLoading, error: toolsError } = useTools();
  const isConnected = !toolsError;
  const availableTools = tools || mockTools;

  const toggleToolExpansion = (toolName: string) => {
    setExpandedTools(prev => ({
      ...prev,
      [toolName]: !prev[toolName]
    }));
  };

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addNewTurn = () => {
    setCurrentStep('user');
    setMessageContent('');
  };

  const addTextChunk = () => {
    if (messageContent.trim()) {
      const newMessage: Message = {
        id: `msg_${Date.now()}`,
        role: currentStep === 'user' ? 'user' : 'assistant',
        content: messageContent,
        timestamp: new Date()
      };
      
      setConversation(prev => ({
        ...prev,
        messages: [...prev.messages, newMessage]
      }));
      
      setMessageContent('');
      setCurrentStep(currentStep === 'user' ? 'assistant' : 'user');
    }
  };

  const addPythonCode = () => {
    // This would add a Python code block
    console.log('Add Python Code clicked');
  };

  const executeAllCode = () => {
    // This would execute all code
    console.log('Execute All Code clicked');
  };

  const navigatePrevious = () => {
    if (currentExampleId > 1) {
      setCurrentExampleId(currentExampleId - 1);
    }
  };

  const navigateNext = () => {
    setCurrentExampleId(currentExampleId + 1);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Left Sidebar - Available Tools */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-blue-400 flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Available Tools
            </h2>
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </div>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {availableTools.map((tool) => (
              <div key={tool.tool_name} className="bg-gray-700 rounded-lg border border-gray-600">
                <div 
                  className="p-3 cursor-pointer flex items-center justify-between"
                  onClick={() => toggleToolExpansion(tool.tool_name)}
                >
                  <div className="flex items-center">
                    <Code className="w-4 h-4 text-blue-400 mr-2" />
                    <span className="text-blue-400 font-medium">{tool.tool_name}</span>
                  </div>
                  {expandedTools[tool.tool_name] ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                
                {expandedTools[tool.tool_name] && (
                  <div className="px-3 pb-3">
                    <div className="text-xs text-gray-400 mb-2 flex items-center">
                      <Code className="w-3 h-3 mr-1" />
                      Functions
                    </div>
                    {tool.functions?.map((func) => (
                      <div key={func.func_name} className="bg-gray-600 rounded p-2 mb-2">
                        <div className="text-sm font-medium text-white mb-1">
                          {func.func_name}
                        </div>
                        {func.params.map((param) => (
                          <div key={param.param_name} className="text-xs text-gray-300 flex items-center justify-between">
                            <span>{param.param_name}: {param.param_type}</span>
                            {param.is_required && (
                              <Badge variant="destructive" className="text-xs px-1 py-0">
                                required
                              </Badge>
                            )}
                          </div>
                        ))}
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
        <div className="p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button
                onClick={navigatePrevious}
                disabled={currentExampleId <= 1}
                variant="outline"
                size="sm"
                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <span className="text-gray-300">
                Example ID: {currentExampleId}
              </span>
              <Button
                onClick={navigateNext}
                variant="outline"
                size="sm"
                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
                <BookOpen className="w-4 h-4 mr-2" />
                Saved Conversations (0)
              </Button>
              <Button variant="outline" size="sm" className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
                <Save className="w-4 h-4 mr-2" />
                Save Conversation
              </Button>
            </div>
          </div>
        </div>

        {/* Training Example Header */}
        <div className="p-6 border-b border-gray-700 bg-gray-800">
          <Card className="bg-gray-700 border-gray-600">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-xl text-white">
                  <FileText className="w-6 h-6 mr-2 text-blue-400" />
                  Training Example
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="bg-gray-600 border-gray-500 text-white hover:bg-gray-500">
                    <Upload className="w-4 h-4 mr-2" />
                    Load Example
                  </Button>
                  <Button variant="outline" size="sm" className="bg-gray-600 border-gray-500 text-white hover:bg-gray-500">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Auto Generate
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Example Name</label>
                  <Input
                    value={exampleName}
                    onChange={(e) => setExampleName(e.target.value)}
                    placeholder="Enter example name..."
                    className="bg-gray-600 border-gray-500 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Tags</label>
                  <div className="flex flex-wrap gap-2 items-center">
                    {tags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-red-600 bg-gray-600 text-white"
                        onClick={() => removeTag(tag)}
                      >
                        {tag} ×
                      </Badge>
                    ))}
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addTag();
                        }
                      }}
                      placeholder="Add tag..."
                      className="w-32 h-8 text-xs bg-gray-600 border-gray-500 text-white"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this training example demonstrates..."
                  className="min-h-[60px] bg-gray-600 border-gray-500 text-white"
                />
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Created: 6/14/2025
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Updated: 6/14/2025
                </div>
                <Badge variant="outline" className="border-gray-500 text-gray-300">
                  {conversation.messages.length} message{conversation.messages.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6">
          {/* Current Step Display */}
          <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-red-500">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-400" />
                <span className="font-medium text-white capitalize">{currentStep}</span>
                <Badge variant="outline" className="bg-blue-600 text-white border-blue-500">
                  First
                </Badge>
                <Badge variant="destructive" className="bg-red-600 text-white">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  1 Error
                </Badge>
              </div>
              <Badge variant="outline" className="border-gray-500 text-gray-300">
                0 chunks
              </Badge>
            </div>
            
            <div className="mb-3">
              <Alert variant="destructive" className="bg-red-900/20 border-red-500">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-red-400">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="text-xs">
                      ERROR
                    </Badge>
                    <span>message-validation</span>
                  </div>
                  <div className="mt-1 text-red-300">
                    User message must have text
                  </div>
                </AlertDescription>
              </Alert>
            </div>

            <Textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Enter your message content..."
              className="min-h-[100px] bg-gray-700 border-gray-600 text-white"
            />
          </div>

          {/* Bottom Action Bar */}
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex items-center gap-3">
              <Button 
                onClick={addNewTurn}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Turn
              </Button>
              <Button 
                onClick={addTextChunk}
                variant="outline"
                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
              >
                <FileText className="w-4 h-4 mr-2" />
                Add Text Chunk
              </Button>
              <Button 
                onClick={addPythonCode}
                variant="outline"
                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
              >
                <Code className="w-4 h-4 mr-2" />
                Add Python Code
              </Button>
              <Button 
                onClick={executeAllCode}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Execute All Code
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button variant="outline" className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
                <Save className="w-4 h-4 mr-2" />
                Save Conversation
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Save className="w-4 h-4 mr-2" />
                Save Trace
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolTrainer;
