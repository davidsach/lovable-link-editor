
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Save, Check } from 'lucide-react';
import { conversationService } from '../../services/conversationService';
import { Message } from '../../pages/ToolTrainer';

interface SaveConversationDialogProps {
  messages: Message[];
  exampleName: string;
  onSaved?: () => void;
}

export const SaveConversationDialog: React.FC<SaveConversationDialogProps> = ({
  messages,
  exampleName,
  onSaved
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(exampleName || '');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      await conversationService.saveConversation({
        name: name.trim(),
        description: description.trim(),
        messages
      });
      
      setSaved(true);
      onSaved?.();
      
      // Reset form after a delay
      setTimeout(() => {
        setOpen(false);
        setSaved(false);
        setName('');
        setDescription('');
      }, 1500);
    } catch (error) {
      console.error('Error saving conversation:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const canSave = messages.length > 0 && name.trim() && !isSaving;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          disabled={messages.length === 0}
        >
          <Save className="w-4 h-4" />
          Save Conversation
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Conversation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="conversation-name">Name *</Label>
            <Input
              id="conversation-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter conversation name"
              disabled={isSaving || saved}
            />
          </div>
          <div>
            <Label htmlFor="conversation-description">Description</Label>
            <Textarea
              id="conversation-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description of this conversation"
              disabled={isSaving || saved}
              rows={3}
            />
          </div>
          <div className="flex justify-between items-center pt-4">
            <p className="text-sm text-gray-500">
              {messages.length} messages will be saved
            </p>
            <Button
              onClick={handleSave}
              disabled={!canSave || saved}
              className={saved ? 'bg-green-600 hover:bg-green-600' : ''}
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Saved!
                </>
              ) : isSaving ? (
                'Saving...'
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
