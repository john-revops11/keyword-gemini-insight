import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";

interface KeywordResult {
  keyword: string;
  volume: number;
  difficulty: number;
  intent: string;
}

interface ResultsTableProps {
  results: KeywordResult[];
}

export const ResultsTable = ({ results }: ResultsTableProps) => {
  const [sortField, setSortField] = useState<keyof KeywordResult | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

  const handleSort = (field: keyof KeywordResult) => {
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

  const getSortIcon = (field: keyof KeywordResult) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4 inline-block ml-1" /> : 
      <ChevronDown className="w-4 h-4 inline-block ml-1" />;
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case "informational":
        return "bg-blue-100 text-blue-800";
      case "transactional":
        return "bg-green-100 text-green-800";
      case "navigational":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const sortedResults = [...results].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;
    
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return sortDirection === 'asc' 
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleSort('keyword')}
            >
              Keyword {getSortIcon('keyword')}
            </TableHead>
            <TableHead 
              className="text-right cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleSort('volume')}
            >
              Search Volume {getSortIcon('volume')}
            </TableHead>
            <TableHead 
              className="text-right cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleSort('difficulty')}
            >
              Difficulty {getSortIcon('difficulty')}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleSort('intent')}
            >
              Intent {getSortIcon('intent')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedResults.map((result) => (
            <TableRow key={result.keyword}>
              <TableCell className="font-medium whitespace-nowrap">{result.keyword}</TableCell>
              <TableCell className="text-right">{result.volume.toLocaleString()}</TableCell>
              <TableCell className="text-right">
                <span className={`inline-block w-16 text-center rounded-full px-2 py-1 text-xs font-medium ${
                  result.difficulty < 33 ? "bg-green-100 text-green-800" :
                  result.difficulty < 66 ? "bg-yellow-100 text-yellow-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {result.difficulty}%
                </span>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className={getIntentColor(result.intent)}>
                  {result.intent}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};