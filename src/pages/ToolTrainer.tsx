import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast"
import { useTools, useExecuteToolResult, useExecuteAllTools } from '@/hooks/useApi';
import { Tool, CodeChunk } from '@/api/types';
import ExamplesManager from '@/components/ToolTrainer/ExamplesManager';

const ToolTrainer = () => {
  const [pythonCode, setPythonCode] = useState('');
  const [codeChunks, setCodeChunks] = useState<{ id: number; code: string }[]>([{ id: 1, code: '' }]);
  const [toolCallResults, setToolCallResults] = useState<any[]>([]);
  const [availableToolsVisible, setAvailableToolsVisible] = useState(false);
  const [allToolCallResultsVisible, setAllToolCallResultsVisible] = useState(false);
  const { toast } = useToast();

  const { data: tools, isLoading: toolsLoading, error: toolsError } = useTools();
  const executeToolResultMutation = useExecuteToolResult();
  const executeAllToolsMutation = useExecuteAllTools();

  const handleExecuteCode = () => {
    executeToolResultMutation.mutate(
      { code: pythonCode },
      {
        onSuccess: (data) => {
          setToolCallResults(prevResults => [...prevResults, { code: pythonCode, result: data }]);
          toast({
            title: "Code Executed",
            description: "The code has been successfully executed.",
          })
        },
        onError: (error: any) => {
          toast({
            variant: "destructive",
            title: "Error",
            description: `Failed to execute code: ${error.message}`,
          })
        },
      }
    );
  };

  const handleAddCodeChunk = () => {
    setCodeChunks(prevChunks => [...prevChunks, { id: prevChunks.length + 1, code: '' }]);
  };

  const handleCodeChunkChange = (id: number, code: string) => {
    setCodeChunks(prevChunks =>
      prevChunks.map(chunk => (chunk.id === id ? { ...chunk, code } : chunk))
    );
  };

  const handleExecuteAllCodeChunks = () => {
    const chunks: CodeChunk[] = codeChunks.map(chunk => ({ chunk_id: chunk.id, code: chunk.code }));
    executeAllToolsMutation.mutate(
      { code_chunks: chunks },
      {
        onSuccess: (data) => {
          setToolCallResults(prevResults => [...prevResults, { chunks, result: data }]);
          toast({
            title: "All Code Chunks Executed",
            description: "All code chunks have been successfully executed.",
          })
        },
        onError: (error: any) => {
          toast({
            variant: "destructive",
            title: "Error",
            description: `Failed to execute all code chunks: ${error.message}`,
          })
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md p-4">
        <h1 className="text-2xl font-semibold">Tool Trainer</h1>
      </header>

      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto" style={{ height: 'calc(100vh - 64px)' }}>
          <div className="space-y-6">
            {/* Examples Manager Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Training Examples</h3>
              <ExamplesManager onExampleSelect={(example) => {
                console.log('Selected example:', example);
                toast({
                  title: 'Example Selected',
                  description: `Selected: ${example.name}`,
                });
              }} />
            </div>

            <Separator />

            {/* Available Tools Section */}
            <div>
              <Button variant="secondary" onClick={() => setAvailableToolsVisible(!availableToolsVisible)}>
                {availableToolsVisible ? 'Hide Available Tools' : 'Show Available Tools'}
              </Button>

              {availableToolsVisible && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Available Tools</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {toolsLoading ? (
                      <div>Loading tools...</div>
                    ) : toolsError ? (
                      <div>Error: {toolsError.message}</div>
                    ) : (
                      <ScrollArea className="h-48">
                        <div className="space-y-2">
                          {tools?.map((tool: Tool) => (
                            <div key={tool.tool_name} className="p-2 rounded border border-gray-200">
                              <h4 className="font-medium">{tool.tool_name}</h4>
                              <p className="text-sm text-gray-500">{tool.description}</p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            <Separator />

            {/* All Tool Call Results Section */}
            <div>
              <Button variant="secondary" onClick={() => setAllToolCallResultsVisible(!allToolCallResultsVisible)}>
                {allToolCallResultsVisible ? 'Hide All Tool Call Results' : 'Show All Tool Call Results'}
              </Button>

              {allToolCallResultsVisible && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>All Tool Call Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-48">
                      <div className="space-y-2">
                        {toolCallResults.map((call, index) => (
                          <div key={index} className="p-2 rounded border border-gray-200">
                            <h4 className="font-medium">Call {index + 1}</h4>
                            {call.code && <p className="text-sm"><strong>Code:</strong> {call.code}</p>}
                            {call.chunks && (
                              <div>
                                <strong>Chunks:</strong>
                                {call.chunks.map((chunk: any) => (
                                  <p key={chunk.chunk_id} className="text-sm">
                                    Chunk {chunk.chunk_id}: {chunk.code}
                                  </p>
                                ))}
                              </div>
                            )}
                            <p className="text-sm"><strong>Result:</strong> {JSON.stringify(call.result)}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>

          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-4">
          {/* Python Code Input */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Python Code</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={pythonCode}
                onChange={(e) => setPythonCode(e.target.value)}
                placeholder="Enter Python code here"
                className="mb-2"
              />
              <Button onClick={handleExecuteCode}>Execute Code</Button>
            </CardContent>
          </Card>

          {/* Multiple Code Chunks Input */}
          <Card>
            <CardHeader>
              <CardTitle>Multiple Code Chunks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {codeChunks.map((chunk) => (
                  <div key={chunk.id} className="flex items-center space-x-2">
                    <label htmlFor={`chunk-${chunk.id}`}>Chunk {chunk.id}:</label>
                    <Input
                      type="text"
                      id={`chunk-${chunk.id}`}
                      value={chunk.code}
                      onChange={(e) => handleCodeChunkChange(chunk.id, e.target.value)}
                      className="flex-1"
                    />
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={handleAddCodeChunk}>Add Code Chunk</Button>
                <Button onClick={handleExecuteAllCodeChunks}>Execute All Code Chunks</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ToolTrainer;
