
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Download, Calendar, MessageSquare } from 'lucide-react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Example } from '../../types/toolTrainer';
import { useExamples } from '../../hooks/useApi';
import { examplesApi } from '../../api';
import { useToast } from '../../hooks/use-toast';


interface SavedConversationsProps {
  onLoadConversation: (conversation: Example) => void;
}

export const SavedConversations: React.FC<SavedConversationsProps> = ({ onLoadConversation }) => {
  const [selectedConversation, setSelectedConversation] = useState<Example | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ open: boolean; id: number | null }>({
    open: false,
    id: null
  });
  
  const { toast } = useToast();
  const { data: savedConversations = [], refetch: refetchExamples } = useExamples();

  const handleDelete = async (id: number) => {
    try {
      await examplesApi.deleteExample(id.toString());
      toast({
        title: 'Success',
        description: 'Example deleted successfully',
      });
      refetchExamples(); // Refresh the list
      setDeleteConfirmation({ open: false, id: null });
    } catch (err) {
      console.error('Error deleting conversation:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete example',
        variant: 'destructive',
      });
    }
  };
  

  const exportConversation = (conversation: Example) => {
    const dataStr = JSON.stringify(conversation, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const filename = `example-${conversation.name.replace(/[^\w\d-]+/g, '-')}.json`;

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getTags = (example: Example): string[] => {
    return example.meta?.tags || [];
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Saved Conversations ({savedConversations.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Saved Conversations</DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-4 h-[60vh]">
          {/* Left Panel - Conversation List */}
          <div className="w-1/2">
            <ScrollArea className="h-full">
              <div className="space-y-4 p-1">
                {savedConversations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No saved conversations yet</p>
                    <p className="text-sm">Save useful conversations to access them later</p>
                  </div>
                ) : (
                  savedConversations.map((conversation) => (
                    <Card 
                      key={conversation.id} 
                      className={`hover:shadow-md transition-shadow cursor-pointer ${
                        selectedConversation?.id === conversation.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{conversation.name}</CardTitle>
                            {conversation.description && (
                              <p className="text-sm text-gray-600 mt-1">{conversation.description}</p>
                            )}
                            {getTags(conversation).length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {getTags(conversation).map((tag, idx) => (
                                  <Badge key={idx} variant="outline">{tag}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onLoadConversation(conversation);
                              }}
                            >
                              Load
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                exportConversation(conversation);
                              }}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmation({ open: true, id: conversation.id });
                              }}
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
                            {conversation.messages?.length ?? 0} message{(conversation.messages?.length ?? 0) !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

         
        </div>

        <ConfirmationDialog
          open={deleteConfirmation.open}
          onOpenChange={(open) => setDeleteConfirmation(prev => ({ ...prev, open }))}
          title="Delete Conversation"
          description="Are you sure you want to delete this saved conversation? This action cannot be undone."
          onConfirm={() => deleteConfirmation.id && handleDelete(deleteConfirmation.id)}
        />
      </DialogContent>
    </Dialog>
  );
};
