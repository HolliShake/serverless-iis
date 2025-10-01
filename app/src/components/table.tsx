/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import Select from './select';

export type TableColumn = {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => React.ReactNode;
  sortable?: boolean;
};

type TableProps = {
  columns: TableColumn[];
  data: Record<string, any>[];
  title?: string;
  page?: number;
  pageSize?: number;
  totalItems?: number;
  showPagination?: boolean;
  className?: string;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onRowClick?: (row: Record<string, any>) => void;
};

function DeepAccess(obj: Record<string, any>, path: string): any {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

export default function Table({
  columns = [],
  data = [],
  title,
  page = 1,
  pageSize = 10,
  totalItems,
  showPagination = true,
  className = '',
  isLoading = false,
  onPageChange = undefined,
  onPageSizeChange = undefined,
  onRowClick = undefined,
}: TableProps): React.ReactNode {
  const [currentPage, setCurrentPage] = useState(page);
  const [itemsPerPage, setItemsPerPage] = useState(pageSize);

  // Sync internal state with external props
  useEffect(() => {
    setCurrentPage(page);
  }, [page]);

  useEffect(() => {
    setItemsPerPage(pageSize);
  }, [pageSize]);

  const paginatedData = useMemo(() => {
    return data;
  }, [data]);

  // Calculate total pages based on totalItems (if provided) or data length
  const totalPages = useMemo(() => {
    if (totalItems !== undefined) {
      return Math.ceil(totalItems / itemsPerPage);
    }
    return Math.ceil(data.length / itemsPerPage);
  }, [data.length, itemsPerPage, totalItems]);

  const totalEntries = totalItems !== undefined ? totalItems : data.length;

  const handlePageChange = (newPage: number) => {
    const validPage = Math.max(1, Math.min(newPage, totalPages));
    setCurrentPage(validPage);
    onPageChange?.(validPage);
  };

  const handleItemsPerPageChange = (value: string | number) => {
    const newPageSize = Number(value);
    setItemsPerPage(newPageSize);
    onPageSizeChange?.(newPageSize);

    // Calculate new current page to ensure it's valid with the new page size
    const newTotalPages = Math.ceil(totalEntries / newPageSize);
    const newCurrentPage = Math.min(currentPage, newTotalPages);
    setCurrentPage(newCurrentPage);
    onPageChange?.(newCurrentPage);
  };

  const renderSkeletonRows = () => {
    return Array.from({ length: itemsPerPage }, (_, index) => (
      <tr key={`skeleton-${index}`}>
        {columns.map((column) => (
          <td key={column.key} className="px-6 py-4">
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
          </td>
        ))}
      </tr>
    ));
  };

  const pageSizeOptions = [
    { value: '5', label: '5' },
    { value: '10', label: '10' },
    { value: '20', label: '20' },
    { value: '50', label: '50' },
  ];

  const getVisiblePages = () => {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  return (
    <div className={`shadow-xl border-0 overflow-hidden p-0 backdrop-blur-sm bg-surface rounded-lg ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 pointer-events-none" />

      {title && (
        <div className="pb-6 relative z-10 p-6">
          <h2 className="text-2xl font-bold tracking-tight text-surface-primary">
            {title}
          </h2>
        </div>
      )}

      <div className="p-0 relative z-10">
        <div>
          <table className="w-full">
            <thead>
              <tr className="hover:bg-transparent border-b border-muted">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`font-semibold text-xs tracking-widest text-surface-muted h-14 px-6 uppercase border-0 backdrop-blur-sm ${
                      column.align ? `text-${column.align}` : 'text-left'
                    }`}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                renderSkeletonRows()
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="h-32 text-center text-surface-secondary font-medium text-base"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 via-blue-400 to-purple-400 opacity-60" />
                      </div>
                      <span>No data available</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="group hover:bg-gradient-to-r hover:from-cyan-500/5 hover:via-blue-500/5 hover:to-purple-500/5 transition-all duration-300 border-b border-muted last:border-b-0 cursor-pointer"
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-6 py-5 text-sm font-medium text-surface-primary leading-6 transition-colors group-hover:text-foreground ${
                          column.align ? `text-${column.align}` : 'text-left'
                        }`}
                      >
                        {column.render
                          ? column.render(DeepAccess(row, column.key), row)
                          : DeepAccess(row, column.key)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showPagination && (data.length > 0 || isLoading) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 px-4 sm:px-6 py-6 border-t border-muted relative z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 backdrop-blur-sm" />

          <div className="flex items-center justify-center sm:justify-start space-x-3 text-sm font-medium text-surface-secondary relative z-10">
            <span className="whitespace-nowrap">Show</span>
            <Select
              value={itemsPerPage.toString()}
              onChange={handleItemsPerPageChange}
              items={pageSizeOptions}
              className="w-20"
            />
            <span className="whitespace-nowrap">of {isLoading ? '...' : totalEntries} entries</span>
          </div>

          <div className="flex items-center justify-center space-x-2 relative z-10">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1 || isLoading}
              className="px-4 py-2 text-sm font-medium text-foreground bg-surface border border-surface rounded-lg hover:bg-primary hover:text-primary hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className="px-4 py-2 text-sm font-medium text-foreground bg-surface border border-surface rounded-lg hover:bg-primary hover:text-primary hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {getVisiblePages().map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  pageNum === currentPage
                    ? 'text-primary bg-primary border border-primary shadow-md'
                    : 'text-foreground bg-surface border border-surface hover:bg-primary hover:text-primary hover:border-primary'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading || totalPages === 0}
              className="px-4 py-2 text-sm font-medium text-foreground bg-surface border border-surface rounded-lg hover:bg-primary hover:text-primary hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages || isLoading || totalPages === 0}
              className="px-4 py-2 text-sm font-medium text-foreground bg-surface border border-surface rounded-lg hover:bg-primary hover:text-primary hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
