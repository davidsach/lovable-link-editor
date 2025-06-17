
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Loader2, Download } from 'lucide-react';

interface RetrieveExampleProps {
  onExampleRetrieved: (example: any) => void;
}

export const RetrieveExample: React.FC<RetrieveExampleProps> = ({
  onExampleRetrieved
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [exampleId, setExampleId] = useState('');
  const [retrievedExample, setRetrievedExample] = useState<any>(null);

  const handleRetrieve = async () => {
    if (!exampleId.trim()) return;
    
    setIsLoading(true);
    
    try {
      // TODO: Replace with actual API call to backend
      console.log('Retrieving example with ID:', exampleId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Replace with actual API response
      const mockExample = {
        id: exampleId,
        name: `Example ${exampleId}`,
        description: 'Retrieved example from database',
        messages: [],
        created_at: new Date().toISOString()
      };
      
      setRetrievedExample(mockExample);
      console.log('Example retrieved successfully:', mockExample);
    } catch (error) {
      console.error('Error retrieving example:', error);
      // TODO: Add proper error handling/toast
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadExample = () => {
    if (retrievedExample) {
      onExampleRetrieved(retrievedExample);
      setIsOpen(false);
      setRetrievedExample(null);
      setExampleId('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-blue-500/20 border-blue-400/50 text-blue-300 hover:bg-blue-500/30 hover:border-blue-400 shadow-lg transition-all duration-200 px-6 h-11"
        >
          <Search className="w-4 h-4 mr-2" />
          Retrieve Example
        </Button>
      </DialogTrigger>
      
      <DialogContent className="bg-gray-800 border-gray-600 text-white">
        <DialogHeader>
          <DialogTitle className="text-blue-300">Retrieve Example from Database</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exampleId" className="text-gray-300">Example ID</Label>
            <div className="flex gap-2">
              <Input
                id="exampleId"
                value={exampleId}
                onChange={(e) => setExampleId(e.target.value)}
                placeholder="Enter example ID..."
                className="bg-gray-700 border-gray-600 text-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRetrieve();
                  }
                }}
              />
              <Button
                onClick={handleRetrieve}
                disabled={!exampleId.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          
          {retrievedExample && (
            <div className="bg-gray-700/50 p-4 rounded border border-gray-600 space-y-3">
              <div className="text-sm font-medium text-green-300">Example Retrieved Successfully</div>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-400">ID:</span> {retrievedExample.id}</div>
                <div><span className="text-gray-400">Name:</span> {retrievedExample.name}</div>
                <div><span className="text-gray-400">Description:</span> {retrievedExample.description}</div>
                <div><span className="text-gray-400">Messages:</span> {retrievedExample.messages?.length || 0}</div>
                <div><span className="text-gray-400">Created:</span> {new Date(retrievedExample.created_at).toLocaleDateString()}</div>
              </div>
              
              <Button
                onClick={handleLoadExample}
                className="w-full bg-green-600 hover:bg-green-700 text-white mt-3"
              >
                <Download className="w-4 h-4 mr-2" />
                Load This Example
              </Button>
            </div>
          )}
          
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => {
                setIsOpen(false);
                setRetrievedExample(null);
                setExampleId('');
              }}
              variant="outline"
              className="flex-1 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
