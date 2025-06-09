
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, User, Bot, Play, Loader2, X, AlertTriangle } from 'lucide-react';
import { ToolCallStep } from './ToolCallStep';
import { Message } from '../../pages/ToolTrainer';

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
  const updateContent = (index: number, newContent: string) => {
    const updatedMessage = {
      ...message,
      content: message.content.map((content, i) => 
        i === index ? { ...content, content: newContent } : content
      )
    };
    onUpdate(updatedMessage);
  };

  const updateToolName = (index: number, toolName: string) => {
    const updatedMessage = {
      ...message,
      content: message.content.map((content, i) => 
        i === index ? { ...content, tool_name: toolName } : content
      )
    };
    onUpdate(updatedMessage);
  };

  const removeContent = (index: number) => {
    const updatedMessage = {
      ...message,
      content: message.content.filter((_, i) => i !== index)
    };
    onUpdate(updatedMessage);
  };

  // Validation checks
  const hasTextChunk = message.content.some(c => c.type === 'text');
  const hasEmptyContent = message.content.some(c => !c.content.trim());
  const hasRequiredTextForUser = message.role === 'user' ? hasTextChunk : true;
  const textChunkCount = message.content.filter(c => c.type === 'text').length;
  const hasMultipleTextChunks = message.role === 'user' && textChunkCount > 1;

  const validationErrors = [];
  if (hasEmptyContent) validationErrors.push('Empty content not allowed');
  if (!hasRequiredTextForUser) validationErrors.push('User message must have text');
  if (hasMultipleTextChunks) validationErrors.push('User can only have one text chunk');

  return (
    <Card 
      className={`transition-all cursor-pointer ${
        isSelected 
          ? 'ring-2 ring-blue-500 shadow-lg' 
          : 'hover:shadow-md'
      } ${validationErrors.length > 0 ? 'border-red-300' : ''}`}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {message.role === 'user' ? (
              <User className="w-5 h-5 text-blue-600" />
            ) : (
              <Bot className="w-5 h-5 text-green-600" />
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
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {validationErrors.length} Error{validationErrors.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {message.content.length} chunk{message.content.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
        {validationErrors.length > 0 && (
          <div className="mt-2 space-y-1">
            {validationErrors.map((error, index) => (
              <div key={index} className="text-xs text-red-600 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {error}
              </div>
            ))}
          </div>
        )}
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeContent(index);
                    }}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
            
            {content.type === 'text' && (
              <Textarea
                value={content.content}
                onChange={(e) => {
                  e.stopPropagation();
                  updateContent(index, e.target.value);
                }}
                placeholder="Enter message content..."
                className={`min-h-[80px] ${!content.content.trim() ? 'border-red-300' : ''}`}
                onClick={(e) => e.stopPropagation()}
                required
              />
            )}
            
            {content.type === 'tool_call' && (
              <ToolCallStep
                content={content}
                availableTools={availableTools}
                onContentChange={(newContent) => updateContent(index, newContent)}
                onToolNameChange={(toolName) => updateToolName(index, toolName)}
                onGetToolResult={onGetToolResult}
                isLoading={isLoading}
              />
            )}
            
            {content.type === 'tool_result' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-sm font-medium text-green-800 mb-2">Tool Result:</div>
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
    </Card>
  );
};
