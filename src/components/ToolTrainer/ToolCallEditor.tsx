
import React from 'react';
import { Textarea } from '@/components/ui/textarea';

interface ToolCallEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const ToolCallEditor: React.FC<ToolCallEditorProps> = ({ value, onChange, className }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Python Code:</label>
      </div>
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`# Write your Python code here
# Example:
import requests

# Make API call
response = requests.get("https://api.example.com/data")
result = response.json()

# Process data
processed_data = {
    "status": "success",
    "data": result
}

print(processed_data)`}
          className={`font-mono text-sm min-h-[200px] bg-gray-50 border-gray-300 ${className || ''}`}
          spellCheck={false}
        />
        <div className="absolute top-2 right-2">
          <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            Python
          </div>
        </div>
      </div>
      <div className="text-xs text-gray-500 mt-1">
        Write Python code that will be executed. The result will be captured and displayed below.
      </div>
    </div>
  );
};
