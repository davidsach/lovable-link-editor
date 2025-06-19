
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SavedConversations } from './SavedConversations';
import { SaveConversationDialog } from './SaveConversationDialog';
import { TrainingExample, SavedConversation } from '../../types/toolTrainer';

interface NavigationHeaderProps {
  currentExample: TrainingExample;
  onNavigatePrevious: () => void;
  onNavigateNext: () => void;
  onLoadConversation: (conversation: SavedConversation) => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  currentExample,
  onNavigatePrevious,
  onNavigateNext,
  onLoadConversation
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <Button
          onClick={onNavigatePrevious}
          disabled={currentExample.id <= 1}
          variant="outline"
          size="sm"
          aria-label="Previous example"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        <span className="font-medium text-gray-600">
          Example ID: {currentExample.id}
        </span>
        <Button
          onClick={onNavigateNext}
          variant="outline"
          size="sm"
          aria-label="Next example"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex items-center gap-3">
        <SavedConversations onLoadConversation={onLoadConversation} />
        <SaveConversationDialog 
          userQuery={currentExample.userQuery}
          assistantResponse={currentExample.assistantResponse}
          toolCalls={currentExample.toolCalls}
          exampleName={currentExample.name}
        />
      </div>
    </div>
  );
};