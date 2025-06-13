
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertCircle, Info, X, RefreshCw } from 'lucide-react';
import { ErrorState } from '@/hooks/useErrorHandler';

interface ErrorDisplayProps {
  errors: ErrorState[];
  onDismiss?: (id: string) => void;
  onRetry?: (id: string) => void;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  errors,
  onDismiss,
  onRetry,
  className = '',
}) => {
  if (errors.length === 0) return null;

  const getIcon = (type: ErrorState['type']) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-4 h-4" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4" />;
      case 'info':
        return <Info className="w-4 h-4" />;
    }
  };

  const getVariant = (type: ErrorState['type']) => {
    return type === 'error' ? 'destructive' : 'default';
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {errors.map((error) => (
        <Alert key={error.id} variant={getVariant(error.type)} className="relative">
          {getIcon(error.type)}
          <div className="flex-1">
            <AlertTitle className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {error.type.toUpperCase()}
              </Badge>
              {error.field && (
                <Badge variant="secondary" className="text-xs">
                  {error.field}
                </Badge>
              )}
              {error.line && (
                <Badge variant="outline" className="text-xs">
                  Line {error.line}
                </Badge>
              )}
            </AlertTitle>
            <AlertDescription className="mt-1">
              {error.message}
            </AlertDescription>
            {(error.retryable || onDismiss) && (
              <div className="flex gap-2 mt-2">
                {error.retryable && onRetry && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRetry(error.id)}
                    className="h-7 text-xs"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Retry
                  </Button>
                )}
                {onDismiss && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDismiss(error.id)}
                    className="h-7 text-xs"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Dismiss
                  </Button>
                )}
              </div>
            )}
          </div>
        </Alert>
      ))}
    </div>
  );
};
