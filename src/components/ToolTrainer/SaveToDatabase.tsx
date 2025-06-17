
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Database, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SaveToDatabaseProps {
  conversationData: {
    userPrompt: string;
    assistantMessage: string;
    toolCalls: Array<{
      toolName: string;
      parameters: Record<string, any>;
      result: any;
    }>;
  };
}

export const SaveToDatabase: React.FC<SaveToDatabaseProps> = ({ conversationData }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter a name for this example',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      // TODO: Replace with actual API call to backend
      const exampleData = {
        name: name.trim(),
        description: description.trim(),
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        user_prompt: conversationData.userPrompt,
        steps: conversationData.toolCalls.map((toolCall, index) => ({
          thought: `Step ${index + 1}: Using ${toolCall.toolName}`,
          tool_name: toolCall.toolName,
          tool_params: toolCall.parameters,
          tool_result: JSON.stringify(toolCall.result)
        })),
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      };

      console.log('Saving example to database:', exampleData);
      
      // Simulate API call - replace with actual backend integration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaved(true);
      toast({
        title: 'Example Saved',
        description: `Example "${name}" saved to database successfully`,
      });
      
      // Reset form after delay
      setTimeout(() => {
        setOpen(false);
        setSaved(false);
        setName('');
        setDescription('');
        setTags('');
      }, 1500);
    } catch (error) {
      console.error('Error saving example:', error);
      toast({
        title: 'Save Failed',
        description: 'Failed to save example to database',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const canSave = conversationData.userPrompt && name.trim() && !isSaving;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          disabled={!conversationData.userPrompt}
        >
          <Database className="w-4 h-4" />
          Save to Database
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Save Example to Database</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="example-name">Name *</Label>
            <Input
              id="example-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter example name"
              disabled={isSaving || saved}
            />
          </div>
          <div>
            <Label htmlFor="example-description">Description</Label>
            <Textarea
              id="example-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              disabled={isSaving || saved}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="example-tags">Tags</Label>
            <Input
              id="example-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tag1, tag2, tag3"
              disabled={isSaving || saved}
            />
          </div>
          <div className="flex justify-between items-center pt-4">
            <p className="text-sm text-gray-500">
              {conversationData.toolCalls.length} tool calls will be saved
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
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
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
