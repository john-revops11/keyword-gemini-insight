import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MetricsCardsProps {
  totalKeywords: number;
  avgVolume: number;
  avgDifficulty: number;
}

export const MetricsCards = ({
  totalKeywords,
  avgVolume,
  avgDifficulty,
}: MetricsCardsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Keywords</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalKeywords}</div>
          <p className="text-xs text-muted-foreground">Keywords analyzed</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            Search Volume
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <InfoCircledIcon className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Real search volume data from Google Search Console when available. Falls back to AI-generated estimates for keywords without historical data.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(avgVolume).toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Monthly searches</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            Competition Level
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <InfoCircledIcon className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    AI-estimated competition level based on keyword complexity and common SEO patterns. For precise metrics, consider using professional SEO tools.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(avgDifficulty)}%</div>
          <p className="text-xs text-muted-foreground">Estimated competition</p>
        </CardContent>
      </Card>
    </div>
  );
};