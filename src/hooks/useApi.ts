
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  apiService, 
  Tool, 
  Example, 
  CreateExampleRequest, 
  ToolSchema, 
  ToolExecuteRequest,
  ExecuteToolRequest,
  ExecuteAllToolsRequest,
  CodeChunk 
} from '../services/api';
import { useToast } from './use-toast';

export const useTools = () => {
  return useQuery({
    queryKey: ['tools'],
    queryFn: () => apiService.getTools(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useToolSchema = (toolName: string) => {
  return useQuery({
    queryKey: ['toolSchema', toolName],
    queryFn: () => apiService.getToolSchema(toolName),
    enabled: !!toolName,
  });
};

export const useExecuteTool = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (request: ToolExecuteRequest) => apiService.executeTool(request),
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to execute tool',
        variant: 'destructive',
      });
      console.error('Execute tool error:', error);
    },
  });
};

export const useExecuteToolResult = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (request: ExecuteToolRequest) => apiService.executeToolResult(request),
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to execute Python code',
        variant: 'destructive',
      });
      console.error('Execute tool result error:', error);
    },
  });
};

export const useExecuteAllTools = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (request: ExecuteAllToolsRequest) => apiService.executeAllTools(request),
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to execute all Python code',
        variant: 'destructive',
      });
      console.error('Execute all tools error:', error);
    },
  });
};

export const useExamples = () => {
  return useQuery({
    queryKey: ['examples'],
    queryFn: () => apiService.getExamples(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useExample = (exampleId: string) => {
  return useQuery({
    queryKey: ['example', exampleId],
    queryFn: () => apiService.getExample(exampleId),
    enabled: !!exampleId && exampleId !== 'new',
  });
};

export const useCreateExample = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (example: CreateExampleRequest) => apiService.createExample(example),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examples'] });
      toast({
        title: 'Success',
        description: 'Example created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create example',
        variant: 'destructive',
      });
      console.error('Create example error:', error);
    },
  });
};

export const useUpdateExample = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ exampleId, example }: { exampleId: string; example: Partial<CreateExampleRequest> }) => 
      apiService.updateExample(exampleId, example),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['examples'] });
      queryClient.invalidateQueries({ queryKey: ['example', variables.exampleId] });
      toast({
        title: 'Success',
        description: 'Example updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update example',
        variant: 'destructive',
      });
      console.error('Update example error:', error);
    },
  });
};
