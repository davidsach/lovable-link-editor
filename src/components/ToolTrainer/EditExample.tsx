
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Edit, Loader2, Save } from 'lucide-react';

interface EditExampleProps {
  currentExample: {
    id?: string;
    name: string;
    description?: string;
    messages: any[];
  };
  onExampleUpdated: (updatedExample: any) => void;
}

export const EditExample: React.FC<EditExampleProps> = ({
  currentExample,
  onExampleUpdated
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [name, setName] = useState(currentExample.name);
  const [description, setDescription] = useState(currentExample.description || '');

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    try {
      // TODO: Replace with actual API call to backend
      const updatedExample = {
        ...currentExample,
        name,
        description,
        updated_at: new Date().toISOString()
      };
      
      console.log('Updating example:', updatedExample);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onExampleUpdated(updatedExample);
      console.log('Example updated successfully');
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
      setName(currentExample.name);
      setDescription(currentExample.description || '');
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
      
      <DialogContent className="bg-gray-800 border-gray-600 text-white">
        <DialogHeader>
          <DialogTitle className="text-orange-300">Edit/Update Example</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-700/50 p-3 rounded border border-gray-600">
            <div className="text-sm text-gray-300 mb-2">Current Example:</div>
            <div className="text-xs text-gray-400">
              • ID: {currentExample.id || 'New Example'}
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
