
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  isLoading: boolean;
  onAddNewTurn: () => void;
  onAutoGenerate: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  isLoading,
  onAddNewTurn,
  onAutoGenerate
}) => {
  return (
    <Card className="border-dashed border-2 border-gray-300">
      <CardContent className="p-12 text-center">
        <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
        <p className="text-gray-500 mb-6">Start building your training example by adding a new turn</p>
        <div className="flex gap-3 justify-center">
          <Button 
            onClick={onAddNewTurn}
            className="bg-blue-600 hover:bg-blue-700"
            aria-label="Add new conversation turn"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Turn
          </Button>
          <Button 
            onClick={onAutoGenerate}
            variant="outline"
            disabled={isLoading}
            aria-label="Auto generate example"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Auto Generate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
