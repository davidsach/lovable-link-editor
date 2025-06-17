
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Edit, Save, Loader2, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExampleData {
  id: string;
  name: string;
  description: string;
  tags: string[];
  user_prompt: string;
  steps: Array<{
    thought: string;
    tool_name: string;
    tool_params: Record<string, any>;
    tool_result: string;
  }>;
  created: string;
  updated: string;
}

interface EditExampleProps {
  example: ExampleData | null;
  onExampleUpdated?: (example: ExampleData) => void;
}

export const EditExample: React.FC<EditExampleProps> = ({ example, onExampleUpdated }) => {
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<ExampleData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (example) {
      setEditData({ ...example });
    }
  }, [example]);

  const handleSave = async () => {
    if (!editData) return;

    setIsSaving(true);
    try {
      // TODO: Replace with actual API call to backend
      const updatedExample = {
        ...editData,
        updated: new Date().toISOString()
      };

      console.log('Updating example:', updatedExample);
      
      // Simulate API call - replace with actual backend integration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onExampleUpdated?.(updatedExample);
      setOpen(false);
      
      toast({
        title: 'Example Updated',
        description: `Example "${updatedExample.name}" updated successfully`,
      });
    } catch (error) {
      console.error('Error updating example:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update example',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addStep = () => {
    if (!editData) return;
    
    setEditData({
      ...editData,
      steps: [
        ...editData.steps,
        {
          thought: '',
          tool_name: '',
          tool_params: {},
          tool_result: ''
        }
      ]
    });
  };

  const removeStep = (index: number) => {
    if (!editData) return;
    
    setEditData({
      ...editData,
      steps: editData.steps.filter((_, i) => i !== index)
    });
  };

  const updateStep = (index: number, field: string, value: any) => {
    if (!editData) return;
    
    const updatedSteps = [...editData.steps];
    updatedSteps[index] = {
      ...updatedSteps[index],
      [field]: value
    };
    
    setEditData({
      ...editData,
      steps: updatedSteps
    });
  };

  if (!example) {
    return (
      <Button variant="outline" disabled className="flex items-center gap-2">
        <Edit className="w-4 h-4" />
        Edit Example
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Edit className="w-4 h-4" />
          Edit Example
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Example</DialogTitle>
        </DialogHeader>
        {editData && (
          <ScrollArea className="h-[70vh]">
            <div className="space-y-4 p-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Name *</Label>
                  <Input
                    id="edit-name"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-tags">Tags</Label>
                  <Input
                    id="edit-tags"
                    value={editData.tags.join(', ')}
                    onChange={(e) => setEditData({ 
                      ...editData, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                    })}
                    placeholder="tag1, tag2, tag3"
                    disabled={isSaving}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  rows={3}
                  disabled={isSaving}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-prompt">User Prompt *</Label>
                <Textarea
                  id="edit-prompt"
                  value={editData.user_prompt}
                  onChange={(e) => setEditData({ ...editData, user_prompt: e.target.value })}
                  rows={3}
                  disabled={isSaving}
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Steps ({editData.steps.length})</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addStep}
                    disabled={isSaving}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Step
                  </Button>
                </div>
                
                <div className="space-y-4 border rounded-lg p-4">
                  {editData.steps.map((step, index) => (
                    <div key={index} className="border rounded p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Step {index + 1}</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeStep(index)}
                          disabled={isSaving}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div>
                        <Label>Thought</Label>
                        <Input
                          value={step.thought}
                          onChange={(e) => updateStep(index, 'thought', e.target.value)}
                          disabled={isSaving}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>Tool Name</Label>
                          <Input
                            value={step.tool_name}
                            onChange={(e) => updateStep(index, 'tool_name', e.target.value)}
                            disabled={isSaving}
                          />
                        </div>
                        <div>
                          <Label>Tool Parameters (JSON)</Label>
                          <Input
                            value={JSON.stringify(step.tool_params)}
                            onChange={(e) => {
                              try {
                                const params = JSON.parse(e.target.value);
                                updateStep(index, 'tool_params', params);
                              } catch {
                                // Invalid JSON, ignore
                              }
                            }}
                            disabled={isSaving}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label>Tool Result</Label>
                        <Textarea
                          value={step.tool_result}
                          onChange={(e) => updateStep(index, 'tool_result', e.target.value)}
                          rows={2}
                          disabled={isSaving}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSave}
                  disabled={!editData.name.trim() || !editData.user_prompt.trim() || isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};
