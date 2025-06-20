
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Save, Loader2 } from 'lucide-react';
import { Content, CreateExampleRequest } from '../../types/toolTrainer';

interface SaveToDatabaseProps {
  messages: Content[];
  exampleName?: string;
  description?: string;
  tags?: string[];
}

export const SaveToDatabase: React.FC<SaveToDatabaseProps> = ({
  messages,
  exampleName = '',
  description = '',
  tags = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(exampleName);
  const [desc, setDesc] = useState(description);
  const [localTags, setLocalTags] = useState(tags);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const payload: CreateExampleRequest = {
        name: name.trim() || `Example ${Date.now()}`,
        description: desc.trim() || undefined,
        messages: messages || [],
        meta: {
          tags: localTags,
        }
      };

      console.log('Saving example to database with payload:', payload);

      const response = await fetch('http://127.0.0.1:8000/examples/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to save: ${response.status} - ${errorData}`);
      }

      const savedExample = await response.json();
      console.log('Example saved successfully:', savedExample);
      setIsOpen(false);
      
      // Reset form
      setName('');
      setDesc('');
      setLocalTags([]);
    } catch (error) {
      console.error('Error saving example:', error);
      // TODO: Add proper error handling/toast
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-purple-500/20 border-purple-400/50 text-purple-300 hover:bg-purple-500/30 hover:border-purple-400 shadow-lg transition-all duration-200 px-6 h-11"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Conversation
        </Button>
      </DialogTrigger>
      
      <DialogContent
        className="bg-gray-800 border-gray-600 text-white max-w-2xl"
        aria-describedby="save-to-db-description"
      >
        <DialogHeader>
          <DialogTitle className="text-purple-300">Save Conversation to Database</DialogTitle>
        </DialogHeader>

        <div id="save-to-db-description" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="example_name" className="text-gray-300">Example Name</Label>
            <Input
              id="example_name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter example name..."
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="example_description" className="text-gray-300">Description</Label>
            <Textarea
              id="example_description"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Describe this example..."
              className="bg-gray-700 border-gray-600 text-white min-h-[60px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="messages_count" className="text-gray-300">Messages</Label>
            <div className="bg-gray-700 border border-gray-600 rounded p-3 text-sm">
              {messages.length} message{messages.length !== 1 ? 's' : ''} will be saved
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags" className="text-gray-300">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={localTags.join(', ')}
              onChange={e => setLocalTags(e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag))}
              placeholder="Enter tags separated by commas"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving || !name.trim() || !messages.length}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isSaving ? 'Saving...' : 'Save to Database'}
            </Button>
            
            <Button
              onClick={() => setIsOpen(false)}
              variant="outline"
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
