
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Wrench, Code, Function, BookOpen } from 'lucide-react';
import { Tool } from '@/services/api';

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
          {tools.length > 0 ? (
            tools.map((tool, index) => (
              <Card key={index} className="border border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-600 flex items-center">
                    <Code className="w-4 h-4 mr-2" />
                    {tool.tool_name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {/* Functions */}
                  {tool.functions && tool.functions.length > 0 && (
                    <div>
                      <div className="flex items-center text-xs font-medium text-gray-700 mb-2">
                        <Function className="w-3 h-3 mr-1" />
                        Functions
                      </div>
                      <div className="space-y-2">
                        {tool.functions.map((func, funcIndex) => (
                          <div key={funcIndex} className="bg-gray-50 p-2 rounded text-xs">
                            <div className="font-medium text-gray-800">{func.func_name}</div>
                            {func.params && func.params.length > 0 && (
                              <div className="mt-1 space-y-1">
                                {func.params.map((param, paramIndex) => (
                                  <div key={paramIndex} className="text-gray-600">
                                    <span className="font-mono">{param.param_name}</span>
                                    <span className="text-gray-500">: {param.param_type}</span>
                                    {param.is_required && (
                                      <Badge variant="outline" className="ml-1 text-xs">required</Badge>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Classes */}
                  {tool.classes && tool.classes.length > 0 && (
                    <div>
                      <div className="flex items-center text-xs font-medium text-gray-700 mb-2">
                        <BookOpen className="w-3 h-3 mr-1" />
                        Classes
                      </div>
                      <div className="space-y-2">
                        {tool.classes.map((cls, clsIndex) => (
                          <div key={clsIndex} className="bg-blue-50 p-2 rounded text-xs">
                            <div className="font-medium text-blue-800">{cls.class_name}</div>
                            {cls.params && cls.params.length > 0 && (
                              <div className="mt-1 space-y-1">
                                {cls.params.map((param, paramIndex) => (
                                  <div key={paramIndex} className="text-blue-600">
                                    <span className="font-mono">{param.param_name}</span>
                                    <span className="text-blue-500">: {param.param_type}</span>
                                    {param.is_required && (
                                      <Badge variant="outline" className="ml-1 text-xs">required</Badge>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            // Fallback display when no tools are loaded from API
            <div className="space-y-4">
              <div className="text-sm text-gray-500 text-center">Loading tools...</div>
            </div>
          )}
        </div>
      )}
      
      {collapsed && (
        <div className="p-2 space-y-2 overflow-y-auto h-full pb-20">
          {tools.length > 0 ? (
            tools.map((tool, index) => (
              <div 
                key={index}
                className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center hover:bg-blue-100 transition-colors"
                title={tool.tool_name}
              >
                <Code className="w-5 h-5 text-blue-600" />
              </div>
            ))
          ) : (
            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-gray-400" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
