
import { useState } from 'react';
import { TrainingExample, Message, SavedConversation } from '../types/toolTrainer';
import { useCreateExample, useUpdateExample, useExecuteToolResult, useExecuteAllTools } from './useApi';
import { useErrorHandler } from './useErrorHandler';
import { validateExampleMetadata } from '../utils/validation';
import { CreateExampleRequest, Step, CodeChunk } from '../services/api';

export const useToolTrainerLogic = () => {
  const [currentExample, setCurrentExample] = useState<TrainingExample>({
    id: 1,
    name: 'Example 1',
    description: '',
    messages: [],
    metadata: {
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: []
    }
  });
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<Message[][]>([]);
  const [executionTimeouts, setExecutionTimeouts] = useState<Record<string, NodeJS.Timeout>>({});

  const { errors, hasErrors, addError, clearErrors } = useErrorHandler();
  const createExampleMutation = useCreateExample();
  const updateExampleMutation = useUpdateExample();
  const executeToolResultMutation = useExecuteToolResult();
  const executeAllToolsMutation = useExecuteAllTools();

  const saveToHistory = () => {
    setHistory(prev => [...prev, currentExample.messages]);
  };

  const loadSavedConversation = (conversation: SavedConversation) => {
    setCurrentExample({
      id: parseInt(conversation.id.replace('conv_', '')) || 1,
      name: conversation.name,
      description: conversation.description,
      messages: conversation.messages,
      metadata: {
        created_at: conversation.createdAt,
        updated_at: conversation.updatedAt,
        tags: []
      }
    });
  };

  const convertToApiFormat = (example: TrainingExample): CreateExampleRequest => {
    const steps: Step[] = [];
    
    const firstUserMessage = example.messages.find(msg => msg.role === 'user');
    const userPrompt = firstUserMessage?.content
      .filter(c => c.type === 'text')
      .map(c => c.content)
      .join(' ') || '';

    example.messages.forEach(message => {
      if (message.role === 'assistant') {
        message.content.forEach(messageContent => {
          if (messageContent.type === 'tool_call' && messageContent.tool_name) {
            steps.push({
              thought: `Using ${messageContent.tool_name} to process the request`,
              tool_name: messageContent.tool_name,
              tool_params: { code: messageContent.content },
              tool_result: 'Result pending...'
            });
          }
        });
      }
    });

    return {
      id: example.id === 0 ? `example_${Date.now()}` : example.id.toString(),
      name: example.name,
      description: example.description,
      tags: example.metadata.tags,
      user_prompt: userPrompt,
      steps,
      created: example.metadata.created_at,
      updated: new Date().toISOString()
    };
  };

  const validateMessages = () => {
    const messages = currentExample.messages;
    const errors = [];

    if (messages.length === 0) {
      errors.push('At least one message is required');
      return errors;
    }

    if (messages[0].role !== 'user') {
      errors.push('First message must be from user');
    }

    if (messages[messages.length - 1].role !== 'assistant') {
      errors.push('Last message must be from assistant');
    }

    messages.forEach((msg, msgIndex) => {
      if (msg.content.length === 0) {
        errors.push(`Message ${msgIndex + 1} has no content chunks`);
        return;
      }

      msg.content.forEach((messageContent, contentIndex) => {
        if (!messageContent.content.trim()) {
          errors.push(`Message ${msgIndex + 1}, chunk ${contentIndex + 1} is empty`);
        }

        if (messageContent.type === 'tool_call') {
          if (!messageContent.tool_name) {
            errors.push(`Message ${msgIndex + 1}, chunk ${contentIndex + 1} missing tool name`);
          }
          
          const nextContent = msg.content[contentIndex + 1];
          if (!nextContent || nextContent.type !== 'tool_result') {
            errors.push(`Message ${msgIndex + 1}, chunk ${contentIndex + 1} tool call needs execution result`);
          }
        }
      });

      if (msg.role === 'user') {
        const textChunks = msg.content.filter(c => c.type === 'text');
        if (textChunks.length > 1) {
          errors.push(`User message ${msgIndex + 1} has multiple text chunks (only one allowed)`);
        }
        if (textChunks.length === 0) {
          errors.push(`User message ${msgIndex + 1} must have a text chunk`);
        }
      }
    });

    const metadataValidation = validateExampleMetadata(currentExample.name, currentExample.description);
    errors.push(...metadataValidation.errors);

    return errors;
  };

  return {
    currentExample,
    setCurrentExample,
    selectedMessageId,
    setSelectedMessageId,
    isLoading,
    setIsLoading,
    history,
    setHistory,
    executionTimeouts,
    setExecutionTimeouts,
    errors,
    hasErrors,
    addError,
    clearErrors,
    createExampleMutation,
    updateExampleMutation,
    executeToolResultMutation,
    executeAllToolsMutation,
    saveToHistory,
    loadSavedConversation,
    convertToApiFormat,
    validateMessages
  };
};
