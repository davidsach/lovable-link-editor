
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, MessageSquare, Code, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            LLM Tool Training Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create, edit, and manage training examples for LLM tool use with an intuitive interface
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
                Interactive Builder
              </CardTitle>
              <CardDescription>
                Build training examples step by step with an intuitive message builder
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Code className="w-5 h-5 mr-2 text-green-600" />
                Tool Integration
              </CardTitle>
              <CardDescription>
                Seamlessly integrate tool calls with syntax highlighting and validation
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                Auto Generation
              </CardTitle>
              <CardDescription>
                Automatically generate examples or let users create custom training data
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center">
          <Link to="/tool-trainer">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
              <Wrench className="w-5 h-5 mr-2" />
              Open Tool Trainer
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>

        <div className="mt-16 bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Core Functionality</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Create multi-turn conversations</li>
                <li>• Add text chunks and tool calls</li>
                <li>• Execute tool calls with backend integration</li>
                <li>• Export examples as JSON files</li>
                <li>• Load and edit existing examples</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Advanced Features</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Collapsible sidebar with available tools</li>
                <li>• Syntax highlighting for code editor</li>
                <li>• Auto-generation capabilities</li>
                <li>• Intuitive drag-and-drop interface</li>
                <li>• Real-time validation and feedback</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
