
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Tool Trainer Application
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Train and manage AI tools with our comprehensive platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Tool Trainer</CardTitle>
              <CardDescription>
                Execute Python code, manage multiple code chunks, and work with available tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/tool-trainer">
                <Button className="w-full">
                  Go to Tool Trainer
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Toy Examples Manager</CardTitle>
              <CardDescription>
                Create, view, edit, and manage toy examples for training your AI tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/toy-examples">
                <Button className="w-full">
                  Manage Toy Examples
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
