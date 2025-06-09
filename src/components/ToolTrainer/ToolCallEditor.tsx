
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
        <label className="text-sm font-medium text-gray-700">Tool Call Python Code:</label>
      </div>
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder='# Write your Python tool call code here
result = tool_name.function_name(
    param1="value1",
    param2="value2"
)'
          className={`font-mono text-sm min-h-[120px] bg-gray-50 border-gray-300 ${className || ''}`}
          spellCheck={false}
        />
        <div className="absolute top-2 right-2">
          <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            Python
          </div>
        </div>
      </div>
    </div>
  );
};
