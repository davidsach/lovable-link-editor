
/**
 * ToolCallEditor Component
 * 
 * A specialized code editor for Python tool call code with real-time validation.
 * This component provides syntax highlighting, error detection, and helpful formatting
 * for writing Python code that calls LLM tools.
 * 
 * Key Features:
 * - Real-time Python syntax validation
 * - Visual error and warning indicators
 * - Contextual help and examples
 * - Automatic code formatting suggestions
 * - Integration with tool schema validation
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Info, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { validatePythonCode, PythonValidationResult } from '@/utils/validation';

/**
 * Props interface for the ToolCallEditor component
 */
interface ToolCallEditorProps {
  /** Current Python code value */
  value: string;
  /** Callback fired when code changes */
  onChange: (value: string) => void;
  /** Additional CSS classes to apply */
  className?: string;
  /** Callback fired when validation status changes */
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

  useEffect(() => {
    const result = validatePythonCode(value);
    setValidation(result);
    onValidationChange?.(result.isValid);
  }, [value, onValidationChange]);

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
    return { icon: Info, color: 'text-muted-foreground', label: 'Empty' };
  };

  const status = getValidationStatus();
  const StatusIcon = status.icon;

  const allErrors = [...validation.errors, ...validation.syntaxErrors.map(e => e.message)];
  const hasErrors = allErrors.length > 0;

  return (
    <TooltipProvider>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-foreground">Python Code:</label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0"
                  onClick={() => setShowHelp(!showHelp)}
                >
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
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
            className={`font-mono text-sm min-h-[200px] bg-muted border-input resize-y text-foreground ${
              hasErrors
                ? 'border-destructive focus:border-destructive' 
                : validation.warnings.length > 0 
                ? 'border-yellow-500 focus:border-yellow-600'
                : 'border-input'
            } ${className || ''}`}
            spellCheck={false}
            aria-label="Python code editor"
            aria-describedby="python-code-help"
          />
        </div>

        {/* Clear Error Messages */}
        {hasErrors && (
          <Alert variant="destructive" className="mt-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                {allErrors.map((error, index) => (
                  <div key={index} className="text-sm">
                    {error}
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Warning Messages */}
        {validation.warnings.length > 0 && !hasErrors && (
          <Alert className="mt-2 border-yellow-300 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription>
              <div className="space-y-1">
                {validation.warnings.map((warning, index) => (
                  <div key={index} className="text-sm text-yellow-800">
                    {warning}
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground" id="python-code-help">
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
