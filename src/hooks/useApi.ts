
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  toolsApi,
  examplesApi,
  CreateExampleRequest,
  ToolExecuteRequest,
  ExecuteToolRequest,
  ExecuteAllToolsRequest
} from '../api';
import { useToast } from './use-toast';

// Tools hooks
export const useTools = () => {
  return useQuery({
    queryKey: ['tools'],
    queryFn: () => toolsApi.getTools(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry on connection failures
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
  });
};

export const useToolSchema = (toolName: string) => {
  return useQuery({
    queryKey: ['tool-schema', toolName],
    queryFn: () => toolsApi.getToolSchema(toolName),
    enabled: !!toolName,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useExecuteTool = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (request: ToolExecuteRequest) => toolsApi.executeTool(request),
    onError: (error) => {
      const errorMessage = error instanceof Error && error.message.includes('Failed to fetch')
        ? 'Unable to connect to backend server. Please ensure your backend is running.'
        : 'Failed to execute tool';
      
      toast({
        title: 'Connection Error',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error('Execute tool error:', error);
    },
  });
};

export const useExecuteToolResult = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (request: ExecuteToolRequest) => toolsApi.executeToolResult(request),
    onError: (error) => {
      const errorMessage = error instanceof Error && error.message.includes('Failed to fetch')
        ? 'Unable to connect to backend server. Please ensure your backend is running.'
        : 'Failed to execute Python code';
      
      toast({
        title: 'Connection Error',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error('Execute tool result error:', error);
    },
  });
};

export const useExecuteAllTools = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (request: ExecuteAllToolsRequest) => toolsApi.executeAllTools(request),
    onError: (error) => {
      const errorMessage = error instanceof Error && error.message.includes('Failed to fetch')
        ? 'Unable to connect to backend server. Please ensure your backend is running.'
        : 'Failed to execute all Python code';
      
      toast({
        title: 'Connection Error',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error('Execute all tools error:', error);
    },
  });
};

// Examples hooks
export const useExamples = () => {
  return useQuery({
    queryKey: ['examples'],
    queryFn: () => examplesApi.getExamples(),
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useExample = (id: string) => {
  return useQuery({
    queryKey: ['example', id],
    queryFn: () => examplesApi.getExample(id),
    enabled: !!id,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useCreateExample = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (example: CreateExampleRequest) => examplesApi.createExample(example),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examples'] });
      toast({
        title: 'Success',
        description: 'Example created successfully',
      });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error && error.message.includes('Failed to fetch')
        ? 'Unable to connect to backend server. Please ensure your backend is running.'
        : 'Failed to create example';
      
      toast({
        title: 'Connection Error',
        description: errorMessage,
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
      examplesApi.updateExample(exampleId, example),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['examples'] });
      queryClient.invalidateQueries({ queryKey: ['example', variables.exampleId] });
      toast({
        title: 'Success',
        description: 'Example updated successfully',
      });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error && error.message.includes('Failed to fetch')
        ? 'Unable to connect to backend server. Please ensure your backend is running.'
        : 'Failed to update example';
      
      toast({
        title: 'Connection Error',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error('Update example error:', error);
    },
  });
};
