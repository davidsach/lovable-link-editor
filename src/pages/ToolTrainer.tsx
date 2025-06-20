
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Calendar, 
  FileText, 
  Plus, 
  Trash2,
  Edit,
  User,
  Bot,
  Code,
  Settings
} from 'lucide-react';
import { SavedConversations } from '../components/ToolTrainer/SavedConversations';
import { SaveToDatabase } from '../components/ToolTrainer/SaveToDatabase';
import { MessageRenderer } from '../components/ToolTrainer/MessageRenderer';
import { Example, Content } from '../types/toolTrainer';

export default function ToolTrainer() {
  const [currentExample, setCurrentExample] = useState<Example>({
    id: 0,
    name: '',
    description: '',
    messages: [],
    meta: { tags: [] },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  const [newMessage, setNewMessage] = useState<Content>({
    kind: 'user',
    content: ''
  });

  const [activeTab, setActiveTab] = useState('conversation');

  const handleLoadConversation = (conversation: Example) => {
    setCurrentExample(conversation);
  };

  const handleExampleChange = (updates: Partial<Example>) => {
    setCurrentExample(prev => ({
      ...prev,
      ...updates,
      updated_at: new Date().toISOString()
    }));
  };

  const addMessage = () => {
    if (!newMessage.content || (typeof newMessage.content === 'string' && !newMessage.content.trim())) {
      return;
    }

    const messageToAdd: Content = {
      ...newMessage,
      timestamp: new Date().toISOString()
    };

    setCurrentExample(prev => ({
      ...prev,
      messages: [...prev.messages, messageToAdd],
      updated_at: new Date().toISOString()
    }));

    // Reset new message
    setNewMessage({
      kind: 'user',
      content: ''
    });
  };

  const removeMessage = (index: number) => {
    setCurrentExample(prev => ({
      ...prev,
      messages: prev.messages.filter((_, i) => i !== index),
      updated_at: new Date().toISOString()
    }));
  };

  const addTag = (tag: string) => {
    if (tag && !currentExample.meta?.tags?.includes(tag)) {
      handleExampleChange({
        meta: {
          ...currentExample.meta,
          tags: [...(currentExample.meta?.tags || []), tag]
        }
      });
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleExampleChange({
      meta: {
        ...currentExample.meta,
        tags: (currentExample.meta?.tags || []).filter(tag => tag !== tagToRemove)
      }
    });
  };

  const getMessageIcon = (kind: Content['kind']) => {
    switch (kind) {
      case 'user': return <User className="w-4 h-4" />;
      case 'assistant': return <Bot className="w-4 h-4" />;
      case 'tool_call': return <Settings className="w-4 h-4" />;
      case 'code': return <Code className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Tool Trainer</h1>
          <div className="flex items-center gap-3">
            <SavedConversations onLoadConversation={handleLoadConversation} />
            <SaveToDatabase 
              messages={currentExample.messages}
              exampleName={currentExample.name}
              description={currentExample.description}
              tags={currentExample.meta?.tags}
            />
          </div>
        </div>

        {/* Training Example Header - More Compact */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Training Example
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Example Name</label>
                <Input
                  value={currentExample.name || ''}
                  onChange={(e) => handleExampleChange({ name: e.target.value })}
                  placeholder="Enter example name..."
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Tags</label>
                <div className="flex flex-wrap gap-1">
                  {(currentExample.meta?.tags || []).map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-red-100 text-xs"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                  <Input
                    placeholder="Add tag..."
                    className="w-20 h-6 text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addTag(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <Textarea
                value={currentExample.description || ''}
                onChange={(e) => handleExampleChange({ description: e.target.value })}
                placeholder="Describe what this training example demonstrates..."
                className="min-h-[50px]"
              />
            </div>
            
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                Created: {new Date(currentExample.created_at).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                Updated: {new Date(currentExample.updated_at).toLocaleDateString()}
              </div>
              <Badge variant="outline" className="text-xs">
                {currentExample.messages?.length || 0} message{(currentExample.messages?.length || 0) !== 1 ? 's' : ''}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversation Area - Larger */}
          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Conversation
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-80px)] flex flex-col">
                <div className="flex-1 mb-4">
                  <MessageRenderer messages={currentExample.messages} />
                </div>
                
                {/* Add Message */}
                <div className="border-t pt-4 space-y-3">
                  <div className="flex gap-2">
                    <select
                      value={newMessage.kind}
                      onChange={(e) => setNewMessage(prev => ({ ...prev, kind: e.target.value as Content['kind'] }))}
                      className="px-3 py-2 border rounded-md text-sm"
                    >
                      <option value="user">User</option>
                      <option value="assistant">Assistant</option>
                      <option value="tool_call">Tool Call</option>
                      <option value="tool_result">Tool Result</option>
                      <option value="code">Code</option>
                      <option value="text">Text</option>
                    </select>
                    <Button onClick={addMessage} size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  <Textarea
                    value={typeof newMessage.content === 'string' ? newMessage.content : JSON.stringify(newMessage.content)}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                    placeholder={`Enter ${newMessage.kind} message...`}
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Message List</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {currentExample.messages.map((message, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {getMessageIcon(message.kind)}
                          <span className="text-sm font-medium capitalize">{message.kind.replace('_', ' ')}</span>
                          <span className="text-xs text-gray-500 truncate">
                            {typeof message.content === 'string' 
                              ? message.content.substring(0, 30) + (message.content.length > 30 ? '...' : '')
                              : 'Object'
                            }
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMessage(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                    {currentExample.messages.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No messages yet</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
