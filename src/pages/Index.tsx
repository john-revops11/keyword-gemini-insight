import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, BarChart3, Search, Users } from "lucide-react";
import { ExcelUpload } from "@/components/ExcelUpload";
import { KeywordDataTable } from "@/components/KeywordDataTable";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const tools = [
  {
    name: "Keyword Research",
    description: "Analyze keywords for search volume and competition",
    icon: Search,
    route: "/keyword-research",
  },
  {
    name: "Competitor Analysis",
    description: "Track and analyze your competitors' SEO strategies",
    icon: Users,
    route: "#",
  },
  {
    name: "Rank Tracking",
    description: "Monitor your keyword rankings over time",
    icon: BarChart3,
    route: "#",
  },
];

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <div className="flex-1 p-8 bg-gray-50">
          <div className="max-w-[1400px] mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-sm text-secondary">
                  Welcome to your SEO tools dashboard
                </p>
              </div>
              <Activity className="w-8 h-8 text-muted-foreground" />
            </div>

            <div className="grid gap-8">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Available Tools</h2>
                <div className="grid gap-4 md:grid-cols-3">
                  {tools.map((tool) => (
                    <Card key={tool.name}>
                      <CardHeader className="flex flex-row items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <tool.icon className="w-5 h-5 text-primary" />
                        </div>
                        <CardTitle className="text-lg">{tool.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-secondary">
                          {tool.description}
                        </p>
                        <a
                          href={tool.route}
                          className="inline-block mt-4 text-sm text-primary hover:underline"
                        >
                          Open tool →
                        </a>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Keyword Data</h2>
                  <ExcelUpload />
                </div>
                <div className="w-full">
                  <KeywordDataTable />
                </div>
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious className="cursor-pointer" />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink isActive>1</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext className="cursor-pointer" />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;