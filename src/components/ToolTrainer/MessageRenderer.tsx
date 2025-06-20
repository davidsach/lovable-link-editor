
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Bot, Code, Wrench, FileText, MessageSquare } from 'lucide-react';
import { Content } from '../../types/toolTrainer';

interface MessageRendererProps {
  messages: Content[];
}

const MessageRenderer: React.FC<MessageRendererProps> = ({ messages }) => {
  const getIcon = (kind: Content['kind']) => {
    switch (kind) {
      case 'user':
        return <User className="w-4 h-4" />;
      case 'assistant':
        return <Bot className="w-4 h-4" />;
      case 'tool_call':
        return <Wrench className="w-4 h-4" />;
      case 'tool_result':
        return <FileText className="w-4 h-4" />;
      case 'code':
        return <Code className="w-4 h-4" />;
      case 'text':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getColor = (kind: Content['kind']) => {
    switch (kind) {
      case 'user':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'assistant':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'tool_call':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'tool_result':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'code':
        return 'bg-gray-50 border-gray-200 text-gray-800';
      case 'text':
        return 'bg-slate-50 border-slate-200 text-slate-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (!messages || messages.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        No messages to display
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((message, index) => (
        <Card key={index} className={`${getColor(message.kind)} transition-all hover:shadow-md`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center gap-2 mb-2">
                {getIcon(message.kind)}
                <Badge variant="outline" className="text-xs font-medium">
                  {message.kind.replace('_', ' ').toUpperCase()}
                </Badge>
                {message.timestamp && (
                  <span className="text-xs text-gray-500">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
            
            <div className="ml-6">
              {message.kind === 'code' ? (
                <pre className="bg-gray-900 text-green-400 p-3 rounded text-sm overflow-x-auto">
                  <code>{message.content}</code>
                </pre>
              ) : (
                <div className="text-sm leading-relaxed">
                  {message.content}
                </div>
              )}
              
              {message.metadata && Object.keys(message.metadata).length > 0 && (
                <div className="mt-2 text-xs text-gray-600">
                  <strong>Metadata:</strong> {JSON.stringify(message.metadata, null, 2)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MessageRenderer;
