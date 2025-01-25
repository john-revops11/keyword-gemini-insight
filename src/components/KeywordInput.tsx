import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface KeywordInputProps {
  onAnalyze: (keywords: string[]) => void;
  disabled?: boolean;
}

export const KeywordInput = ({ onAnalyze, disabled }: KeywordInputProps) => {
  const [input, setInput] = useState("");
  const { toast } = useToast();

  const handleAnalyze = () => {
    const keywords = input
      .split("\n")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
    onAnalyze(keywords);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/plain") {
      toast({
        title: "Invalid file type",
        description: "Please upload a .txt file",
        variant: "destructive",
      });
      return;
    }

    try {
      const text = await file.text();
      setInput(text);
      toast({
        title: "File uploaded successfully",
        description: "Your keywords have been loaded",
      });
    } catch (error) {
      toast({
        title: "Error reading file",
        description: "Please try again with a different file",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Enter keywords (one per line)&#10;Example:&#10;digital marketing&#10;seo services&#10;content strategy"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="min-h-[200px] font-mono"
        disabled={disabled}
      />
      <div className="flex gap-2">
        <Button 
          onClick={handleAnalyze} 
          className="flex-1"
          disabled={disabled}
        >
          {disabled ? "Analyzing..." : "Analyze Keywords"}
        </Button>
        <div className="relative">
          <input
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={disabled}
          />
          <Button variant="outline" className="w-full" disabled={disabled}>
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>
    </div>
  );
};