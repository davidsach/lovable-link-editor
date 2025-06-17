
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, FileText } from 'lucide-react';
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

interface RetrieveExampleProps {
  onExampleLoaded?: (example: ExampleData) => void;
}

export const RetrieveExample: React.FC<RetrieveExampleProps> = ({ onExampleLoaded }) => {
  const [open, setOpen] = useState(false);
  const [exampleId, setExampleId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [example, setExample] = useState<ExampleData | null>(null);
  const { toast } = useToast();

  const handleRetrieve = async () => {
    if (!exampleId.trim()) {
      toast({
        title: 'ID Required',
        description: 'Please enter an example ID',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Replace with actual API call to backend
      console.log('Retrieving example with ID:', exampleId);
      
      // Simulate API call - replace with actual backend integration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock example data - replace with actual API response
      const mockExample: ExampleData = {
        id: exampleId,
        name: `Example ${exampleId}`,
        description: 'This is a sample example retrieved from database',
        tags: ['sample', 'test'],
        user_prompt: 'Sample user prompt for testing',
        steps: [
          {
            thought: 'Using a sample tool',
            tool_name: 'sample_tool',
            tool_params: { param1: 'value1' },
            tool_result: 'Sample result'
          }
        ],
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      };
      
      setExample(mockExample);
      onExampleLoaded?.(mockExample);
      
      toast({
        title: 'Example Retrieved',
        description: `Example "${mockExample.name}" loaded successfully`,
      });
    } catch (error) {
      console.error('Error retrieving example:', error);
      toast({
        title: 'Retrieval Failed',
        description: 'Failed to retrieve example from database',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadExample = () => {
    if (example) {
      onExampleLoaded?.(example);
      setOpen(false);
      toast({
        title: 'Example Loaded',
        description: 'Example loaded into the interface',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Search className="w-4 h-4" />
          Retrieve Example
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Retrieve Example by ID</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="example-id">Example ID</Label>
              <Input
                id="example-id"
                value={exampleId}
                onChange={(e) => setExampleId(e.target.value)}
                placeholder="Enter example ID"
                disabled={isLoading}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleRetrieve}
                disabled={!exampleId.trim() || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Retrieve
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {example && (
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{example.name}</h3>
                  <p className="text-sm text-gray-600">{example.description}</p>
                </div>
                <Button onClick={handleLoadExample}>
                  <FileText className="w-4 h-4 mr-2" />
                  Load Example
                </Button>
              </div>
              
              <div className="flex gap-2">
                {example.tags.map((tag) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
              
              <div>
                <Label>User Prompt:</Label>
                <p className="text-sm bg-gray-50 p-2 rounded mt-1">{example.user_prompt}</p>
              </div>
              
              <div>
                <Label>Steps ({example.steps.length}):</Label>
                <ScrollArea className="h-40 border rounded mt-1">
                  <div className="p-2 space-y-2">
                    {example.steps.map((step, index) => (
                      <div key={index} className="border-l-2 border-blue-200 pl-3 py-1">
                        <p className="text-sm font-medium">{step.thought}</p>
                        <p className="text-xs text-gray-600">Tool: {step.tool_name}</p>
                        <p className="text-xs text-gray-500">Result: {step.tool_result.substring(0, 100)}...</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              
              <div className="text-xs text-gray-500">
                Created: {new Date(example.created).toLocaleString()} | 
                Updated: {new Date(example.updated).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
