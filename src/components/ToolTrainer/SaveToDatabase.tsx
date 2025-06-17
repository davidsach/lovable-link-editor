
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Save, Loader2 } from 'lucide-react';
import { Message } from '@/types/toolTrainer';

interface SaveToDatabaseProps {
  messages: Message[];
  exampleName: string;
  description?: string;
}

export const SaveToDatabase: React.FC<SaveToDatabaseProps> = ({
  messages,
  exampleName,
  description = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(exampleName);
  const [desc, setDesc] = useState(description);

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // TODO: Replace with actual API call to backend
      const conversationData = {
        name,
        description: desc,
        messages,
        created_at: new Date().toISOString()
      };
      
      console.log('Saving conversation to database:', conversationData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Handle successful save response
      console.log('Conversation saved successfully');
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving conversation:', error);
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
      
      <DialogContent className="bg-gray-800 border-gray-600 text-white">
        <DialogHeader>
          <DialogTitle className="text-purple-300">Save Conversation to Database</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-300">Example Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter example name..."
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-300">Description</Label>
            <Textarea
              id="description"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Describe this training example..."
              className="bg-gray-700 border-gray-600 text-white min-h-[80px]"
            />
          </div>
          
          <div className="bg-gray-700/50 p-3 rounded border border-gray-600">
            <div className="text-sm text-gray-300 mb-2">Conversation Summary:</div>
            <div className="text-xs text-gray-400">
              • {messages.length} message{messages.length !== 1 ? 's' : ''}
              • Created: {new Date().toLocaleDateString()}
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={!name.trim() || isSaving}
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
