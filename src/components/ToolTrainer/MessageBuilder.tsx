
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, User, Bot, Play, Loader2, X, AlertTriangle, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ToolCallEditor } from './ToolCallEditor';
import { Message } from '../../pages/ToolTrainer';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { ErrorDisplay } from '@/components/ui/error-display';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { validateMessageContent } from '@/utils/validation';

interface Tool {
  name: string;
  description: string;
  functions: string[];
}

interface MessageBuilderProps {
  message: Message;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (message: Message) => void;
  onGetToolResult: (toolId: string) => void;
  isLoading: boolean;
  availableTools: Tool[];
  isFirstMessage?: boolean;
  isLastMessage?: boolean;
}

export const MessageBuilder: React.FC<MessageBuilderProps> = ({
  message,
  isSelected,
  onSelect,
  onUpdate,
  onGetToolResult,
  isLoading,
  availableTools,
  isFirstMessage = false,
  isLastMessage = false,
}) => {
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ open: boolean; contentIndex: number }>({
    open: false,
    contentIndex: -1
  });
  const [executionErrors, setExecutionErrors] = useState<Record<string, string>>({});
  const [validationStates, setValidationStates] = useState<Record<number, boolean>>({});
  const { errors, addError, clearErrors, getErrorsForField } = useErrorHandler();

  const updateContent = (index: number, newContent: string) => {
    // Validate content
    const validation = validateMessageContent(newContent, message.content[index].type);
    const fieldKey = `content-${index}`;
    
    clearErrors(fieldKey);
    
    if (!validation.isValid) {
      validation.errors.forEach(error => {
        addError({
          message: error,
          type: 'error',
          field: fieldKey
        });
      });
    }
    
    validation.warnings.forEach(warning => {
      addError({
        message: warning,
        type: 'warning',
        field: fieldKey
      });
    });

    const updatedMessage = {
      ...message,
      content: message.content.map((content, i) => 
        i === index ? { ...content, content: newContent } : content
      )
    };
    onUpdate(updatedMessage);
  };

  const confirmRemoveContent = (index: number) => {
    setDeleteConfirmation({ open: true, contentIndex: index });
  };

  const removeContent = () => {
    const { contentIndex } = deleteConfirmation;
    if (contentIndex >= 0) {
      const updatedMessage = {
        ...message,
        content: message.content.filter((_, i) => i !== contentIndex)
      };
      onUpdate(updatedMessage);
      clearErrors(`content-${contentIndex}`);
    }
    setDeleteConfirmation({ open: false, contentIndex: -1 });
  };

  const handleToolExecution = async (toolId: string) => {
    const toolCall = message.content.find(c => c.tool_id === toolId);
    if (!toolCall || !toolCall.content.trim()) {
      addError({
        message: 'Cannot execute empty Python code',
        type: 'error',
        field: `tool-${toolId}`
      });
      return;
    }

    clearErrors(`tool-${toolId}`);
    setExecutionErrors(prev => ({ ...prev, [toolId]: '' }));

    try {
      await onGetToolResult(toolId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Execution failed';
      setExecutionErrors(prev => ({ ...prev, [toolId]: errorMessage }));
      addError({
        message: errorMessage,
        type: 'error',
        field: `tool-${toolId}`,
        retryable: true
      });
    }
  };

  const handleValidationChange = (contentIndex: number, isValid: boolean) => {
    setValidationStates(prev => ({ ...prev, [contentIndex]: isValid }));
  };

  // Enhanced validation checks
  const hasTextChunk = message.content.some(c => c.type === 'text');
  const hasEmptyContent = message.content.some(c => !c.content.trim());
  const hasRequiredTextForUser = message.role === 'user' ? hasTextChunk : true;
  const textChunkCount = message.content.filter(c => c.type === 'text').length;
  const hasMultipleTextChunks = message.role === 'user' && textChunkCount > 1;

  const validationErrors = [];
  if (hasEmptyContent) validationErrors.push('Empty content not allowed');
  if (!hasRequiredTextForUser) validationErrors.push('User message must have text');
  if (hasMultipleTextChunks) validationErrors.push('User can only have one text chunk');

  const allContentValid = Object.values(validationStates).every(valid => valid !== false);

  return (
    <TooltipProvider>
      <Card 
        className={`transition-all cursor-pointer relative ${
          isSelected 
            ? 'ring-2 ring-blue-500 shadow-lg' 
            : 'hover:shadow-md'
        } ${validationErrors.length > 0 ? 'border-red-300' : ''}`}
        onClick={onSelect}
        role="button"
        tabIndex={0}
        aria-label={`${message.role} message with ${message.content.length} chunks`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect();
          }
        }}
      >
        <LoadingOverlay 
          isLoading={isLoading}
          message="Executing Python code..."
          onCancel={() => {
            // Handle cancellation if supported
            console.log('Execution cancelled');
          }}
        />

        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {message.role === 'user' ? (
                <User className="w-5 h-5 text-blue-600" aria-hidden="true" />
              ) : (
                <Bot className="w-5 h-5 text-green-600" aria-hidden="true" />
              )}
              <Badge 
                variant={message.role === 'user' ? 'default' : 'secondary'}
                className="capitalize"
              >
                {message.role}
              </Badge>
              {(isFirstMessage || isLastMessage) && (
                <Badge variant="outline" className="text-xs">
                  {isFirstMessage ? 'First' : 'Last'}
                </Badge>
              )}
              {validationErrors.length > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="destructive" className="text-xs cursor-help">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {validationErrors.length} Error{validationErrors.length > 1 ? 's' : ''}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      {validationErrors.map((error, index) => (
                        <p key={index}>{error}</p>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {message.content.length} chunk{message.content.length !== 1 ? 's' : ''}
              </Badge>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <HelpCircle className="w-4 h-4 text-gray-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {message.role === 'user' 
                      ? 'User messages should contain the request or question'
                      : 'Assistant messages contain responses and Python code execution'
                    }
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <ErrorDisplay 
            errors={validationErrors.map((error, index) => ({
              id: `validation-${index}`,
              message: error,
              type: 'error' as const,
              field: 'message-validation'
            }))}
            className="mt-2"
          />
        </CardHeader>
        
        <CardContent className="space-y-4">
          {message.content.map((content, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    content.type === 'text' ? 'bg-gray-50' :
                    content.type === 'tool_call' ? 'bg-blue-50' :
                    'bg-green-50'
                  }`}
                >
                  {content.type.replace('_', ' ')}
                </Badge>
                <div className="flex items-center gap-1">
                  {message.content.length > 1 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmRemoveContent(index);
                          }}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                          aria-label={`Delete ${content.type.replace('_', ' ')} chunk`}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete this {content.type.replace('_', ' ')} chunk</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
              
              {content.type === 'text' && (
                <div className="space-y-2">
                  <Textarea
                    value={content.content}
                    onChange={(e) => {
                      e.stopPropagation();
                      updateContent(index, e.target.value);
                    }}
                    placeholder="Enter message content..."
                    className={`min-h-[80px] ${
                      !content.content.trim() ? 'border-red-300 focus:border-red-500' : ''
                    }`}
                    onClick={(e) => e.stopPropagation()}
                    required
                    aria-label={`${message.role} message content`}
                  />
                  <ErrorDisplay 
                    errors={getErrorsForField(`content-${index}`)}
                    onDismiss={clearErrors}
                  />
                </div>
              )}
              
              {content.type === 'tool_call' && (
                <div className="space-y-4">
                  <ToolCallEditor
                    value={content.content}
                    onChange={(newCode) => updateContent(index, newCode)}
                    className="mb-4"
                    onValidationChange={(isValid) => handleValidationChange(index, isValid)}
                  />
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToolExecution(content.tool_id || '');
                      }}
                      disabled={isLoading || !content.content.trim() || !allContentValid}
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
                      aria-label="Execute Python code"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      Execute Code
                    </Button>
                  </div>

                  <ErrorDisplay 
                    errors={getErrorsForField(`tool-${content.tool_id}`)}
                    onDismiss={clearErrors}
                    onRetry={(errorId) => {
                      clearErrors(`tool-${content.tool_id}`);
                      handleToolExecution(content.tool_id || '');
                    }}
                  />
                </div>
              )}
              
              {content.type === 'tool_result' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="text-sm font-medium text-green-800 mb-2">Execution Result:</div>
                  <pre className="text-sm text-green-700 whitespace-pre-wrap font-mono max-h-40 overflow-y-auto">
                    {content.content}
                  </pre>
                  {content.content.startsWith('{') && (
                    <Badge variant="outline" className="text-xs mt-2">JSON Response</Badge>
                  )}
                </div>
              )}
            </div>
          ))}
        </CardContent>

        <ConfirmationDialog
          open={deleteConfirmation.open}
          onOpenChange={(open) => setDeleteConfirmation(prev => ({ ...prev, open }))}
          title="Delete Content Chunk"
          description="Are you sure you want to delete this content chunk? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
          onConfirm={removeContent}
        />
      </Card>
    </TooltipProvider>
  );
};
