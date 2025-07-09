import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Loader2, Download, List } from "lucide-react";
import { Example } from "../../types/toolTrainer";

interface RetrieveExampleProps {
  onExampleRetrieved: (example: Example) => void;
}

export const RetrieveExample: React.FC<RetrieveExampleProps> = ({
  onExampleRetrieved,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [exampleId, setExampleId] = useState("");
  const [retrievedExample, setRetrievedExample] = useState<Example | null>(
    null
  );
  const [allExamples, setAllExamples] = useState<Example[]>([]);
  const [showAllExamples, setShowAllExamples] = useState(false);

  // NEW: Mode selector and file path state
  const [retrieveMode, setRetrieveMode] = useState<"database" | "markdown">(
    "database"
  );
  const [filePath, setFilePath] = useState("");

  // NEW: Retrieve by file path
  const handleRetrieveByFilePath = async () => {
    if (!filePath.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/examples/load-markdown",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer abcd",
          },
          body: JSON.stringify({ path: filePath }),
        }
      );
      if (!response.ok)
        throw new Error(`Failed to retrieve example: ${response.status}`);
      const example = await response.json();
      setRetrievedExample(example);
      console.log("Example retrieved from markdown:", example);
    } catch (error) {
      console.error("Error retrieving markdown example:", error);
      setRetrievedExample(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Updated: Retrieve by ID (DB)
  const handleRetrieveById = async () => {
    if (!exampleId.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/examples/${exampleId}`,
        {
          headers: { Authorization: "Bearer abcd" },
        }
      );
      if (!response.ok)
        throw new Error(`Failed to retrieve example: ${response.status}`);
      const example = await response.json();
      setRetrievedExample(example);
      console.log("Example retrieved from DB:", example);
    } catch (error) {
      console.error("Error retrieving DB example:", error);
      setRetrievedExample(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Retrieve all from DB (unchanged)
  const handleRetrieveAll = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/examples/", {
        headers: { Authorization: "Bearer abcd" },
      });
      if (!response.ok)
        throw new Error(`Failed to retrieve examples: ${response.status}`);
      const examples = await response.json();
      setAllExamples(examples);
      setShowAllExamples(true);
      console.log("All examples retrieved successfully:", examples);
    } catch (error) {
      console.error("Error retrieving examples:", error);
      setAllExamples([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadExample = (example: Example) => {
    onExampleRetrieved(example);
    setIsOpen(false);
    setRetrievedExample(null);
    setAllExamples([]);
    setShowAllExamples(false);
    setExampleId("");
    setFilePath("");
  };

  const resetDialog = () => {
    setIsOpen(false);
    setRetrievedExample(null);
    setAllExamples([]);
    setShowAllExamples(false);
    setExampleId("");
    setFilePath("");
  };

  // NEW: Unified retrieve handler
  const handleRetrieve = () => {
    if (retrieveMode === "database") {
      handleRetrieveById();
    } else {
      handleRetrieveByFilePath();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-blue-500/20 border-blue-400/50 text-blue-300 hover:bg-blue-500/30 hover:border-blue-400 shadow-lg transition-all duration-200 px-6 h-11"
        >
          <Search className="w-4 h-4 mr-2" />
          Retrieve Example
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-gray-800 border-gray-600 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-blue-300">
            Retrieve Example (
            {retrieveMode === "database" ? "Database" : "Markdown File"})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mode Selector */}
          <div className="space-y-2">
            <Label className="text-gray-300">Retrieve Mode</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  checked={retrieveMode === "database"}
                  onChange={() => setRetrieveMode("database")}
                />
                <span>Database</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  checked={retrieveMode === "markdown"}
                  onChange={() => setRetrieveMode("markdown")}
                />
                <span>Markdown File</span>
              </label>
            </div>
          </div>

          {/* Retrieve by ID or File Path */}
          {retrieveMode === "database" ? (
            <div className="space-y-2">
              <Label htmlFor="exampleId" className="text-gray-300">
                Example ID
              </Label>
              <div className="flex gap-2">
                <Input
                  id="exampleId"
                  value={exampleId}
                  onChange={(e) => setExampleId(e.target.value)}
                  placeholder="Enter example ID..."
                  className="bg-gray-700 border-gray-600 text-white"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRetrieve();
                  }}
                />
                <Button
                  onClick={handleRetrieve}
                  disabled={!exampleId.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="filePath" className="text-gray-300">
                Markdown File Path
              </Label>
              <div className="flex gap-2">
                <Input
                  id="filePath"
                  value={filePath}
                  onChange={(e) => setFilePath(e.target.value)}
                  placeholder="e.g. /mnt/examples/example1.md"
                  className="bg-gray-700 border-gray-600 text-white"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRetrieve();
                  }}
                />
                <Button
                  onClick={handleRetrieve}
                  disabled={!filePath.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Retrieve All Examples (DB only) */}
          {retrieveMode === "database" && (
            <div className="flex gap-2">
              <Button
                onClick={handleRetrieveAll}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <List className="w-4 h-4 mr-2" />
                )}
                Show All Examples
              </Button>
            </div>
          )}

          {/* Single Retrieved Example */}
          {retrievedExample && (
            <div className="bg-gray-700/50 p-4 rounded border border-gray-600 space-y-3">
              <div className="text-sm font-medium text-green-300">
                Example Retrieved Successfully
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-400">ID:</span>{" "}
                  {retrievedExample.id}
                </div>
                <div>
                  <span className="text-gray-400">Name:</span>{" "}
                  {retrievedExample.name || "Untitled"}
                </div>
                <div>
                  <span className="text-gray-400">Description:</span>{" "}
                  {retrievedExample.description || "No description"}
                </div>
                <div>
                  <span className="text-gray-400">Messages:</span>{" "}
                  {retrievedExample.messages?.length || 0}
                </div>
                <div>
                  <span className="text-gray-400">Created:</span>{" "}
                  {retrievedExample.created_at
                    ? new Date(retrievedExample.created_at).toLocaleDateString()
                    : "Unknown"}
                </div>
              </div>

              <Button
                onClick={() => handleLoadExample(retrievedExample)}
                className="w-full bg-green-600 hover:bg-green-700 text-white mt-3"
              >
                <Download className="w-4 h-4 mr-2" />
                Load This Example
              </Button>
            </div>
          )}

          {/* All Examples List */}
          {showAllExamples && allExamples.length > 0 && (
            <div className="bg-gray-700/50 p-4 rounded border border-gray-600 space-y-3 max-h-60 overflow-y-auto">
              <div className="text-sm font-medium text-green-300">
                All Examples ({allExamples.length})
              </div>
              <div className="space-y-2">
                {allExamples.map((example) => (
                  <div
                    key={example.id}
                    className="bg-gray-600/50 p-3 rounded border border-gray-500 hover:bg-gray-600/70 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-1 text-sm">
                        <div className="font-medium">
                          {example.name || `Example ${example.id}`}
                        </div>
                        <div className="text-gray-400">
                          {example.description || "No description"}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {example.id} | Messages:{" "}
                          {example.messages?.length || 0} | Created:{" "}
                          {example.created_at
                            ? new Date(example.created_at).toLocaleDateString()
                            : "Unknown"}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleLoadExample(example)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white ml-3"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Load
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No examples found */}
          {showAllExamples && allExamples.length === 0 && !isLoading && (
            <div className="bg-gray-700/50 p-4 rounded border border-gray-600 text-center text-gray-400">
              No examples found in the database
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              onClick={resetDialog}
              variant="outline"
              className="flex-1 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
