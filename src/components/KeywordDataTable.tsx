import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ChevronUp, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface KeywordData {
  id: string;
  keyword: string;
  intent: string | null;
  position: number;
  traffic: number;
  volume: number;
  cpc: number;
  url: string;
  competition: number;
}

type SortDirection = "asc" | "desc" | null;
type SortField = keyof KeywordData | null;

export const KeywordDataTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const rowsPerPage = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['keyword-data', currentPage, sortField, sortDirection],
    queryFn: async () => {
      console.log('Starting to fetch keyword data...');
      const from = (currentPage - 1) * rowsPerPage;
      const to = from + rowsPerPage - 1;

      let query = supabase
        .from("keyword_data")
        .select("*", { count: 'exact' });

      if (sortField && sortDirection) {
        const isNumericField = ['position', 'traffic', 'volume', 'cpc', 'competition'].includes(sortField);
        if (isNumericField) {
          query = query.order(sortField, { 
            ascending: sortDirection === 'asc',
            nullsFirst: false 
          });
        } else {
          query = query.order(sortField, { 
            ascending: sortDirection === 'asc',
            nullsFirst: false,
            foreignTable: undefined
          });
        }
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data: keywordData, error: fetchError, count } = await query
        .range(from, to);

      if (fetchError) {
        console.error('Error fetching keyword data:', fetchError);
        throw fetchError;
      }

      console.log('Successfully fetched keyword data:', keywordData);
      return {
        data: keywordData,
        count: count || 0,
      };
    },
    placeholderData: (previousData) => previousData,
    retry: 3,
    refetchOnWindowFocus: true,
  });

  const handleSort = (field: keyof KeywordData) => {
    setCurrentPage(1);
    
    if (sortField === field) {
      setSortDirection(prev => {
        if (prev === 'asc') return 'desc';
        if (prev === 'desc') return null;
        return 'asc';
      });
      if (sortDirection === 'desc') {
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: keyof KeywordData) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4 inline-block ml-1" /> : 
      <ChevronDown className="w-4 h-4 inline-block ml-1" />;
  };

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        Error loading keyword data. Please try again later.
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="text-center py-4">
        <div className="animate-pulse flex space-x-4 justify-center">
          <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
          <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
          <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(data.count / rowsPerPage);

  const getIntentBadge = (intent: string | null) => {
    if (!intent) return null;
    switch (intent.toLowerCase()) {
      case "informational":
        return <Badge variant="secondary">Informational</Badge>;
      case "transactional":
        return <Badge variant="default">Transactional</Badge>;
      case "navigational":
        return <Badge variant="outline">Navigational</Badge>;
      case "commercial":
        return <Badge className="bg-green-100 text-green-800">Commercial</Badge>;
      default:
        return null;
    }
  };

  const handlePageChange = (newPage: number) => {
    const validPage = Math.max(1, Math.min(newPage, totalPages));
    setCurrentPage(validPage);
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') return;
    
    const pageNum = parseInt(value, 10);
    if (isNaN(pageNum)) return;
    
    handlePageChange(pageNum);
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer hover:bg-gray-900 transition-colors bg-black text-white"
              onClick={() => handleSort('keyword')}
            >
              Keyword {getSortIcon('keyword')}
            </TableHead>
            <TableHead 
              className="text-right cursor-pointer hover:bg-gray-900 transition-colors bg-black text-white"
              onClick={() => handleSort('position')}
            >
              Position {getSortIcon('position')}
            </TableHead>
            <TableHead 
              className="text-right cursor-pointer hover:bg-gray-900 transition-colors bg-black text-white"
              onClick={() => handleSort('volume')}
            >
              Volume {getSortIcon('volume')}
            </TableHead>
            <TableHead 
              className="text-right cursor-pointer hover:bg-gray-900 transition-colors bg-black text-white"
              onClick={() => handleSort('cpc')}
            >
              CPC {getSortIcon('cpc')}
            </TableHead>
            <TableHead 
              className="text-right cursor-pointer hover:bg-gray-900 transition-colors bg-black text-white"
              onClick={() => handleSort('traffic')}
            >
              Traffic {getSortIcon('traffic')}
            </TableHead>
            <TableHead 
              className="text-right cursor-pointer hover:bg-gray-900 transition-colors bg-black text-white"
              onClick={() => handleSort('competition')}
            >
              Competition {getSortIcon('competition')}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-900 transition-colors bg-black text-white"
              onClick={() => handleSort('intent')}
            >
              Intent {getSortIcon('intent')}
            </TableHead>
            <TableHead className="bg-black text-white">URL</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.data?.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium text-gray-800">{item.keyword}</TableCell>
              <TableCell className="text-right text-gray-800">{item.position}</TableCell>
              <TableCell className="text-right text-gray-800">{item.volume}</TableCell>
              <TableCell className="text-right text-gray-800">
                {item.cpc ? `$${item.cpc.toFixed(2)}` : "-"}
              </TableCell>
              <TableCell className="text-right text-gray-800">{item.traffic || "-"}</TableCell>
              <TableCell className="text-right text-gray-800">
                {item.competition ? `${(item.competition * 100).toFixed(1)}%` : "-"}
              </TableCell>
              <TableCell>{getIntentBadge(item.intent)}</TableCell>
              <TableCell>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 inline-flex items-center gap-1"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 py-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 text-sm rounded-md border ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            Prev
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm">Page:</span>
            <input
              type="number"
              value={currentPage}
              onChange={handlePageInputChange}
              min={1}
              max={totalPages}
              className="w-16 px-2 py-1 text-sm border rounded-md"
            />
            <span className="text-sm">of {totalPages}</span>
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 text-sm rounded-md border ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
