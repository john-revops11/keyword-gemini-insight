import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface KeywordData {
  keyword: string;
  intent?: string;
  position?: number;
  traffic?: number;
  traffic_percentage?: number;
  volume?: number;
  kd?: number;
  cpc?: number;
  url?: string;
  previous_position?: number;
  competition?: number;
  number_of_results?: number;
  position_type?: string;
}

export const ExcelUpload = () => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const processExcelData = (data: any[]): KeywordData[] => {
    console.log('Raw Excel data before processing:', data);
    
    return data.map(row => {
      // Convert all keys to lowercase for case-insensitive matching
      const normalizedRow: any = {};
      Object.keys(row).forEach(key => {
        normalizedRow[key.toLowerCase()] = row[key];
      });

      // Create processed row with proper type conversions
      const processedRow: KeywordData = {
        keyword: String(normalizedRow.keyword || "").trim(),
        intent: normalizedRow.intent ? String(normalizedRow.intent) : null,
        position: normalizedRow.position ? Number(normalizedRow.position) : null,
        traffic: normalizedRow.traffic ? Number(normalizedRow.traffic) : null,
        traffic_percentage: normalizedRow.traffic_percentage ? Number(normalizedRow.traffic_percentage) : null,
        volume: normalizedRow.volume ? Number(normalizedRow.volume) : null,
        kd: normalizedRow.kd ? Number(normalizedRow.kd) : null,
        cpc: normalizedRow.cpc ? Number(normalizedRow.cpc) : null,
        url: normalizedRow.url ? String(normalizedRow.url) : null,
        previous_position: normalizedRow.previous_position ? Number(normalizedRow.previous_position) : null,
        competition: normalizedRow.competition ? Number(normalizedRow.competition) : null,
        number_of_results: normalizedRow.number_of_results ? Number(normalizedRow.number_of_results) : null,
        position_type: normalizedRow.position_type ? String(normalizedRow.position_type) : null
      };

      console.log('Processed row:', processedRow);
      return processedRow;
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      ".csv",
      "text/csv",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an Excel file (.xlsx, .xls) or CSV file",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      console.log('Excel data read from file:', jsonData);
      
      if (!Array.isArray(jsonData) || jsonData.length === 0) {
        throw new Error('No data found in the Excel file');
      }

      const processedData = processExcelData(jsonData);
      console.log('Processed data to insert:', processedData);

      // Filter out any rows where keyword is empty or undefined
      const validData = processedData.filter(row => {
        const isValid = row.keyword && row.keyword.trim() !== '';
        if (!isValid) {
          console.log('Skipping invalid row:', row);
        }
        return isValid;
      });
      
      if (validData.length === 0) {
        throw new Error('No valid keyword data found in the Excel file. Make sure your file has a "keyword" column with non-empty values.');
      }
      
      const { data: insertedData, error } = await supabase
        .from("keyword_data")
        .insert(validData)
        .select();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }

      console.log('Successfully inserted data:', insertedData);

      // Invalidate and refetch the keyword data query
      await queryClient.invalidateQueries({ queryKey: ['keyword-data'] });

      toast({
        title: "Success",
        description: `Successfully uploaded ${validData.length} keywords`,
      });

      // Reset the file input
      event.target.value = "";
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error uploading data",
        description: error instanceof Error 
          ? error.message 
          : "Please check your file format and make sure it contains a 'keyword' column with valid data",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileUpload}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isUploading}
      />
      <Button 
        variant="default" 
        className="w-full bg-primary hover:bg-primary/90 text-white bg-green"
        disabled={isUploading}
      >
        <Upload className="w-4 h-4 mr-2" />
        {isUploading ? "Uploading..." : "Upload Excel"}
      </Button>
    </div>
  );
};