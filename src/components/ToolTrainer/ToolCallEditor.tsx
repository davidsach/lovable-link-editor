
import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Info, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { validatePythonCode, PythonValidationResult } from '@/utils/validation';
import { ErrorDisplay } from '@/components/ui/error-display';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface ToolCallEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  onValidationChange?: (isValid: boolean) => void;
}

export const ToolCallEditor: React.FC<ToolCallEditorProps> = ({ 
  value, 
  onChange, 
  className,
  onValidationChange 
}) => {
  const [validation, setValidation] = useState<PythonValidationResult>({ 
    isValid: true, 
    errors: [], 
    warnings: [], 
    syntaxErrors: [] 
  });
  const [showHelp, setShowHelp] = useState(false);
  const { errors, addError, clearErrors } = useErrorHandler();

  useEffect(() => {
    const result = validatePythonCode(value);
    setValidation(result);
    onValidationChange?.(result.isValid);
    
    // Clear previous validation errors
    clearErrors('python-code');
    
    // Add new validation errors
    result.errors.forEach(error => {
      addError({
        message: error,
        type: 'error',
        field: 'python-code'
      });
    });
    
    result.syntaxErrors.forEach(syntaxError => {
      addError({
        message: syntaxError.message,
        type: 'error',
        field: 'python-code',
        line: syntaxError.line
      });
    });
    
    result.warnings.forEach(warning => {
      addError({
        message: warning,
        type: 'warning',
        field: 'python-code'
      });
    });
  }, [value, onValidationChange, addError, clearErrors]);

  const handleChange = (newValue: string) => {
    onChange(newValue);
  };

  const getValidationStatus = () => {
    if (validation.errors.length > 0 || validation.syntaxErrors.length > 0) {
      return { icon: AlertTriangle, color: 'text-red-600', label: 'Errors Found' };
    }
    if (validation.warnings.length > 0) {
      return { icon: AlertTriangle, color: 'text-yellow-600', label: 'Warnings' };
    }
    if (value.trim()) {
      return { icon: CheckCircle, color: 'text-green-600', label: 'Valid' };
    }
    return { icon: Info, color: 'text-gray-500', label: 'Empty' };
  };

  const status = getValidationStatus();
  const StatusIcon = status.icon;

  return (
    <TooltipProvider>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Python Code:</label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0"
                  onClick={() => setShowHelp(!showHelp)}
                >
                  <HelpCircle className="w-4 h-4 text-gray-400" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click for Python coding guidelines and examples</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`text-xs ${status.color}`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {status.label}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Python
            </Badge>
          </div>
        </div>

        {showHelp && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <h4 className="font-medium text-blue-900 mb-2">Python Coding Guidelines:</h4>
            <ul className="space-y-1 text-blue-800">
              <li>• Use standard Python libraries (requests, json, math, etc.)</li>
              <li>• Avoid file operations, subprocess, or system commands</li>
              <li>• Keep code concise and focused on the task</li>
              <li>• Use print() to display results</li>
              <li>• Handle errors with try/except blocks</li>
            </ul>
          </div>
        )}

        <div className="relative">
          <Textarea
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={`# Write your Python code here
# Example:
import requests
import json

# Make API call
try:
    response = requests.get("https://api.example.com/data")
    data = response.json()
    print("Success:", data)
except Exception as e:
    print("Error:", str(e))`}
            className={`font-mono text-sm min-h-[200px] bg-gray-50 border-gray-300 resize-y ${
              validation.errors.length > 0 || validation.syntaxErrors.length > 0 
                ? 'border-red-300 focus:border-red-500' 
                : validation.warnings.length > 0 
                ? 'border-yellow-300 focus:border-yellow-500'
                : 'border-gray-300'
            } ${className || ''}`}
            spellCheck={false}
            aria-label="Python code editor"
            aria-describedby="python-code-help"
          />
        </div>

        <ErrorDisplay 
          errors={errors.filter(e => e.field === 'python-code')}
          onDismiss={clearErrors}
          className="mt-2"
        />

        <div className="text-xs text-gray-500" id="python-code-help">
          Write Python code that will be executed safely. Results will be captured and displayed below.
          {value.length > 0 && (
            <span className="ml-2">
              {value.length} characters • {value.split('\n').length} lines
            </span>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};
