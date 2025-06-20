
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Save, Loader2 } from 'lucide-react';
import { Content } from '../../types/toolTrainer';

interface SaveToDatabaseProps {
  messages: Content[];
  tags?: string[];
  exampleName?: string;
}

export const SaveToDatabase: React.FC<SaveToDatabaseProps> = ({
  messages = [],
  tags = [],
  exampleName = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(exampleName);
  const [description, setDescription] = useState('');
  const [localTags, setLocalTags] = useState(tags);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Prepare the payload to match the new backend structure
      const payload = {
        name: name || `Example ${Date.now()}`,
        description: description || '',
        messages: messages,
        meta: {
          tags: localTags,
          created_by: 'user',
          source: 'tool_trainer'
        }
      };

      console.log('Saving to database with new structure:', payload);

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
      console.log('Example saved successfully with new structure:', savedExample);
      setIsOpen(false);
      
      // Reset form
      setName('');
      setDescription('');
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
          Save to DB
        </Button>
      </DialogTrigger>
      
      <DialogContent
        className="bg-gray-800 border-gray-600 text-white max-w-2xl"
        aria-describedby="save-to-db-description"
      >
        <DialogHeader>
          <DialogTitle className="text-purple-300">Save Example to Database</DialogTitle>
        </DialogHeader>

        <div id="save-to-db-description" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="example_name" className="text-gray-300">Example Name (Required)</Label>
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this example..."
              className="bg-gray-700 border-gray-600 text-white min-h-[60px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="messages_preview" className="text-gray-300">Messages ({messages.length})</Label>
            <div className="bg-gray-700 border border-gray-600 rounded p-3 max-h-32 overflow-y-auto">
              {messages.length > 0 ? (
                messages.map((msg, idx) => (
                  <div key={idx} className="text-xs text-gray-300 mb-1">
                    <span className="font-medium text-purple-400">{msg.kind}:</span> {msg.content.substring(0, 100)}...
                  </div>
                ))
              ) : (
                <span className="text-gray-500">No messages to save</span>
              )}
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
              disabled={isSaving || !name.trim() || messages.length === 0}
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
