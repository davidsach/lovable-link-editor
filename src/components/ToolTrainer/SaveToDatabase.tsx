import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Save, Loader2 } from 'lucide-react';

interface SaveToDatabaseProps {
  userQuery: string;
  assistantResponse: string;
  toolCalls: any[]; // Adjust type as needed
  tags?: string[];
}

export const SaveToDatabase: React.FC<SaveToDatabaseProps> = ({
  userQuery,
  assistantResponse,
  toolCalls,
  tags = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Optional: allow editing tags in the UI
  const [localTags, setLocalTags] = useState(tags);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Prepare the payload for your backend
      const payload = {
        user_query: userQuery,
        assistant_response: assistantResponse,
        tool_calls: toolCalls,
        tags: localTags,
      };

      console.log('Saving conversation to database:', payload);

      // Send POST request to backend
      const response = await fetch('http://127.0.0.1:8000/examples/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save conversation');
      }

      // Handle successful save response
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
      
      <DialogContent
        className="bg-gray-800 border-gray-600 text-white"
        aria-describedby="save-to-db-description"
      >
        <DialogHeader>
          <DialogTitle className="text-purple-300">Save Conversation to Database</DialogTitle>
        </DialogHeader>

        <div id="save-to-db-description" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user_query" className="text-gray-300">User Query</Label>
            <Textarea
              id="user_query"
              value={userQuery}
              readOnly
              className="bg-gray-700 border-gray-600 text-white min-h-[60px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="assistant_response" className="text-gray-300">Assistant Response</Label>
            <Textarea
              id="assistant_response"
              value={assistantResponse}
              readOnly
              className="bg-gray-700 border-gray-600 text-white min-h-[60px]"
            />
          </div>

          {/* Optionally: tags input */}
          {/* <div className="space-y-2">
            <Label htmlFor="tags" className="text-gray-300">Tags</Label>
            <Input
              id="tags"
              value={localTags.join(', ')}
              onChange={e => setLocalTags(e.target.value.split(',').map(tag => tag.trim()))}
              placeholder="Enter tags separated by commas"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div> */}

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving}
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
