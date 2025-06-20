
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, Bot, Settings, Code, FileText, Play } from 'lucide-react';
import { Content } from '../../types/toolTrainer';

interface MessageRendererProps {
  messages: Content[];
  className?: string;
}

export const MessageRenderer: React.FC<MessageRendererProps> = ({ 
  messages, 
  className = '' 
}) => {
  const getIcon = (kind: Content['kind']) => {
    switch (kind) {
      case 'user':
        return <User className="w-4 h-4" />;
      case 'assistant':
        return <Bot className="w-4 h-4" />;
      case 'tool_call':
        return <Settings className="w-4 h-4" />;
      case 'tool_result':
        return <Play className="w-4 h-4" />;
      case 'code':
        return <Code className="w-4 h-4" />;
      case 'text':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getVariant = (kind: Content['kind']) => {
    switch (kind) {
      case 'user':
        return 'default';
      case 'assistant':
        return 'secondary';
      case 'tool_call':
        return 'outline';
      case 'tool_result':
        return 'outline';
      case 'code':
        return 'outline';
      case 'text':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const formatContent = (content: Content) => {
    if (typeof content.content === 'string') {
      return content.content;
    }
    return JSON.stringify(content.content, null, 2);
  };

  const renderToolCall = (content: Content) => {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {content.tool_name || 'Unknown Tool'}
          </Badge>
        </div>
        {content.parameters && (
          <div className="bg-gray-100 p-2 rounded text-xs font-mono">
            <div className="text-gray-600 mb-1">Parameters:</div>
            <pre>{JSON.stringify(content.parameters, null, 2)}</pre>
          </div>
        )}
        {typeof content.content === 'string' && content.content && (
          <div className="text-sm">{content.content}</div>
        )}
      </div>
    );
  };

  const renderToolResult = (content: Content) => {
    return (
      <div className="space-y-2">
        {content.tool_name && (
          <Badge variant="outline" className="text-xs">
            Result from {content.tool_name}
          </Badge>
        )}
        <div className="bg-green-50 p-2 rounded text-xs font-mono">
          <div className="text-green-700 mb-1">Result:</div>
          <pre className="whitespace-pre-wrap">
            {content.result ? JSON.stringify(content.result, null, 2) : formatContent(content)}
          </pre>
        </div>
      </div>
    );
  };

  const renderCode = (content: Content) => {
    return (
      <div className="bg-gray-900 text-gray-100 p-3 rounded">
        <div className="text-gray-400 text-xs mb-2">Code:</div>
        <pre className="text-sm overflow-x-auto">
          <code>{formatContent(content)}</code>
        </pre>
      </div>
    );
  };

  if (!messages || messages.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No messages to display</p>
      </div>
    );
  }

  return (
    <ScrollArea className={`h-full ${className}`}>
      <div className="space-y-3 p-1">
        {messages.map((message, index) => (
          <Card key={index} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <Badge variant={getVariant(message.kind)} className="flex items-center gap-1">
                    {getIcon(message.kind)}
                    <span className="capitalize">{message.kind.replace('_', ' ')}</span>
                  </Badge>
                </div>
                
                <div className="flex-1 min-w-0">
                  {message.kind === 'tool_call' && renderToolCall(message)}
                  {message.kind === 'tool_result' && renderToolResult(message)}
                  {message.kind === 'code' && renderCode(message)}
                  {!['tool_call', 'tool_result', 'code'].includes(message.kind) && (
                    <div className="text-sm whitespace-pre-wrap">
                      {formatContent(message)}
                    </div>
                  )}
                  
                  {message.timestamp && (
                    <div className="text-xs text-gray-500 mt-2">
                      {new Date(message.timestamp).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};
