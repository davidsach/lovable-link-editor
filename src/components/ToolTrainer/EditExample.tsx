
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Edit, Loader2, Save } from 'lucide-react';
import { Example } from '../../types/toolTrainer';

interface EditExampleProps {
  currentExample: Example;
  onExampleUpdated: (updatedExample: Example) => void;
}

export const EditExample: React.FC<EditExampleProps> = ({
  currentExample,
  onExampleUpdated
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [name, setName] = useState(currentExample.name || '');
  const [description, setDescription] = useState(currentExample.description || '');
  const [tags, setTags] = useState(currentExample.meta?.tags?.join(', ') || '');

  const handleUpdate = async () => {
    if (!currentExample.id) {
      console.error('Cannot update example without ID');
      return;
    }

    setIsUpdating(true);
    
    try {
      const updatedData = {
        name: name.trim() || `Example ${currentExample.id}`,
        description: description.trim(),
        messages: currentExample.messages,
        meta: {
          ...currentExample.meta,
          tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        }
        
      };
      
      console.log('Updating example:', currentExample.id, updatedData);
      
      const response = await fetch(`http://127.0.0.1:8000/examples/${currentExample.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to update example: ${response.status} - ${errorData}`);
      }

      const updatedExample = await response.json();
      onExampleUpdated(updatedExample);
      console.log('Example updated successfully:', updatedExample);
      setIsOpen(false);
    } catch (error) {
      console.error('Error updating example:', error);
      // TODO: Add proper error handling/toast
    } finally {
      setIsUpdating(false);
    }
  };

  // Reset form when dialog opens
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setName(currentExample.name || '');
      setDescription(currentExample.description || '');
      setTags(currentExample.meta?.tags?.join(', ') || '');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-orange-500/20 border-orange-400/50 text-orange-300 hover:bg-orange-500/30 hover:border-orange-400 shadow-lg transition-all duration-200 px-6 h-11"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Example
        </Button>
      </DialogTrigger>
      
      <DialogContent className="bg-gray-800 border-gray-600 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-orange-300">Edit Example</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-700/50 p-3 rounded border border-gray-600">
            <div className="text-sm text-gray-300 mb-2">Current Example:</div>
            <div className="text-xs text-gray-400">
              • ID: {currentExample.id || 'New Example'}
              • Created: {currentExample.created_at ? new Date(currentExample.created_at).toLocaleDateString() : 'Unknown'}
              • Messages: {currentExample.messages?.length || 0}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="editName" className="text-gray-300">Example Name</Label>
            <Input
              id="editName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter example name..."
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="editDescription" className="text-gray-300">Description</Label>
            <Textarea
              id="editDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this training example..."
              className="bg-gray-700 border-gray-600 text-white min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="editTags" className="text-gray-300">Tags (comma separated)</Label>
            <Input
              id="editTags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Enter tags separated by commas..."
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleUpdate}
              disabled={!name.trim() || isUpdating}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isUpdating ? 'Updating...' : 'Update Example'}
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
