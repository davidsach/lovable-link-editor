
import { useState, useCallback } from 'react';
import { useToast } from './use-toast';

export interface ErrorState {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  field?: string;
  line?: number;
  retryable?: boolean;
}

export const useErrorHandler = () => {
  const [errors, setErrors] = useState<ErrorState[]>([]);
  const { toast } = useToast();

  const addError = useCallback((error: Omit<ErrorState, 'id'>) => {
    const id = `error_${Date.now()}_${Math.random()}`;
    const newError = { ...error, id };
    
    setErrors(prev => [...prev, newError]);
    
    // Show toast for critical errors
    if (error.type === 'error') {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
    
    return id;
  }, [toast]);

  const removeError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  const clearErrors = useCallback((field?: string) => {
    setErrors(prev => field ? prev.filter(error => error.field !== field) : []);
  }, []);

  const getErrorsForField = useCallback((field: string) => {
    return errors.filter(error => error.field === field);
  }, [errors]);

  const hasErrors = errors.some(error => error.type === 'error');
  const hasWarnings = errors.some(error => error.type === 'warning');

  return {
    errors,
    hasErrors,
    hasWarnings,
    addError,
    removeError,
    clearErrors,
    getErrorsForField,
  };
};
