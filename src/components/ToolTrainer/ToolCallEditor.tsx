
import React from 'react';
import { Textarea } from '@/components/ui/textarea';

interface ToolCallEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const ToolCallEditor: React.FC<ToolCallEditorProps> = ({ value, onChange }) => {
  const formatJSON = (str: string) => {
    try {
      const parsed = JSON.parse(str);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return str;
    }
  };

  const handleFormat = () => {
    const formatted = formatJSON(value);
    onChange(formatted);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Tool Call JSON:</label>
        <button
          onClick={handleFormat}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          Format JSON
        </button>
      </div>
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder='{\n  "function": "function_name",\n  "parameters": {\n    "param1": "value1"\n  }\n}'
          className="font-mono text-sm min-h-[120px] bg-gray-50 border-gray-300"
          spellCheck={false}
        />
        <div className="absolute top-2 right-2">
          <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            JSON
          </div>
        </div>
      </div>
    </div>
  );
};
