import '../../../src/test/setup';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExcelUpload } from '../ExcelUpload';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Mock the dependencies
vi.mock('@/components/ui/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'test-user-id' } } })),
    },
    from: vi.fn(() => ({
      insert: vi.fn(() => Promise.resolve({ error: null })),
    })),
  },
}));

describe('ExcelUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders upload button', () => {
    render(<ExcelUpload />);
    expect(screen.getByText('Upload Excel')).toBeInTheDocument();
  });

  it('shows error toast for invalid file type', async () => {
    const mockToast = vi.fn();
    (useToast as any).mockImplementation(() => ({
      toast: mockToast,
    }));

    render(<ExcelUpload />);
    
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByRole('button').previousElementSibling as HTMLInputElement;
    
    await fireEvent.change(input, { target: { files: [file] } });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Invalid file type',
      description: 'Please upload an Excel file (.xlsx or .xls)',
      variant: 'destructive',
    });
  });

  it('handles successful file upload', async () => {
    const mockToast = vi.fn();
    const mockInvalidateQueries = vi.fn();
    
    (useToast as any).mockImplementation(() => ({
      toast: mockToast,
    }));
    
    (useQueryClient as any).mockImplementation(() => ({
      invalidateQueries: mockInvalidateQueries,
    }));

    render(<ExcelUpload />);
    
    const file = new File(['test'], 'test.xlsx', { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const input = screen.getByRole('button').previousElementSibling as HTMLInputElement;
    
    await fireEvent.change(input, { target: { files: [file] } });

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['keyword-data'] });
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'Your keyword data has been uploaded successfully',
    });
  });

  it('handles upload error', async () => {
    const mockToast = vi.fn();
    (useToast as any).mockImplementation(() => ({
      toast: mockToast,
    }));

    // Mock Supabase error
    (supabase.from as any).mockImplementation(() => ({
      insert: vi.fn(() => Promise.resolve({ error: new Error('Upload failed') })),
    }));

    render(<ExcelUpload />);
    
    const file = new File(['test'], 'test.xlsx', { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const input = screen.getByRole('button').previousElementSibling as HTMLInputElement;
    
    await fireEvent.change(input, { target: { files: [file] } });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Error uploading data',
      description: 'Please check your file format and try again',
      variant: 'destructive',
    });
  });
});