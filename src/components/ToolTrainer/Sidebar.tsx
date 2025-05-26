
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Wrench, Code } from 'lucide-react';

interface Tool {
  name: string;
  description: string;
  functions: string[];
}

interface SidebarProps {
  tools: Tool[];
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ tools, collapsed, onToggle }) => {
  return (
    <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-10 ${
      collapsed ? 'w-16' : 'w-80'
    }`}>
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!collapsed && (
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <Wrench className="w-5 h-5 mr-2 text-blue-600" />
            Available Tools
          </h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="p-2"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>
      
      {!collapsed && (
        <div className="p-4 space-y-4 overflow-y-auto h-full pb-20">
          {tools.map((tool, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-700 flex items-center">
                  <Code className="w-4 h-4 mr-2" />
                  {tool.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-gray-600 mb-3">{tool.description}</p>
                <div className="space-y-1">
                  {tool.functions.map((func, funcIndex) => (
                    <Badge 
                      key={funcIndex} 
                      variant="secondary" 
                      className="text-xs mr-1 mb-1"
                    >
                      {func}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {collapsed && (
        <div className="p-2 space-y-2 overflow-y-auto h-full pb-20">
          {tools.map((tool, index) => (
            <div 
              key={index}
              className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center hover:bg-blue-100 transition-colors"
              title={tool.name}
            >
              <Code className="w-5 h-5 text-blue-600" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
