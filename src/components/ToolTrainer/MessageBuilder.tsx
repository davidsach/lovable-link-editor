
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, User, Bot, Play, Loader2, X, Plus, ArrowLeft } from 'lucide-react';
import { ToolCallEditor } from './ToolCallEditor';
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
  isLastMessage = false
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

  const addTextChunk = () => {
    const updatedMessage = {
      ...message,
      content: [...message.content, { type: 'text' as const, content: '' }]
    };
    onUpdate(updatedMessage);
  };

  const addToolCall = () => {
    const updatedMessage = {
      ...message,
      content: [...message.content, { 
        type: 'tool_call' as const, 
        content: '',
        tool_name: '',
        tool_id: `tool_${Date.now()}`
      }]
    };
    onUpdate(updatedMessage);
  };

  // Validation checks
  const hasTextChunk = message.content.some(c => c.type === 'text');
  const canAddTextChunk = message.role === 'user' && !hasTextChunk;
  const hasEmptyContent = message.content.some(c => !c.content.trim());

  return (
    <Card 
      className={`transition-all cursor-pointer ${
        isSelected 
          ? 'ring-2 ring-blue-500 shadow-lg' 
          : 'hover:shadow-md'
      } ${hasEmptyContent ? 'border-red-300' : ''}`}
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
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {message.content.length} chunk{message.content.length !== 1 ? 's' : ''}
            </Badge>
            {hasEmptyContent && (
              <Badge variant="destructive" className="text-xs">
                Empty content
              </Badge>
            )}
          </div>
        </div>
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
                {index > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Move content up
                      const newContent = [...message.content];
                      [newContent[index], newContent[index - 1]] = [newContent[index - 1], newContent[index]];
                      onUpdate({ ...message, content: newContent });
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <ArrowLeft className="w-3 h-3 rotate-90" />
                  </Button>
                )}
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
              />
            )}
            
            {content.type === 'tool_call' && (
              <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                <Select
                  value={content.tool_name || ''}
                  onValueChange={(value) => updateToolName(index, value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a tool..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTools.map((tool) => (
                      <SelectItem key={tool.name} value={tool.name}>
                        {tool.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <ToolCallEditor
                  value={content.content}
                  onChange={(value) => updateContent(index, value)}
                />
                
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (content.tool_id) {
                      onGetToolResult(content.tool_id);
                    }
                  }}
                  disabled={isLoading}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  Get Tool Result
                </Button>
              </div>
            )}
            
            {content.type === 'tool_result' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-sm font-medium text-green-800 mb-2">Tool Result:</div>
                <pre className="text-sm text-green-700 whitespace-pre-wrap font-mono">
                  {content.content}
                </pre>
              </div>
            )}
          </div>
        ))}

        {/* Action buttons for selected message */}
        {isSelected && (
          <div className="flex gap-2 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
            {canAddTextChunk && (
              <Button
                onClick={addTextChunk}
                variant="outline"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Text Chunk
              </Button>
            )}
            
            {message.role === 'assistant' && (
              <Button
                onClick={addToolCall}
                variant="outline"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Tool Call
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
