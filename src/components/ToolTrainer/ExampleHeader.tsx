
import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, Sparkles, Loader2, FileText, Calendar } from 'lucide-react';
import { TrainingExample } from '../../types/toolTrainer';

interface ExampleHeaderProps {
  example: TrainingExample;
  onExampleChange: (example: TrainingExample) => void;
  onLoad: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAutoGenerate: () => void;
  isLoading: boolean;
}

export const ExampleHeader: React.FC<ExampleHeaderProps> = ({
  example,
  onExampleChange,
  onLoad,
  onAutoGenerate,
  isLoading
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateExample = (updates: Partial<TrainingExample>) => {
    onExampleChange({
      ...example,
      ...updates,
      metadata: {
        ...example.metadata,
        updated_at: new Date().toISOString()
      }
    });
  };

  const addTag = (tag: string) => {
    if (tag && !example.metadata.tags.includes(tag)) {
      updateExample({
        metadata: {
          ...example.metadata,
          tags: [...example.metadata.tags, tag]
        }
      });
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateExample({
      metadata: {
        ...example.metadata,
        tags: example.metadata.tags.filter(tag => tag !== tagToRemove)
      }
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-xl">
            <FileText className="w-6 h-6 mr-2 text-blue-600" />
            Training Example
          </CardTitle>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={onLoad}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Load Example
            </Button>
            <Button
              variant="outline"
              onClick={onAutoGenerate}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Auto Generate
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Example Name</label>
            <Input
              value={example.name}
              onChange={(e) => updateExample({ name: e.target.value })}
              placeholder="Enter example name..."
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Tags</label>
            <div className="flex flex-wrap gap-2">
              {example.metadata.tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-red-100"
                  onClick={() => removeTag(tag)}
                >
                  {tag} ×
                </Badge>
              ))}
              <Input
                placeholder="Add tag..."
                className="w-24 h-6 text-xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addTag(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Description</label>
          <Textarea
            value={example.description}
            onChange={(e) => updateExample({ description: e.target.value })}
            placeholder="Describe what this training example demonstrates..."
            className="min-h-[60px]"
          />
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            Created: {new Date(example.metadata.created_at).toLocaleDateString()}
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            Updated: {new Date(example.metadata.updated_at).toLocaleDateString()}
          </div>
          <Badge variant="outline">
            {example.toolCalls?.length || 0} tool call{(example.toolCalls?.length || 0) !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};