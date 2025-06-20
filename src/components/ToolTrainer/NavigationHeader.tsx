
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SavedConversations } from './SavedConversations';
import { SaveToDatabase } from './SaveToDatabase';
import { Example, Content } from '../../types/toolTrainer';

interface NavigationHeaderProps {
  currentExample: Example;
  onNavigatePrevious: () => void;
  onNavigateNext: () => void;
  onLoadConversation: (conversation: Example) => void;
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
        <SaveToDatabase 
          messages={currentExample.messages || []}
          tags={currentExample.meta?.tags || []}
          exampleName={currentExample.name}
        />
      </div>
    </div>
  );
};
