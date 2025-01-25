import { useState } from "react";
import { KeywordInput } from "@/components/KeywordInput";
import { ResultsTable } from "@/components/ResultsTable";
import { MetricsCards } from "@/components/MetricsCards";
import { useToast } from "@/hooks/use-toast";
import { analyzeKeywordWithGemini } from "@/services/geminiService";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { ChartPie, Search, Upload, Save } from "lucide-react";
import { KeywordDataTable } from "@/components/KeywordDataTable";
import { ExcelUpload } from "@/components/ExcelUpload";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface KeywordResult {
  keyword: string;
  volume: number;
  difficulty: number;
  intent: string;
}

const KeywordResearch = () => {
  const [results, setResults] = useState<KeywordResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzeKeywords = async (keywords: string[]) => {
    setIsAnalyzing(true);
    try {
      const analyzedResults = await Promise.all(
        keywords.map(async (keyword) => {
          const analysis = await analyzeKeywordWithGemini(keyword);
          return {
            keyword,
            ...analysis,
          };
        })
      );

      setResults(analyzedResults);
      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${keywords.length} keywords`,
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze keywords. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveToDatabase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to save keywords",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from('keyword_data').insert(
        results.map(result => ({
          keyword: result.keyword,
          volume: result.volume,
          kd: result.difficulty,
          intent: result.intent.toLowerCase(),
          user_id: user.id
        }))
      );

      if (error) throw error;

      toast({
        title: "Success",
        description: "Keywords saved to database successfully",
      });
    } catch (error) {
      console.error('Error saving to database:', error);
      toast({
        title: "Error",
        description: "Failed to save keywords to database",
        variant: "destructive",
      });
    }
  };

  const calculateMetrics = () => {
    if (results.length === 0)
      return { totalKeywords: 0, avgVolume: 0, avgDifficulty: 0 };

    const avgVolume =
      results.reduce((acc, curr) => acc + curr.volume, 0) / results.length;
    const avgDifficulty =
      results.reduce((acc, curr) => acc + curr.difficulty, 0) / results.length;

    return {
      totalKeywords: results.length,
      avgVolume,
      avgDifficulty,
    };
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <div className="flex-1 p-8 bg-gray-50">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">
                  Keyword Research
                </h1>
                <p className="text-muted-foreground">
                  Analyze your keywords to get insights about search volume,
                  difficulty, and user intent.
                </p>
              </div>
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ChartPie className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold">Input Keywords</h2>
                </div>
                <KeywordInput onAnalyze={analyzeKeywords} disabled={isAnalyzing} />
              </div>

              {results.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <ChartPie className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">Analysis Results</h2>
                  </div>
                  <MetricsCards {...calculateMetrics()} />
                </div>
              )}
            </div>

            {results.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ChartPie className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">Detailed Results</h2>
                  </div>
                  <Button onClick={saveToDatabase} className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Results
                  </Button>
                </div>
                <ResultsTable results={results} />
              </div>
            )}

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold">Uploaded Keyword Data</h2>
                </div>
                <ExcelUpload />
              </div>
              <KeywordDataTable />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default KeywordResearch;