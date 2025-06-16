
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Save, X } from 'lucide-react';
import { useExamples, useCreateExample, useUpdateExample, useExample } from '@/hooks/useApi';
import { CreateExampleRequest, TrainingExample, TrainingStep } from '@/api/types';
import { useToast } from '@/hooks/use-toast';

interface ExamplesManagerProps {
  onExampleSelect?: (example: TrainingExample) => void;
}

const ExamplesManager: React.FC<ExamplesManagerProps> = ({ onExampleSelect }) => {
  const [selectedExampleId, setSelectedExampleId] = useState<string>('');
  const [editingExample, setEditingExample] = useState<TrainingExample | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    tags: '',
    user_prompt: '',
    steps: [] as TrainingStep[]
  });

  const { toast } = useToast();
  const { data: examples, isLoading: examplesLoading, refetch: refetchExamples } = useExamples();
  const { data: selectedExample, isLoading: exampleLoading } = useExample(selectedExampleId);
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
    
    for (let i = 0; i < toyExamples.length; i++) {
      const example = toyExamples[i];
      const exampleData: CreateExampleRequest = {
        id: `toy-${i + 1}`,
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
      description: 'All 10 toy examples have been created!',
    });
    
    refetchExamples();
  };

  const handleCreateExample = async () => {
    const exampleData: CreateExampleRequest = {
      id: `custom-${Date.now()}`,
      name: createForm.name,
      description: createForm.description,
      tags: createForm.tags.split(',').map(tag => tag.trim()),
      user_prompt: createForm.user_prompt,
      steps: createForm.steps,
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };

    try {
      await createExampleMutation.mutateAsync(exampleData);
      setCreateForm({ name: '', description: '', tags: '', user_prompt: '', steps: [] });
      setIsCreateDialogOpen(false);
      refetchExamples();
      toast({
        title: 'Success',
        description: 'Example created successfully!',
      });
    } catch (error) {
      console.error('Failed to create example:', error);
    }
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

  const handleSelectExample = (exampleId: string) => {
    setSelectedExampleId(exampleId);
    if (onExampleSelect && selectedExample) {
      onExampleSelect(selectedExample);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button onClick={handleCreateToyExamples} variant="default">
          <Plus className="w-4 h-4 mr-2" />
          Create 10 Toy Examples
        </Button>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Create Custom Example
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Training Example</DialogTitle>
              <DialogDescription>
                Create a new training example with steps and parameters.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="Example name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Describe what this example demonstrates"
                />
              </div>
              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={createForm.tags}
                  onChange={(e) => setCreateForm({ ...createForm, tags: e.target.value })}
                  placeholder="tag1, tag2, tag3"
                />
              </div>
              <div>
                <Label htmlFor="user_prompt">User Prompt</Label>
                <Textarea
                  id="user_prompt"
                  value={createForm.user_prompt}
                  onChange={(e) => setCreateForm({ ...createForm, user_prompt: e.target.value })}
                  placeholder="What would the user ask to trigger this example?"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateExample}>
                <Save className="w-4 h-4 mr-2" />
                Create Example
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Examples List */}
      <Card>
        <CardHeader>
          <CardTitle>Training Examples</CardTitle>
          <CardDescription>
            {examplesLoading ? 'Loading examples...' : `${examples?.length || 0} examples available`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {examplesLoading ? (
            <div className="text-center py-4">Loading examples...</div>
          ) : (
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {examples?.map((example) => (
                  <Card key={example.id} className="p-3 cursor-pointer hover:bg-gray-50" onClick={() => handleSelectExample(example.id)}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{example.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{example.description}</p>
                        <div className="flex gap-1 mt-2">
                          {example.tags?.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingExample(example);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Selected Example Details */}
      {selectedExampleId && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Example Details</CardTitle>
          </CardHeader>
          <CardContent>
            {exampleLoading ? (
              <div className="text-center py-4">Loading example details...</div>
            ) : selectedExample ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Name:</h4>
                  <p>{selectedExample.name}</p>
                </div>
                <div>
                  <h4 className="font-medium">Description:</h4>
                  <p>{selectedExample.description}</p>
                </div>
                <div>
                  <h4 className="font-medium">User Prompt:</h4>
                  <p className="bg-gray-50 p-2 rounded">{selectedExample.user_prompt}</p>
                </div>
                <div>
                  <h4 className="font-medium">Steps:</h4>
                  <div className="space-y-2">
                    {selectedExample.steps?.map((step, index) => (
                      <div key={index} className="border p-3 rounded">
                        <p><strong>Thought:</strong> {step.thought}</p>
                        <p><strong>Tool:</strong> {step.tool_name}</p>
                        <p><strong>Parameters:</strong> {JSON.stringify(step.tool_params)}</p>
                        <p><strong>Result:</strong> {step.tool_result}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">No example selected</div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Example Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Training Example</DialogTitle>
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
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleUpdateExample}>
              <Save className="w-4 h-4 mr-2" />
              Update Example
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamplesManager;
