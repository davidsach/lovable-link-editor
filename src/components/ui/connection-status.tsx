
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConnectionStatusProps {
  isConnected: boolean;
  isLoading: boolean;
  onRetry?: () => void;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  isLoading,
  onRetry,
}) => {
  if (isConnected) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="w-4 h-4 text-green-600" />
        <AlertTitle className="text-green-800">Connected</AlertTitle>
        <AlertDescription className="text-green-700">
          Successfully connected to backend server
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive" className="border-orange-200 bg-orange-50">
      <AlertTriangle className="w-4 h-4 text-orange-600" />
      <AlertTitle className="text-orange-800">Backend Disconnected</AlertTitle>
      <AlertDescription className="text-orange-700">
        <div className="flex items-center justify-between">
          <span>
            Unable to connect to backend server. Using mock data for development.
          </span>
          {onRetry && (
            <Button
              size="sm"
              variant="outline"
              onClick={onRetry}
              disabled={isLoading}
              className="ml-4"
            >
              {isLoading ? (
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3 mr-1" />
              )}
              Retry
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};
