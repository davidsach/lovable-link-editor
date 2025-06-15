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
  Undo
} from 'lucide-react';
import { useTools, useExecuteToolResult, useExecuteAllTools } from '@/hooks/useApi';
import { Tool, Message, ConversationState } from '@/types/toolTrainer';
import { SaveConversationDialog } from '@/components/ToolTrainer/SaveConversationDialog';
import { SavedConversations } from '@/components/ToolTrainer/SavedConversations';

// Mock tools data - This will be replaced with real API data
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
  },
  {
    tool_name: 'email_api_tool',
    description: 'Email API tool for sending and managing emails',
    functions: [
      {
        func_name: 'send_email',
        params: [
          {
            param_name: 'to',
            param_type: 'string',
            is_required: true,
            default_value: ''
          },
          {
            param_name: 'subject',
            param_type: 'string',
            is_required: true,
            default_value: ''
          },
          {
            param_name: 'body',
            param_type: 'string',
            is_required: true,
            default_value: ''
          },
          {
            param_name: 'cc',
            param_type: 'string',
            is_required: false,
            default_value: ''
          }
        ]
      }
    ]
  }
];

interface ToolCall {
  id: string;
  toolName: string;
  parameters: Record<string, any>;
  pythonCode: string;
  result: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
}

const ToolTrainer = () => {
  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================
  
  // Core conversation state
  const [conversation, setConversation] = useState<ConversationState>({
    id: '1',
    title: 'Example 1',
    messages: [],
    toolCalls: [],
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Form fields
  const [exampleName, setExampleName] = useState('Example 1');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  
  // UI state
  const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({});
  const [showTextChunkInput, setShowTextChunkInput] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  
  // Turn management
  const [currentStep, setCurrentStep] = useState<'user' | 'assistant'>('user');
  const [hasAddedTextChunk, setHasAddedTextChunk] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  
  // Tool calls
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);
  
  // Navigation
  const [currentExampleId, setCurrentExampleId] = useState(1);
  
  // History for step-wise back functionality
  const [conversationHistory, setConversationHistory] = useState<{
    messages: Message[];
    toolCalls: ToolCall[];
    step: 'user' | 'assistant';
  }[]>([]);

  // =============================================================================
  // API HOOKS
  // =============================================================================
  
  const { data: tools, isLoading: toolsLoading, error: toolsError } = useTools();
  const executeToolMutation = useExecuteToolResult();
  const executeAllToolsMutation = useExecuteAllTools();
  const isConnected = !toolsError;
  const availableTools = tools || mockTools;

  // =============================================================================
  // UI HELPER FUNCTIONS
  // =============================================================================
  
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

  // =============================================================================
  // CONVERSATION MANAGEMENT
  // =============================================================================
  
  const saveCurrentState = () => {
    // Save current state before making changes
    setConversationHistory(prev => [
      ...prev,
      {
        messages: [...conversation.messages],
        toolCalls: [...toolCalls],
        step: currentStep
      }
    ]);
  };

  const addNewTurn = () => {
    // If no conversation started, start with user turn
    if (!conversationStarted) {
      setCurrentStep('user');
      setConversationStarted(true);
      return;
    }

    // Save current state before switching turns
    saveCurrentState();
    
    // Reset states for new turn
    setShowTextChunkInput(false);
    setMessageContent('');
    setHasAddedTextChunk(false);
    setToolCalls([]);
    
    // Switch to the opposite role
    setCurrentStep(currentStep === 'user' ? 'assistant' : 'user');
  };

  const addTextChunk = () => {
    if (messageContent.trim()) {
      const newMessage: Message = {
        id: `msg_${Date.now()}`,
        role: currentStep,
        content: messageContent,
        timestamp: new Date()
      };
      
      setConversation(prev => ({
        ...prev,
        messages: [...prev.messages, newMessage]
      }));
      
      // Mark conversation as started when first message is added
      if (!conversationStarted) {
        setConversationStarted(true);
      }
      
      setMessageContent('');
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
    const hasIncompleteToolCall = toolCalls.some(tc => 
      !tc.toolName || !tc.pythonCode.trim() || tc.status === 'pending'
    );
    
    if (hasIncompleteToolCall) {
      return; // Don't add a new tool call if there's already an incomplete one
    }
    
    const newToolCall: ToolCall = {
      id: `tool_${Date.now()}`,
      toolName: '',
      parameters: {},
      pythonCode: '',
      result: '',
      status: 'pending'
    };
    
    setToolCalls([...toolCalls, newToolCall]);
  };

  const updateToolCall = (index: number, updates: Partial<ToolCall>) => {
    setToolCalls(prev => prev.map((tc, i) => i === index ? { ...tc, ...updates } : tc));
  };

  const executeToolCall = async (index: number) => {
    const toolCall = toolCalls[index];
    if (!toolCall.pythonCode.trim()) return;

    updateToolCall(index, { status: 'executing' });
    
    try {
      const result = await executeToolMutation.mutateAsync({
        code: toolCall.pythonCode
      });
      
      // Format the result output
      const formattedResult = typeof result.code_output === 'object' 
        ? JSON.stringify(result.code_output, null, 2)
        : String(result.code_output);
      
      updateToolCall(index, { 
        result: formattedResult,
        status: 'completed'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Execution failed';
      updateToolCall(index, { 
        result: `Error: ${errorMessage}`,
        status: 'failed'
      });
    }
  };

  const executeAllToolCalls = async () => {
    // Filter tool calls that have code
    const toolCallsWithCode = toolCalls.filter(tc => tc.pythonCode.trim());
    
    if (toolCallsWithCode.length === 0) {
      return;
    }

    // Set all tool calls to executing status
    toolCallsWithCode.forEach((toolCall, index) => {
      const originalIndex = toolCalls.findIndex(tc => tc.id === toolCall.id);
      updateToolCall(originalIndex, { status: 'executing' });
    });

    try {
      // Prepare code chunks for API call
      const codeChunks = toolCallsWithCode.map((toolCall, index) => ({
        chunk_id: index,
        code: toolCall.pythonCode
      }));

      // Call the API
      const result = await executeAllToolsMutation.mutateAsync({
        code_chunks: codeChunks
      });

      // Update tool calls with results
      result.code_chunk_output.forEach((output) => {
        const toolCall = toolCallsWithCode[output.chunk_id];
        const originalIndex = toolCalls.findIndex(tc => tc.id === toolCall.id);
        
        // Format the result output
        const formattedResult = typeof output.code_output === 'object' 
          ? JSON.stringify(output.code_output, null, 2)
          : String(output.code_output);
        
        updateToolCall(originalIndex, {
          result: formattedResult,
          status: 'completed'
        });
      });
    } catch (error) {
      // Set all executing tool calls to failed status
      toolCallsWithCode.forEach((toolCall) => {
        const originalIndex = toolCalls.findIndex(tc => tc.id === toolCall.id);
        const errorMessage = error instanceof Error ? error.message : 'Execution failed';
        updateToolCall(originalIndex, {
          result: `Error: ${errorMessage}`,
          status: 'failed'
        });
      });
    }
  };

  const removeToolCall = (index: number) => {
    setToolCalls(prev => prev.filter((_, i) => i !== index));
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

  const goBackStep = () => {
    if (conversationHistory.length > 0) {
      // Get the last saved state
      const lastState = conversationHistory[conversationHistory.length - 1];
      
      // Restore the conversation to the previous state
      setConversation(prev => ({
        ...prev,
        messages: lastState.messages
      }));
      setToolCalls(lastState.toolCalls);
      setCurrentStep(lastState.step);
      
      // Remove this state from history
      setConversationHistory(prev => prev.slice(0, -1));
      
      // Reset current turn states
      setShowTextChunkInput(false);
      setMessageContent('');
      setHasAddedTextChunk(false);
    } else {
      // If no history, go back to initial state
      setConversation(prev => ({
        ...prev,
        messages: []
      }));
      setToolCalls([]);
      setCurrentStep('user');
      setConversationStarted(false);
      setShowTextChunkInput(false);
      setMessageContent('');
      setHasAddedTextChunk(false);
    }
  };

  const goBack = () => {
    // Navigate back to previous page
    window.history.back();
  };

  // =============================================================================
  // VALIDATION FUNCTIONS
  // =============================================================================
  
  const canStartNewTurn = () => {
    // If conversation hasn't started, can always start new turn
    if (!conversationStarted) return true;
    
    if (currentStep === 'user') {
      // User can start new turn if they have added a text chunk
      return hasAddedTextChunk;
    } else {
      // Assistant can start new turn if they have added text chunk OR tool calls
      return hasAddedTextChunk || toolCalls.length > 0;
    }
  };

  const canAddTextChunk = () => {
    if (currentStep === 'user') {
      // User can only add one text chunk per turn
      return !hasAddedTextChunk;
    }
    // Assistant can add multiple text chunks
    return true;
  };

  const canAddToolCall = () => {
    if (currentStep !== 'assistant') return false;
    
    // Check if there's already an incomplete tool call
    const hasIncompleteToolCall = toolCalls.some(tc => 
      !tc.toolName || !tc.pythonCode.trim() || tc.status === 'pending'
    );
    
    return !hasIncompleteToolCall;
  };

  const getExecutableToolCallsCount = () => {
    return toolCalls.filter(tc => 
      tc.pythonCode.trim() && tc.status !== 'completed' && tc.status !== 'executing'
    ).length;
  };

  const getExecutingToolCallsCount = () => {
    return toolCalls.filter(tc => tc.status === 'executing').length;
  };

  const canExecuteAllToolCalls = () => {
    return toolCalls.some(tc => tc.pythonCode.trim()) && !executeAllToolsMutation.isPending;
  };

  const canGoBackStep = () => {
    return conversationHistory.length > 0 || conversation.messages.length > 0;
  };

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================
  
  const handleSaveConversation = () => {
    // TODO: Implement actual save functionality with backend
    console.log('Conversation saved successfully');
  };

  const handleLoadConversation = (savedConversation: any) => {
    // TODO: Replace with proper type from backend
    setConversation({
      id: savedConversation.id,
      title: savedConversation.name,
      messages: savedConversation.messages,
      toolCalls: [],
      createdAt: new Date(savedConversation.created_at),
      updatedAt: new Date(savedConversation.updated_at || savedConversation.created_at)
    });
    setExampleName(savedConversation.name);
    setDescription(savedConversation.description || '');
    setConversationStarted(savedConversation.messages.length > 0);
  };

  // =============================================================================
  // RENDER
  // =============================================================================
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white flex">
      {/* Left Sidebar - Available Tools */}
      <div className="w-80 bg-gray-800/90 backdrop-blur border-r border-gray-700/50 flex flex-col shadow-2xl">
        <div className="p-4 border-b border-gray-700/50 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-blue-300 flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Available Tools
            </h2>
            <Badge variant="outline" className="border-blue-400/50 text-blue-300">
              {availableTools.length}
            </Badge>
          </div>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {availableTools.map((tool) => (
              <div key={tool.tool_name} className="bg-gradient-to-r from-gray-700/80 to-gray-600/80 rounded-lg border border-gray-600/50 hover:border-blue-500/50 transition-all duration-200 shadow-lg">
                <div 
                  className="p-3 cursor-pointer flex items-center justify-between hover:bg-gray-600/50 rounded-lg transition-colors"
                  onClick={() => toggleToolExpansion(tool.tool_name)}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                      <Code className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-blue-300 font-medium">{tool.tool_name}</span>
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
                      <Settings className="w-3 h-3 mr-1" />
                      Functions
                    </div>
                    {tool.functions?.map((func) => (
                      <div key={func.func_name} className="bg-gray-600/60 rounded-lg p-3 mb-2 border border-gray-500/30">
                        <div className="text-sm font-medium text-white mb-2 flex items-center">
                          <Zap className="w-3 h-3 mr-1 text-yellow-400" />
                          {func.func_name}
                        </div>
                        <div className="space-y-1">
                          {func.params.map((param) => (
                            <div key={param.param_name} className="text-xs text-gray-300 flex items-center justify-between bg-gray-700/50 px-2 py-1 rounded">
                              <span className="font-mono">{param.param_name}: {param.param_type}</span>
                              {param.is_required && (
                                <Badge variant="destructive" className="text-xs px-1 py-0 bg-red-500/20 text-red-300 border-red-400/50">
                                  required
                                </Badge>
                              )}
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button
                onClick={navigatePrevious}
                disabled={currentExampleId <= 1}
                variant="outline"
                size="sm"
                className="bg-gray-700/80 border-gray-600/50 text-white hover:bg-gray-600/80 hover:border-blue-400/50 transition-all duration-200"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-400/50">
                  Example ID: {currentExampleId}
                </Badge>
              </div>
              <Button
                onClick={navigateNext}
                variant="outline"
                size="sm"
                className="bg-gray-700/80 border-gray-600/50 text-white hover:bg-gray-600/80 hover:border-blue-400/50 transition-all duration-200"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            <div className="flex items-center gap-3">
              <SavedConversations onLoadConversation={handleLoadConversation} />
              <SaveConversationDialog 
                messages={conversation.messages}
                exampleName={exampleName}
                onSaved={handleSaveConversation}
              />
            </div>
          </div>
        </div>

        {/* Training Example Header */}
        <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/90 to-gray-700/90 backdrop-blur">
          <Card className="bg-gradient-to-r from-gray-700/80 to-gray-600/80 border-gray-600/50 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-xl text-white">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  Training Example
                </CardTitle>
                <div className="flex items-center gap-3">
                  {currentStep === 'user' ? (
                    <div className="flex items-center gap-2 bg-blue-500/20 px-4 py-2 rounded-full border border-blue-400/50">
                      <User className="w-5 h-5 text-blue-400" />
                      <span className="font-medium text-blue-300">User Turn</span>
                      <Badge variant="outline" className="bg-blue-600/30 text-blue-200 border-blue-400/50 ml-2">
                        Current
                      </Badge>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-full border border-green-400/50">
                      <Bot className="w-5 h-5 text-green-400" />
                      <span className="font-medium text-green-300">Assistant Turn</span>
                      <Badge variant="outline" className="bg-green-600/30 text-green-200 border-green-400/50 ml-2">
                        Current
                      </Badge>
                    </div>
                  )}
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
                    className="bg-gray-600/80 border-gray-500/50 text-white placeholder:text-gray-400 focus:border-blue-400/50 transition-colors"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Tags</label>
                  <div className="flex flex-wrap gap-2 items-center">
                    {tags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-red-500/30 bg-gray-600/80 text-white border border-gray-500/30 hover:border-red-400/50 transition-all duration-200"
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
                      className="w-32 h-8 text-xs bg-gray-600/80 border-gray-500/50 text-white placeholder:text-gray-400 focus:border-blue-400/50 transition-colors"
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
                  className="min-h-[60px] bg-gray-600/80 border-gray-500/50 text-white placeholder:text-gray-400 focus:border-blue-400/50 transition-colors"
                />
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center bg-gray-700/50 px-3 py-1 rounded-full">
                  <Calendar className="w-4 h-4 mr-1" />
                  Created: 6/14/2025
                </div>
                <div className="flex items-center bg-gray-700/50 px-3 py-1 rounded-full">
                  <Clock className="w-4 h-4 mr-1" />
                  Updated: 6/14/2025
                </div>
                <Badge variant="outline" className="border-gray-500/50 text-gray-300 bg-gray-700/30">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  {conversation.messages.length} message{conversation.messages.length !== 1 ? 's' : ''}
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
                {currentStep === 'user' ? (
                  <div className="flex items-center gap-2 bg-blue-500/20 px-4 py-2 rounded-full border border-blue-400/50">
                    <User className="w-5 h-5 text-blue-400" />
                    <span className="font-medium text-blue-300">User Turn</span>
                    <Badge variant="outline" className="bg-blue-600/30 text-blue-200 border-blue-400/50 ml-2">
                      Current
                    </Badge>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-full border border-green-400/50">
                    <Bot className="w-5 h-5 text-green-400" />
                    <span className="font-medium text-green-300">Assistant Turn</span>
                    <Badge variant="outline" className="bg-green-600/30 text-green-200 border-green-400/50 ml-2">
                      Current
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Conversation Messages */}
          <ScrollArea className="flex-1 p-6">
            {conversation.messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="w-12 h-12 text-gray-500" />
                  </div>
                  <p className="text-xl mb-3 text-gray-300">Ready to start training</p>
                  <p className="text-sm text-gray-500">Click "New Turn" to begin the conversation</p>
                  <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-blue-300 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Click "New Turn" to start the conversation
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {conversation.messages.map((message, index) => (
                  <div key={message.id} className="flex flex-col space-y-3">
                    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl p-4 shadow-lg ${
                        message.role === 'user' 
                          ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white' 
                          : 'bg-gradient-to-r from-gray-700 to-gray-600 text-white border border-gray-500/30'
                      }`}>
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            message.role === 'user' ? 'bg-blue-400/30' : 'bg-gray-500/30'
                          }`}>
                            {message.role === 'user' ? (
                              <User className="w-4 h-4" />
                            ) : (
                              <Bot className="w-4 h-4" />
                            )}
                          </div>
                          <span className="font-medium capitalize text-sm">{message.role}</span>
                          <span className="text-xs opacity-70 bg-black/20 px-2 py-1 rounded-full">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                    
                    {/* Show tool calls for assistant messages */}
                    {message.role === 'assistant' && index === conversation.messages.length - 1 && toolCalls.length > 0 && (
                      <div className="ml-8 space-y-3">
                        {toolCalls.map((toolCall) => (
                          <div key={toolCall.id} className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 rounded-xl p-4 border border-gray-600/50 shadow-lg">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                                <Settings className="w-4 h-4 text-green-400" />
                              </div>
                              <span className="text-sm font-medium text-green-300">
                                Tool Call: {toolCall.toolName || 'Unknown'}
                              </span>
                              <Badge 
                                variant={
                                  toolCall.status === 'completed' ? 'default' : 
                                  toolCall.status === 'failed' ? 'destructive' : 
                                  toolCall.status === 'executing' ? 'secondary' : 'outline'
                                }
                                className={`text-xs ${
                                  toolCall.status === 'completed' ? 'bg-green-500/20 text-green-300 border-green-400/50' :
                                  toolCall.status === 'failed' ? 'bg-red-500/20 text-red-300 border-red-400/50' :
                                  toolCall.status === 'executing' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400/50' :
                                  'bg-gray-500/20 text-gray-300 border-gray-400/50'
                                }`}
                              >
                                {toolCall.status === 'executing' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                                {toolCall.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                                {toolCall.status === 'failed' && <AlertTriangle className="w-3 h-3 mr-1" />}
                                {toolCall.status}
                              </Badge>
                            </div>
                            {toolCall.result && (
                              <pre className="text-xs text-gray-300 bg-gray-900/60 p-3 rounded-lg overflow-x-auto border border-gray-700/50 font-mono">
                                {toolCall.result}
                              </pre>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
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
                    {currentStep === 'user' ? 'User Message' : 'Assistant Message'}
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

          {/* Tool Call Editors - Show when there are tool calls */}
          {currentStep === 'assistant' && toolCalls.length > 0 && (
            <div className="border-t border-gray-700/50 bg-gradient-to-r from-gray-800/90 to-gray-700/90 backdrop-blur p-6 shadow-lg max-h-96 overflow-y-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-white flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-green-400" />
                    Tool Calls ({toolCalls.length})
                  </h4>
                </div>
                
                {toolCalls.map((toolCall, index) => (
                  <div key={toolCall.id} className="bg-gradient-to-r from-gray-700/80 to-gray-600/80 rounded-xl p-6 border border-gray-600/50 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <Settings className="w-4 h-4 text-green-400" />
                      </div>
                      <label className="text-sm font-medium text-white">Tool Call {index + 1}</label>
                      <Badge 
                        variant={
                          toolCall.status === 'completed' ? 'default' : 
                          toolCall.status === 'failed' ? 'destructive' : 
                          toolCall.status === 'executing' ? 'secondary' : 'outline'
                        }
                        className={`text-xs ${
                          toolCall.status === 'completed' ? 'bg-green-500/20 text-green-300 border-green-400/50' :
                          toolCall.status === 'failed' ? 'bg-red-500/20 text-red-300 border-red-400/50' :
                          toolCall.status === 'executing' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400/50' :
                          'bg-gray-500/20 text-gray-300 border-gray-400/50'
                        }`}
                      >
                        {toolCall.status === 'executing' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                        {toolCall.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {toolCall.status === 'failed' && <AlertTriangle className="w-3 h-3 mr-1" />}
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
                        <label className="text-sm text-gray-300 font-medium">Tool Name</label>
                        <Select 
                          value={toolCall.toolName} 
                          onValueChange={(value) => updateToolCall(index, { toolName: value })}
                        >
                          <SelectTrigger className="bg-gray-600/80 border-gray-500/50 text-white focus:border-blue-400/50 transition-colors">
                            <SelectValue placeholder="Select tool..." />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTools.map((tool) => (
                              <SelectItem key={tool.tool_name} value={tool.tool_name}>
                                {tool.tool_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm text-gray-300 font-medium">Parameters (JSON)</label>
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
                        onChange={(e) => updateToolCall(index, { pythonCode: e.target.value })}
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
                        onChange={(e) => updateToolCall(index, { result: e.target.value })}
                        placeholder="Tool result will appear here after execution..."
                        className="min-h-[100px] bg-gray-600/80 border-gray-500/50 text-white font-mono text-sm placeholder:text-gray-400 focus:border-blue-400/50 transition-colors"
                        readOnly
                      />
                    </div>
                    
                    <Button 
                      onClick={() => executeToolCall(index)}
                      disabled={!toolCall.pythonCode.trim() || toolCall.status === 'executing' || toolCall.status === 'completed'}
                      className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white disabled:opacity-50 shadow-lg transition-all duration-200"
                    >
                      {toolCall.status === 'executing' ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : toolCall.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      {toolCall.status === 'executing' ? 'Executing...' : toolCall.status === 'completed' ? 'Executed' : 'Get Result'}
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
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white disabled:opacity-50 shadow-lg transition-all duration-200 px-6 h-11"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Turn
            </Button>

            {/* Add Text Chunk Button */}
            <Button 
              onClick={showTextChunkEditor}
              disabled={!canAddTextChunk() || showTextChunkInput}
              variant="outline"
              className="bg-gray-700/80 border-gray-600/50 text-white hover:bg-gray-600/80 hover:border-blue-400/50 disabled:opacity-50 shadow-lg transition-all duration-200 px-6 h-11"
            >
              <FileText className="w-4 h-4 mr-2" />
              Add Text Chunk
            </Button>
            
            {/* Add Tool Call Button - Only for assistant */}
            {currentStep === 'assistant' && (
              <Button 
                onClick={addToolCall}
                disabled={!canAddToolCall()}
                variant="outline"
                className="bg-green-500/20 border-green-400/50 text-green-300 hover:bg-green-500/30 hover:border-green-400 disabled:opacity-50 shadow-lg transition-all duration-200 px-6 h-11"
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
                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg transition-all duration-200 px-6 h-11"
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
              className="bg-gray-700/80 border-gray-600/50 text-white hover:bg-gray-600/80 hover:border-blue-400/50 disabled:opacity-50 shadow-lg transition-all duration-200 px-6 h-11"
            >
              <Undo className="w-4 h-4 mr-2" />
              Back Step
            </Button>

            {/* Back Button */}
            <Button 
              onClick={goBack}
              variant="outline" 
              className="bg-gray-700/80 border-gray-600/50 text-white hover:bg-gray-600/80 hover:border-blue-400/50 shadow-lg transition-all duration-200 px-6 h-11"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {/* Save Button - Using the existing SaveConversationDialog */}
            <SaveConversationDialog 
              messages={conversation.messages}
              exampleName={exampleName}
              onSaved={handleSaveConversation}
            />
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
            {currentStep === 'user' && hasAddedTextChunk && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 inline-block">
                <p className="text-green-300 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Text chunk added. Click "New Turn" to switch to assistant.
                </p>
              </div>
            )}
            {currentStep === 'user' && !canAddTextChunk() && !showTextChunkInput && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 inline-block">
                <p className="text-blue-300 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  User can add only one text chunk per turn. Click "New Turn" to continue.
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
