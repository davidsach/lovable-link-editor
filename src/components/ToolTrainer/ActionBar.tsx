
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Play, ArrowLeft, Save, Type, Wrench } from 'lucide-react';
import { SaveConversationDialog } from './SaveConversationDialog';
import { TrainingExample } from '../../types/toolTrainer';

interface ActionBarProps {
  sidebarCollapsed: boolean;
  currentExample: TrainingExample;
  isLoading: boolean;
  canSubmit: boolean;
  canAddTextChunk: boolean;
  canAddToolCall: boolean;
  historyLength: number;
  isSaving: boolean;
  onAddNewTurn: () => void;
  onAddTextChunk: () => void;
  onAddToolCall: () => void;
  onGetAllResults: () => void;
  onGoBack: () => void;
  onSubmitExample: () => void;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  sidebarCollapsed,
  currentExample,
  isLoading,
  canSubmit,
  canAddTextChunk,
  canAddToolCall,
  historyLength,
  isSaving,
  onAddNewTurn,
  onAddTextChunk,
  onAddToolCall,
  onGetAllResults,
  onGoBack,
  onSubmitExample
}) => {
  return (
    <div className="fixed bottom-0 right-0 left-0 bg-white border-t border-gray-200 shadow-lg z-10" 
         style={{ marginLeft: sidebarCollapsed ? '64px' : '320px' }}>
      <div className="p-4 max-w-6xl mx-auto">
        <div className="flex flex-wrap gap-3 items-center">
          <Button 
            onClick={onAddNewTurn}
            className="bg-blue-600 hover:bg-blue-700"
            aria-label="Add new conversation turn"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Turn
          </Button>
          
          <Button 
            onClick={onAddTextChunk}
            disabled={!canAddTextChunk}
            variant="outline"
            className={`${canAddTextChunk ? 'border-blue-500 text-blue-600 hover:bg-blue-50' : ''}`}
          >
            <Type className="w-4 h-4 mr-2" />
            Add Text Chunk
          </Button>
          
          <Button 
            onClick={onAddToolCall}
            disabled={!canAddToolCall}
            variant="outline"
            className={`${canAddToolCall ? 'border-green-500 text-green-600 hover:bg-green-50' : ''}`}
          >
            <Wrench className="w-4 h-4 mr-2" />
            Add Python Code
          </Button>
          
          <Button 
            onClick={onGetAllResults}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            <Play className="w-4 h-4 mr-2" />
            Execute All Code
          </Button>
          
          <Button 
            onClick={onGoBack}
            variant="outline"
            disabled={historyLength === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <SaveConversationDialog 
            messages={currentExample.messages}
            exampleName={currentExample.name}
          />
          
          <Button 
            onClick={onSubmitExample}
            disabled={!canSubmit || isSaving}
            className="bg-purple-600 hover:bg-purple-700 ml-auto"
            aria-label="Save training example"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Trace'}
          </Button>
        </div>
      </div>
    </div>
  );
};
