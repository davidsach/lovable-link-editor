
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Plus, Search } from 'lucide-react';
import { useExamples, useCreateExample, useExample, useUpdateExample } from '@/hooks/useApi';
import { CreateExampleRequest, TrainingExample } from '@/api/types';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const ToyExamples = () => {
  const [fetchId, setFetchId] = useState('');
  const [selectedExampleId, setSelectedExampleId] = useState<string>('');
  const [editingExample, setEditingExample] = useState<TrainingExample | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: examples, isLoading: examplesLoading, refetch: refetchExamples } = useExamples();
  const { data: fetchedExample, isLoading: fetchLoading } = useExample(selectedExampleId);
  const createExampleMutation = useCreateExample();
  const updateExampleMutation = useUpdateExample();

  // Generate 10 toy examples
  const generateToyExamples = () => {
    const toyExamples = [
      {
        name: 'Weather Query Example',
        description: 'Example showing how to query weather information',
        tags: 'weather,api,basic',
        user_prompt: 'What is the weather like in New York today?',
        steps: [
          {
            thought: 'I need to get weather information for New York',
            tool_name: 'weather_api',
            tool_params: { city: 'New York', date: 'today' },
            tool_result: 'Temperature: 72°F, Condition: Sunny'
          }
        ]
      },
      {
        name: 'Calculator Example',
        description: 'Basic arithmetic calculation example',
        tags: 'math,calculator,simple',
        user_prompt: 'Calculate 15 * 8 + 12',
        steps: [
          {
            thought: 'I need to perform arithmetic calculation',
            tool_name: 'calculator',
            tool_params: { expression: '15 * 8 + 12' },
            tool_result: '132'
          }
        ]
      },
      {
        name: 'File Processing Example',
        description: 'Example of processing a text file',
        tags: 'file,text,processing',
        user_prompt: 'Read and summarize the content of data.txt',
        steps: [
          {
            thought: 'I need to read the file first',
            tool_name: 'file_reader',
            tool_params: { filename: 'data.txt' },
            tool_result: 'File content loaded successfully'
          },
          {
            thought: 'Now I need to summarize the content',
            tool_name: 'text_summarizer',
            tool_params: { text: 'loaded_content' },
            tool_result: 'Summary generated'
          }
        ]
      },
      {
        name: 'Database Query Example',
        description: 'Example of querying database for user information',
        tags: 'database,query,users',
        user_prompt: 'Find all users registered in the last 30 days',
        steps: [
          {
            thought: 'I need to query the users table with date filter',
            tool_name: 'database_query',
            tool_params: { table: 'users', filter: 'registration_date >= NOW() - INTERVAL 30 DAY' },
            tool_result: 'Found 25 users registered in the last 30 days'
          }
        ]
      },
      {
        name: 'Email Notification Example',
        description: 'Example of sending automated email notifications',
        tags: 'email,notification,automation',
        user_prompt: 'Send a welcome email to new user john@example.com',
        steps: [
          {
            thought: 'I need to compose and send a welcome email',
            tool_name: 'email_sender',
            tool_params: { to: 'john@example.com', template: 'welcome', subject: 'Welcome!' },
            tool_result: 'Email sent successfully'
          }
        ]
      },
      {
        name: 'Image Processing Example',
        description: 'Example of resizing and optimizing images',
        tags: 'image,processing,optimization',
        user_prompt: 'Resize image.jpg to 800x600 and optimize it',
        steps: [
          {
            thought: 'I need to resize the image first',
            tool_name: 'image_processor',
            tool_params: { filename: 'image.jpg', width: 800, height: 600, optimize: true },
            tool_result: 'Image resized and optimized successfully'
          }
        ]
      },
      {
        name: 'API Integration Example',
        description: 'Example of integrating with external API',
        tags: 'api,integration,external',
        user_prompt: 'Get the latest news headlines from NewsAPI',
        steps: [
          {
            thought: 'I need to call the NewsAPI to get headlines',
            tool_name: 'news_api',
            tool_params: { category: 'general', country: 'us', pageSize: 10 },
            tool_result: 'Retrieved 10 latest news headlines'
          }
        ]
      },
      {
        name: 'Data Validation Example',
        description: 'Example of validating user input data',
        tags: 'validation,data,input',
        user_prompt: 'Validate this email address: user@domain.com',
        steps: [
          {
            thought: 'I need to validate the email format',
            tool_name: 'data_validator',
            tool_params: { type: 'email', value: 'user@domain.com' },
            tool_result: 'Email address is valid'
          }
        ]
      },
      {
        name: 'Report Generation Example',
        description: 'Example of generating monthly reports',
        tags: 'report,generation,monthly',
        user_prompt: 'Generate a monthly sales report for March 2024',
        steps: [
          {
            thought: 'I need to collect sales data for March 2024',
            tool_name: 'data_collector',
            tool_params: { type: 'sales', month: 'march', year: 2024 },
            tool_result: 'Sales data collected'
          },
          {
            thought: 'Now I need to generate the report',
            tool_name: 'report_generator',
            tool_params: { template: 'monthly_sales', data: 'collected_data' },
            tool_result: 'Monthly sales report generated successfully'
          }
        ]
      },
      {
        name: 'User Authentication Example',
        description: 'Example of user login and authentication flow',
        tags: 'auth,login,security',
        user_prompt: 'Authenticate user with username: admin, password: secret123',
        steps: [
          {
            thought: 'I need to verify the user credentials',
            tool_name: 'auth_service',
            tool_params: { username: 'admin', password: 'secret123' },
            tool_result: 'User authenticated successfully, token generated'
          }
        ]
      }
    ];

    return toyExamples;
  };

  const handleCreateToyExamples = async () => {
    const toyExamples = generateToyExamples();
    let successCount = 0;
    
    for (let i = 0; i < toyExamples.length; i++) {
      const example = toyExamples[i];
      const exampleData: CreateExampleRequest = {
        id: `toy-${Date.now()}-${i + 1}`,
        name: example.name,
        description: example.description,
        tags: example.tags.split(','),
        user_prompt: example.user_prompt,
        steps: example.steps,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      };

      try {
        await createExampleMutation.mutateAsync(exampleData);
        successCount++;
        console.log(`Created toy example ${i + 1}: ${example.name}`);
      } catch (error) {
        console.error(`Failed to create toy example ${i + 1}:`, error);
        toast({
          title: 'Error',
          description: `Failed to create toy example: ${example.name}`,
          variant: 'destructive',
        });
      }
    }

    toast({
      title: 'Success',
      description: `Successfully created ${successCount} out of ${toyExamples.length} toy examples!`,
    });
    
    refetchExamples();
  };

  const handleFetchExample = () => {
    if (!fetchId.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an example ID',
        variant: 'destructive',
      });
      return;
    }
    setSelectedExampleId(fetchId.trim());
  };

  const handleEditExample = (example: TrainingExample) => {
    setEditingExample(example);
    setIsEditDialogOpen(true);
  };

  const handleUpdateExample = async () => {
    if (!editingExample) return;

    try {
      await updateExampleMutation.mutateAsync({
        exampleId: editingExample.id,
        example: {
          ...editingExample,
          updated: new Date().toISOString()
        }
      });
      
      setEditingExample(null);
      setIsEditDialogOpen(false);
      refetchExamples();
      toast({
        title: 'Success',
        description: 'Example updated successfully!',
      });
    } catch (error) {
      console.error('Failed to update example:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md p-4">
        <h1 className="text-2xl font-semibold">Toy Examples Manager</h1>
      </header>

      <div className="p-6 space-y-6">
        {/* Create Toy Examples Section */}
        <Card>
          <CardHeader>
            <CardTitle>Create Toy Examples</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCreateToyExamples} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Create 10 Toy Examples
            </Button>
          </CardContent>
        </Card>

        {/* Fetch Example by ID Section */}
        <Card>
          <CardHeader>
            <CardTitle>Fetch Example by ID</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter example ID"
                value={fetchId}
                onChange={(e) => setFetchId(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleFetchExample}>
                <Search className="w-4 h-4 mr-2" />
                Fetch Example
              </Button>
            </div>
            
            {fetchLoading && <div className="mt-4 text-center">Loading example...</div>}
            
            {fetchedExample && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <h3 className="font-semibold">{fetchedExample.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{fetchedExample.description}</p>
                <div className="flex gap-1 mt-2">
                  {fetchedExample.tags?.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="mt-2"><strong>User Prompt:</strong> {fetchedExample.user_prompt}</p>
                <div className="mt-2">
                  <strong>Steps:</strong>
                  {fetchedExample.steps?.map((step, index) => (
                    <div key={index} className="ml-4 mt-1 text-sm">
                      <p>Step {index + 1}: {step.tool_name} - {step.thought}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Examples List */}
        <Card>
          <CardHeader>
            <CardTitle>All Examples ({examples?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {examplesLoading ? (
              <div className="text-center py-4">Loading examples...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {examples?.map((example) => (
                      <TableRow key={example.id}>
                        <TableCell className="font-mono text-sm">{example.id}</TableCell>
                        <TableCell className="font-medium">{example.name}</TableCell>
                        <TableCell className="max-w-xs truncate">{example.description}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {example.tags?.slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {example.tags && example.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{example.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditExample(example)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Example Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Example</DialogTitle>
              <DialogDescription>
                Update the example details below.
              </DialogDescription>
            </DialogHeader>
            {editingExample && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={editingExample.name}
                    onChange={(e) => setEditingExample({ ...editingExample, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editingExample.description}
                    onChange={(e) => setEditingExample({ ...editingExample, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
                  <Input
                    id="edit-tags"
                    value={editingExample.tags?.join(', ') || ''}
                    onChange={(e) => setEditingExample({ ...editingExample, tags: e.target.value.split(',').map(tag => tag.trim()) })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-prompt">User Prompt</Label>
                  <Textarea
                    id="edit-prompt"
                    value={editingExample.user_prompt}
                    onChange={(e) => setEditingExample({ ...editingExample, user_prompt: e.target.value })}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateExample}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ToyExamples;
