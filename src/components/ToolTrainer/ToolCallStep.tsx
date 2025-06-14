
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Play, Trash2, Loader2, CheckCircle } from 'lucide-react';
import { useToolSchema, useExecuteTool } from '@/hooks/useApi';
import { Tool } from '@/services/api';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  hasErrors?: boolean;
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
  onExecute,
  hasErrors = false
}) => {
  const { data: toolSchema, isLoading: schemaLoading } = useToolSchema(toolName);
  const executeToolMutation = useExecuteTool();
  const [localParameters, setLocalParameters] = useState(parameters);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setLocalParameters(parameters);
  }, [parameters]);

  useEffect(() => {
    if (toolSchema) {
      validateParameters();
    }
  }, [localParameters, toolSchema]);

  const validateParameters = () => {
    const errors: Record<string, string> = {};
    
    if (toolSchema?.parameters) {
      toolSchema.parameters.forEach(param => {
        const value = localParameters[param.name];
        
        if (param.required && (!value || value === '')) {
          errors[param.name] = `${param.name} is required`;
        }
        
        if (value && param.type === 'number' && isNaN(Number(value))) {
          errors[param.name] = `${param.name} must be a valid number`;
        }
      });
    }
    
    setValidationErrors(errors);
  };

  const handleParameterChange = (paramName: string, value: any) => {
    const newParams = { ...localParameters, [paramName]: value };
    setLocalParameters(newParams);
    onParametersChange(newParams);
  };

  const handleExecuteTool = async () => {
    if (!toolName || Object.keys(validationErrors).length > 0) return;
    
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
      const errorMessage = error instanceof Error ? error.message : 'Tool execution failed';
      onToolResultChange(`Error: ${errorMessage}`);
      console.error('Tool execution failed:', error);
    }
  };

  const renderParameterInput = (param: any) => {
    const value = localParameters[param.name] || '';
    const hasError = validationErrors[param.name];
    
    const inputProps = {
      className: hasError ? 'border-red-500' : '',
    };
    
    switch (param.type) {
      case 'number':
        return (
          <div className="space-y-1">
            <Input
              {...inputProps}
              type="number"
              value={value}
              onChange={(e) => handleParameterChange(param.name, Number(e.target.value))}
              placeholder={`Enter ${param.name}`}
              required={param.required}
            />
            {hasError && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {hasError}
              </p>
            )}
          </div>
        );
      case 'boolean':
        return (
          <div className="space-y-1">
            <Select
              value={String(value)}
              onValueChange={(val) => handleParameterChange(param.name, val === 'true')}
            >
              <SelectTrigger className={hasError ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select true/false" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
              </SelectContent>
            </Select>
            {hasError && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {hasError}
              </p>
            )}
          </div>
        );
      default:
        return (
          <div className="space-y-1">
            <Input
              {...inputProps}
              type="text"
              value={value}
              onChange={(e) => handleParameterChange(param.name, e.target.value)}
              placeholder={`Enter ${param.name}`}
              required={param.required}
            />
            {hasError && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {hasError}
              </p>
            )}
          </div>
        );
    }
  };

  const hasValidationErrors = Object.keys(validationErrors).length > 0;
  const isExecuteDisabled = !toolName || hasValidationErrors || executeToolMutation.isPending;

  return (
    <TooltipProvider>
      <Card className={`border-blue-200 ${hasErrors ? 'border-red-300' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              Step {stepIndex + 1}: Tool Call
              {hasValidationErrors && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Validation Error
                </Badge>
              )}
              {!hasValidationErrors && toolResult && (
                <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Executed
                </Badge>
              )}
            </CardTitle>
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
            <Label>Select Tool *</Label>
            <Select value={toolName} onValueChange={onToolNameChange} required>
              <SelectTrigger className={!toolName ? 'border-red-300' : ''}>
                <SelectValue placeholder="Choose a tool..." />
              </SelectTrigger>
              <SelectContent>
                {availableTools.map((tool) => (
                  <SelectItem key={tool.tool_name} value={tool.tool_name}>
                    <div className="flex flex-col">
                      <span className="font-medium">{tool.tool_name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!toolName && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Tool selection is required
              </p>
            )}
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
                    {param.description && (
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="outline" className="text-xs cursor-help">
                            ?
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{param.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  {renderParameterInput(param)}
                </div>
              ))}
            </div>
          )}

          {/* Execute Button */}
          <div className="flex gap-2">
            <Button
              onClick={handleExecuteTool}
              disabled={isExecuteDisabled}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
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
            <Label>Tool Result *</Label>
            <Textarea
              value={toolResult}
              onChange={(e) => onToolResultChange(e.target.value)}
              placeholder="Tool result will appear here after execution..."
              className={`min-h-[100px] font-mono text-sm ${!toolResult ? 'border-red-300' : ''}`}
              required
            />
            {!toolResult && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Tool result cannot be empty
              </p>
            )}
            {toolResult && toolResult.startsWith('{') && (
              <div className="bg-gray-50 p-2 rounded text-xs">
                <Badge variant="outline" className="text-xs">JSON Result</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
