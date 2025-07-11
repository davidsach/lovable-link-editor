
/**
 * React Query Hooks for API Operations
 * Custom hooks for data fetching and mutations with error handling
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  toolsApi,
  examplesApi,
  CreateExampleRequest,
  ExecuteToolRequest,
  ExecuteAllToolsRequest
} from '../api';
import { useToast } from './use-toast';

// =============================================================================
// QUERY KEYS
// =============================================================================

/**
 * Centralized query keys for React Query
 */
export const QUERY_KEYS = {
  TOOLS: ['tools'] as const,
  TOOL_SCHEMA: (toolName: string) => ['tool-schema', toolName] as const,
  EXAMPLES: ['examples'] as const,
  EXAMPLE: (id: string) => ['example', id] as const,
} as const;

// =============================================================================
// TOOLS HOOKS
// =============================================================================

/**
 * Hook to fetch all available tools
 * @returns Query result with tools data
 */
export const useTools = () => {
  return useQuery({
    queryKey: QUERY_KEYS.TOOLS,
    queryFn: () => toolsApi.getTools(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on connection failures
      if (error instanceof Error && error.message.includes('Failed to connect')) {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: 'Failed to load available tools'
    }
  });
};

/**
 * Hook to fetch tool schema for a specific tool
 * @param toolName - Name of the tool to get schema for
 * @returns Query result with tool schema
 */
export const useToolSchema = (toolName: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.TOOL_SCHEMA(toolName),
    queryFn: () => toolsApi.getToolSchema(toolName),
    enabled: !!toolName && toolName.trim() !== '',
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000, // 10 minutes (schemas don't change often)
    meta: {
      errorMessage: `Failed to load schema for tool: ${toolName}`
    }
  });
};

/**
 * Hook to execute Python code
 * @returns Mutation for Python code execution
 */
export const useExecuteToolResult = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (request: ExecuteToolRequest) => {
      console.log('🐍 Executing Python code via hook');
      return toolsApi.executeToolResult(request);
    },
    onSuccess: (data) => {
      console.log('✅ Python code executed successfully');
      toast({
        title: 'Code Executed',
        description: 'Python code executed successfully',
      });
    },
    onError: (error) => {
      console.error('❌ Python code execution failed:', error);
      
      const errorMessage = error instanceof Error && error.message.includes('Failed to connect')
        ? 'Unable to connect to backend server. Please ensure your backend is running.'
        : 'Failed to execute Python code';
      
      toast({
        title: 'Code Execution Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to execute multiple Python code chunks
 * @returns Mutation for multiple code execution
 */
export const useExecuteAllTools = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (request: ExecuteAllToolsRequest) => {
      console.log('🐍 Executing multiple Python code chunks via hook');
      return toolsApi.executeAllTools(request);
    },
    onSuccess: (data, variables) => {
      console.log('✅ All Python code chunks executed successfully');
      toast({
        title: 'All Code Executed',
        description: `Successfully executed ${variables.code_chunks.length} code chunks`,
      });
    },
    onError: (error, variables) => {
      console.error('❌ Multiple Python code execution failed:', error);
      
      const errorMessage = error instanceof Error && error.message.includes('Failed to connect')
        ? 'Unable to connect to backend server. Please ensure your backend is running.'
        : 'Failed to execute Python code chunks';
      
      toast({
        title: 'Code Execution Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

// =============================================================================
// EXAMPLES HOOKS
// =============================================================================

/**
 * Hook to fetch all training examples
 * @returns Query result with examples data
 */
export const useExamples = () => {
  return useQuery({
    queryKey: QUERY_KEYS.EXAMPLES,
    queryFn: () => examplesApi.getExamples(),
    retry: false,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: 'Failed to load training examples'
    }
  });
};

/**
 * Hook to fetch a specific training example
 * @param id - ID of the example to fetch
 * @returns Query result with example data
 */
export const useExample = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.EXAMPLE(id),
    queryFn: () => examplesApi.getExample(id),
    enabled: !!id && id.trim() !== '',
    retry: false,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: `Failed to load example: ${id}`
    }
  });
};

/**
 * Hook to create a new training example
 * @returns Mutation for example creation
 */
export const useCreateExample = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (example: CreateExampleRequest) => {
      console.log('📝 Creating new training example:', example.name);
      return examplesApi.createExample(example);
    },
    onSuccess: (data, variables) => {
      console.log('✅ Training example created successfully:', variables.name);
      
      // Invalidate and refetch examples list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXAMPLES });
      
      toast({
        title: 'Example Created',
        description: `Training example "${variables.name}" created successfully`,
      });
    },
    onError: (error, variables) => {
      console.error('❌ Failed to create training example:', error);
      
      const errorMessage = error instanceof Error && error.message.includes('Failed to connect')
        ? 'Unable to connect to backend server. Please ensure your backend is running.'
        : 'Failed to create training example';
      
      toast({
        title: 'Creation Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to update an existing training example
 * @returns Mutation for example update
 */
export const useUpdateExample = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ exampleId, example }: { exampleId: string; example: Partial<CreateExampleRequest> }) => {
      console.log('📝 Updating training example:', exampleId);
      return examplesApi.updateExample(exampleId, example);
    },
    onSuccess: (data, variables) => {
      console.log('✅ Training example updated successfully:', variables.exampleId);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXAMPLES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXAMPLE(variables.exampleId) });
      
      toast({
        title: 'Example Updated',
        description: 'Training example updated successfully',
      });
    },
    onError: (error, variables) => {
      console.error('❌ Failed to update training example:', error);
      
      const errorMessage = error instanceof Error && error.message.includes('Failed to connect')
        ? 'Unable to connect to backend server. Please ensure your backend is running.'
        : 'Failed to update training example';
      
      toast({
        title: 'Update Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to save example to markdown file
 * @returns Mutation for markdown save
 */
export const useSaveToMarkdown = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ filePath, example }: { filePath: string; example: CreateExampleRequest }) => {
      console.log('📝 Saving example to markdown:', filePath);
      return examplesApi.saveToMarkdown(filePath, example);
    },
    onSuccess: (data, variables) => {
      console.log('✅ Example saved to markdown successfully:', variables.filePath);
      
      toast({
        title: 'Markdown Saved',
        description: `Example saved to ${variables.filePath} successfully`,
      });
    },
    onError: (error, variables) => {
      console.error('❌ Failed to save example to markdown:', error);
      
      const errorMessage = error instanceof Error && error.message.includes('Failed to connect')
        ? 'Unable to connect to backend server. Please ensure your backend is running.'
        : 'Failed to save example to markdown file';
      
      toast({
        title: 'Markdown Save Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to load example from markdown file
 * @returns Mutation for markdown load
 */
export const useLoadFromMarkdown = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (filePath: string) => {
      console.log('📖 Loading example from markdown:', filePath);
      return examplesApi.loadFromMarkdown(filePath);
    },
    onSuccess: (data, filePath) => {
      console.log('✅ Example loaded from markdown successfully:', filePath);
      
      toast({
        title: 'Markdown Loaded',
        description: `Example loaded from ${filePath} successfully`,
      });
    },
    onError: (error, filePath) => {
      console.error('❌ Failed to load example from markdown:', error);
      
      const errorMessage = error instanceof Error && error.message.includes('Failed to connect')
        ? 'Unable to connect to backend server. Please ensure your backend is running.'
        : 'Failed to load example from markdown file';
      
      toast({
        title: 'Markdown Load Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

// =============================================================================
// UTILITY HOOKS
// =============================================================================

/**
 * Hook to test backend connection
 * @returns Query result with connection status
 */
export const useBackendConnection = () => {
  return useQuery({
    queryKey: ['backend-connection'],
    queryFn: () => toolsApi.testConnection(),
    refetchInterval: 30000, // Check every 30 seconds
    retry: false,
    meta: {
      errorMessage: 'Backend connection test failed'
    }
  });
};
