import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Save, 
  Upload, 
  Download, 
  Sparkles, 
  Code, 
  MessageSquare, 
  Loader2,
  AlertCircle,
  CheckCircle,
  FileText,
  Settings,
  Database
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RetrieveExample } from '@/components/ToolTrainer/RetrieveExample';
import { EditExample } from '@/components/ToolTrainer/EditExample';
import { SaveToDatabase } from '@/components/ToolTrainer/SaveToDatabase';
import { MessageRenderer } from '@/components/ToolTrainer/MessageRenderer';
import { Example, Content, Tool } from '@/types/toolTrainer';
import { apiService } from '@/services/api';

export default function ToolTrainer() {
  const { toast } = useToast();
  
  // State management
  const [currentExample, setCurrentExample] = useState<Example>({
    id: 1,
    name: 'Current Training Example',
    description: 'Interactive training example for tool usage',
    messages: [],
    meta: {
      tags: [],
      created_by: 'user',
      source: 'tool_trainer'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  const [userQuery, setUserQuery] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('');
  const [toolCode, setToolCode] = useState('');
  const [toolResult, setToolResult] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>('');

  // Load available tools on component mount
  useEffect(() => {
    loadAvailableTools();
  }, []);

  const loadAvailableTools = async () => {
    try {
      const tools = await apiService.getTools();
      setAvailableTools(tools);
    } catch (error) {
      console.error('Failed to load tools:', error);
      toast({
        title: 'Error',
        description: 'Failed to load available tools',
        variant: 'destructive',
      });
    }
  };

  const executeToolCode = async () => {
    if (!toolCode.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter some code to execute',
        variant: 'destructive',
      });
      return;
    }

    setIsExecuting(true);
    try {
      const result = await apiService.executeToolResult({ code: toolCode });
      setToolResult(JSON.stringify(result.code_output, null, 2));
      
      toast({
        title: 'Success',
        description: 'Code executed successfully',
      });
    } catch (error) {
      console.error('Code execution failed:', error);
      setToolResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      toast({
        title: 'Execution Failed',
        description: 'Failed to execute code',
        variant: 'destructive',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const generateMessages = () => {
    const messages: Content[] = [];

    if (userQuery.trim()) {
      messages.push({
        kind: 'user',
        content: userQuery.trim(),
        timestamp: new Date().toISOString()
      });
    }

    if (assistantResponse.trim()) {
      messages.push({
        kind: 'assistant',
        content: assistantResponse.trim(),
        timestamp: new Date().toISOString()
      });
    }

    if (toolCode.trim()) {
      messages.push({
        kind: 'tool_call',
        content: toolCode.trim(),
        metadata: { tool_name: selectedTool || 'unknown' },
        timestamp: new Date().toISOString()
      });
    }

    if (toolResult.trim()) {
      messages.push({
        kind: 'tool_result',
        content: toolResult.trim(),
        timestamp: new Date().toISOString()
      });
    }

    return messages;
  };

  const updateCurrentExample = () => {
    const messages = generateMessages();
    setCurrentExample(prev => ({
      ...prev,
      messages,
      updated_at: new Date().toISOString()
    }));
  };

  const autoGenerateExample = async () => {
    setIsGenerating(true);
    try {
      // This is a placeholder for auto-generation logic
      // You can implement AI-powered example generation here
      const sampleMessages: Content[] = [
        {
          kind: 'user',
          content: 'Can you help me analyze this data?',
          timestamp: new Date().toISOString()
        },
        {
          kind: 'assistant',
          content: 'I\'ll help you analyze the data. Let me use the appropriate tool.',
          timestamp: new Date().toISOString()
        },
        {
          kind: 'tool_call',
          content: 'import pandas as pd\ndf = pd.read_csv("data.csv")\nprint(df.describe())',
          metadata: { tool_name: 'data_analyzer' },
          timestamp: new Date().toISOString()
        },
        {
          kind: 'tool_result',
          content: 'Data analysis complete. Found 1000 rows with 5 columns.',
          timestamp: new Date().toISOString()
        }
      ];

      setCurrentExample(prev => ({
        ...prev,
        name: 'Auto-generated Example',
        description: 'Automatically generated training example',
        messages: sampleMessages,
        updated_at: new Date().toISOString()
      }));

      toast({
        title: 'Success',
        description: 'Example auto-generated successfully',
      });
    } catch (error) {
      console.error('Auto-generation failed:', error);
      toast({
        title: 'Generation Failed',
        description: 'Failed to auto-generate example',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const loadExampleFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const example = JSON.parse(content) as Example;
        setCurrentExample(example);
        
        toast({
          title: 'Success',
          description: 'Example loaded successfully',
        });
      } catch (error) {
        console.error('Failed to load example:', error);
        toast({
          title: 'Load Failed',
          description: 'Failed to load example from file',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
  };

  const exportExample = () => {
    const dataStr = JSON.stringify(currentExample, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const filename = `example-${currentExample.name.replace(/\s+/g, '-')}.json`;
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExampleRetrieved = (example: Example) => {
    setCurrentExample(example);
    
    // Extract data from messages for editing
    const userMessage = example.messages.find(m => m.kind === 'user');
    const assistantMessage = example.messages.find(m => m.kind === 'assistant');
    const toolCallMessage = example.messages.find(m => m.kind === 'tool_call');
    const toolResultMessage = example.messages.find(m => m.kind === 'tool_result');

    if (userMessage) setUserQuery(userMessage.content);
    if (assistantMessage) setAssistantResponse(assistantMessage.content);
    if (toolCallMessage) setToolCode(toolCallMessage.content);
    if (toolResultMessage) setToolResult(toolResultMessage.content);

    toast({
      title: 'Success',
      description: 'Example loaded successfully',
    });
  };

  const handleExampleUpdated = (updatedExample: Example) => {
    setCurrentExample(updatedExample);
    toast({
      title: 'Success',
      description: 'Example updated successfully',
    });
  };

  // Update messages when inputs change
  useEffect(() => {
    updateCurrentExample();
  }, [userQuery, assistantResponse, toolCode, toolResult, selectedTool]);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tool Trainer</h1>
          <p className="text-gray-600 mt-2">Create and test training examples for AI tool usage</p>
        </div>
        
        <div className="flex items-center gap-3">
          <RetrieveExample onExampleRetrieved={handleExampleRetrieved} />
          <EditExample 
            currentExample={currentExample}
            onExampleUpdated={handleExampleUpdated}
          />
          <SaveToDatabase 
            messages={currentExample.messages}
            tags={currentExample.meta?.tags || []}
            exampleName={currentExample.name}
          />
        </div>
      </div>

      {/* Example Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-xl">
              <FileText className="w-6 h-6 mr-2 text-blue-600" />
              Training Example
            </CardTitle>
            <div className="flex gap-2">
              <input
                type="file"
                accept=".json"
                onChange={loadExampleFromFile}
                className="hidden"
                id="file-input"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Load Example
              </Button>
              <Button
                variant="outline"
                onClick={autoGenerateExample}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Auto Generate
              </Button>
              <Button
                variant="outline"
                onClick={exportExample}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Example Name</label>
              <Input
                value={currentExample.name || ''}
                onChange={(e) => setCurrentExample(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter example name..."
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Selected Tool</label>
              <select
                value={selectedTool}
                onChange={(e) => setSelectedTool(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a tool...</option>
                {availableTools.map((tool) => (
                  <option key={tool.tool_name} value={tool.tool_name}>
                    {tool.tool_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <Textarea
              value={currentExample.description || ''}
              onChange={(e) => setCurrentExample(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this training example demonstrates..."
              className="min-h-[60px]"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Panel - Input Forms */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Conversation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">User Query</label>
                <Textarea
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Enter the user's question or request..."
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Assistant Response</label>
                <Textarea
                  value={assistantResponse}
                  onChange={(e) => setAssistantResponse(e.target.value)}
                  placeholder="Enter the assistant's response..."
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="w-5 h-5 mr-2" />
                Tool Execution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Tool Code</label>
                <Textarea
                  value={toolCode}
                  onChange={(e) => setToolCode(e.target.value)}
                  placeholder="Enter Python code to execute..."
                  className="min-h-[150px] font-mono text-sm"
                />
              </div>
              
              <Button
                onClick={executeToolCode}
                disabled={isExecuting || !toolCode.trim()}
                className="w-full"
              >
                {isExecuting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                {isExecuting ? 'Executing...' : 'Execute Code'}
              </Button>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Tool Result</label>
                <Textarea
                  value={toolResult}
                  onChange={(e) => setToolResult(e.target.value)}
                  placeholder="Tool execution result will appear here..."
                  className="min-h-[100px] font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Message Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MessageRenderer messages={currentExample.messages} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Example Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Messages:</span>
                  <Badge variant="outline">{currentExample.messages.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">User Messages:</span>
                  <Badge variant="outline">
                    {currentExample.messages.filter(m => m.kind === 'user').length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Assistant Messages:</span>
                  <Badge variant="outline">
                    {currentExample.messages.filter(m => m.kind === 'assistant').length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tool Calls:</span>
                  <Badge variant="outline">
                    {currentExample.messages.filter(m => m.kind === 'tool_call').length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tool Results:</span>
                  <Badge variant="outline">
                    {currentExample.messages.filter(m => m.kind === 'tool_result').length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
