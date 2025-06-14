
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Download, Calendar, MessageSquare } from 'lucide-react';
import { conversationService } from '../../services/conversationService';
import { SavedConversation } from '../../types/toolTrainer';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface SavedConversationsProps {
  onLoadConversation: (conversation: SavedConversation) => void;
}

export const SavedConversations: React.FC<SavedConversationsProps> = ({ onLoadConversation }) => {
  const [savedConversations, setSavedConversations] = useState<SavedConversation[]>([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ open: boolean; id: string }>({
    open: false,
    id: ''
  });

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = () => {
    const conversations = conversationService.getSavedConversations();
    setSavedConversations(conversations);
  };

  const handleDelete = (id: string) => {
    conversationService.deleteConversation(id);
    loadConversations();
    setDeleteConfirmation({ open: false, id: '' });
  };

  const exportConversation = (conversation: SavedConversation) => {
    const dataStr = JSON.stringify(conversation, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `conversation-${conversation.name.replace(/\s+/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Saved Conversations ({savedConversations.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Saved Conversations</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh]">
          <div className="space-y-4 p-1">
            {savedConversations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No saved conversations yet</p>
                <p className="text-sm">Save useful conversations to access them later</p>
              </div>
            ) : (
              savedConversations.map((conversation) => (
                <Card key={conversation.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{conversation.name}</CardTitle>
                        {conversation.description && (
                          <p className="text-sm text-gray-600 mt-1">{conversation.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onLoadConversation(conversation)}
                        >
                          Load
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportConversation(conversation)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteConfirmation({ open: true, id: conversation.id })}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(conversation.created_at).toLocaleDateString()}
                      </div>
                      <Badge variant="outline">
                        {conversation.messages.length} messages
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>

        <ConfirmationDialog
          open={deleteConfirmation.open}
          onOpenChange={(open) => setDeleteConfirmation(prev => ({ ...prev, open }))}
          title="Delete Conversation"
          description="Are you sure you want to delete this saved conversation? This action cannot be undone."
          onConfirm={() => handleDelete(deleteConfirmation.id)}
        />
      </DialogContent>
    </Dialog>
  );
};
