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
import { useState } from "react";

interface KeywordData {
  keyword: string;
  intent: 'i' | 't';
  position: number;
  traffic: number;
  trafficPercentage: number;
  volume: number;
  kd: number;
  cpc: number;
  url: string;
}

interface KeywordTableProps {
  data: KeywordData[];
}

export const KeywordTable = ({ data }: KeywordTableProps) => {
  const [sortField, setSortField] = useState<keyof KeywordData | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

  const handleSort = (field: keyof KeywordData) => {
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

  const getIntentBadge = (intent: string) => {
    switch (intent) {
      case 'i':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Informational</Badge>;
      case 't':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Transactional</Badge>;
      default:
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Other</Badge>;
    }
  };

  const sortedData = [...data].sort((a, b) => {
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
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleSort('intent')}
            >
              Intent {getSortIcon('intent')}
            </TableHead>
            <TableHead 
              className="text-right cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleSort('position')}
            >
              Position {getSortIcon('position')}
            </TableHead>
            <TableHead 
              className="text-right cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleSort('traffic')}
            >
              Traffic {getSortIcon('traffic')}
            </TableHead>
            <TableHead 
              className="text-right cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleSort('trafficPercentage')}
            >
              Traffic % {getSortIcon('trafficPercentage')}
            </TableHead>
            <TableHead 
              className="text-right cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleSort('volume')}
            >
              Volume {getSortIcon('volume')}
            </TableHead>
            <TableHead 
              className="text-right cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleSort('kd')}
            >
              KD % {getSortIcon('kd')}
            </TableHead>
            <TableHead 
              className="text-right cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleSort('cpc')}
            >
              CPC {getSortIcon('cpc')}
            </TableHead>
            <TableHead>URL</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium whitespace-nowrap">{item.keyword}</TableCell>
              <TableCell>{getIntentBadge(item.intent)}</TableCell>
              <TableCell className="text-right">{item.position}</TableCell>
              <TableCell className="text-right">{item.traffic}</TableCell>
              <TableCell className="text-right">{item.trafficPercentage.toFixed(2)}%</TableCell>
              <TableCell className="text-right">{item.volume.toLocaleString()}</TableCell>
              <TableCell className="text-right">
                <span className={`inline-block w-12 text-center rounded-full px-2 py-1 text-xs font-medium ${
                  item.kd < 33 ? "bg-green-100 text-green-800" :
                  item.kd < 66 ? "bg-yellow-100 text-yellow-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {item.kd}
                </span>
              </TableCell>
              <TableCell className="text-right">${item.cpc.toFixed(2)}</TableCell>
              <TableCell>
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 inline-flex items-center gap-1"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};