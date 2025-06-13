
import React from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  onCancel?: () => void;
  onRetry?: () => void;
  error?: string;
  timeout?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = 'Processing...',
  onCancel,
  onRetry,
  error,
  timeout = false,
}) => {
  if (!isLoading && !error && !timeout) return null;

  return (
    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-80 max-w-full mx-4">
        <CardContent className="p-6 text-center">
          {isLoading && !error && !timeout && (
            <>
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-sm text-gray-600 mb-4">{message}</p>
              {onCancel && (
                <Button variant="outline" size="sm" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </>
          )}

          {(error || timeout) && (
            <>
              <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-600" />
              <p className="text-sm font-medium text-gray-900 mb-2">
                {timeout ? 'Request Timed Out' : 'Something Went Wrong'}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                {error || 'The request took too long to complete. Please try again.'}
              </p>
              <div className="flex gap-2 justify-center">
                {onRetry && (
                  <Button size="sm" onClick={onRetry}>
                    Try Again
                  </Button>
                )}
                {onCancel && (
                  <Button variant="outline" size="sm" onClick={onCancel}>
                    Cancel
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
