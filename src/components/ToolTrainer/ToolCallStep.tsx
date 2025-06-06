
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Play, Trash2, Loader2 } from 'lucide-react';
import { useToolSchema, useExecuteTool } from '@/hooks/useApi';
import { Tool } from '@/services/api';

interface ToolCallStepProps {
  stepIndex: number;
  toolName: string;
  parameters: Record<string, any>;
  toolResult: string;
  availableTools: Tool[];
  onToolNameChange: (toolName: string) => void;
  onParametersChange: (parameters: Record<string, any>) => void;
  onToolResultChange: (result: string) => void;
  onDelete: () => void;
  onExecute: () => void;
}

export const ToolCallStep: React.FC<ToolCallStepProps> = ({
  stepIndex,
  toolName,
  parameters,
  toolResult,
  availableTools,
  onToolNameChange,
  onParametersChange,
  onToolResultChange,
  onDelete,
  onExecute
}) => {
  const { data: toolSchema, isLoading: schemaLoading } = useToolSchema(toolName);
  const executeToolMutation = useExecuteTool();
  const [localParameters, setLocalParameters] = useState(parameters);

  useEffect(() => {
    setLocalParameters(parameters);
  }, [parameters]);

  const handleParameterChange = (paramName: string, value: any) => {
    const newParams = { ...localParameters, [paramName]: value };
    setLocalParameters(newParams);
    onParametersChange(newParams);
  };

  const handleExecuteTool = async () => {
    if (!toolName) return;
    
    try {
      const result = await executeToolMutation.mutateAsync({
        tool_name: toolName,
        parameters: localParameters
      });
      
      const formattedResult = typeof result.result === 'object' 
        ? JSON.stringify(result.result, null, 2)
        : String(result.result);
        
      onToolResultChange(formattedResult);
      onExecute();
    } catch (error) {
      console.error('Tool execution failed:', error);
    }
  };

  const renderParameterInput = (param: any) => {
    const value = localParameters[param.name] || '';
    
    switch (param.type) {
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleParameterChange(param.name, Number(e.target.value))}
            placeholder={`Enter ${param.name}`}
          />
        );
      case 'boolean':
        return (
          <Select
            value={String(value)}
            onValueChange={(val) => handleParameterChange(param.name, val === 'true')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select true/false" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        );
      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            placeholder={`Enter ${param.name}`}
          />
        );
    }
  };

  return (
    <Card className="border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Step {stepIndex + 1}: Tool Call</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Tool Selection */}
        <div className="space-y-2">
          <Label>Select Tool</Label>
          <Select value={toolName} onValueChange={onToolNameChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a tool..." />
            </SelectTrigger>
            <SelectContent>
              {availableTools.map((tool) => (
                <SelectItem key={tool.name} value={tool.name}>
                  {tool.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dynamic Parameters */}
        {toolName && schemaLoading && (
          <div className="flex items-center text-sm text-gray-500">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Loading tool schema...
          </div>
        )}

        {toolName && toolSchema && toolSchema.parameters && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tool Parameters</Label>
            {toolSchema.parameters.map((param) => (
              <div key={param.name} className="space-y-1">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">{param.name}</Label>
                  <Badge variant="outline" className="text-xs">
                    {param.type}
                  </Badge>
                  {param.required && (
                    <Badge variant="destructive" className="text-xs">
                      Required
                    </Badge>
                  )}
                </div>
                {param.description && (
                  <p className="text-xs text-gray-500">{param.description}</p>
                )}
                {renderParameterInput(param)}
              </div>
            ))}
          </div>
        )}

        {/* Execute Button */}
        <div className="flex gap-2">
          <Button
            onClick={handleExecuteTool}
            disabled={!toolName || executeToolMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {executeToolMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Execute Tool
          </Button>
        </div>

        {/* Tool Result */}
        <div className="space-y-2">
          <Label>Tool Result</Label>
          <Textarea
            value={toolResult}
            onChange={(e) => onToolResultChange(e.target.value)}
            placeholder="Tool result will appear here after execution..."
            className="min-h-[100px] font-mono text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
};
