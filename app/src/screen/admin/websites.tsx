/* eslint-disable react-hooks/exhaustive-deps */
import Button from '@/components/button';
import { useDialogController } from '@/components/dialog';
import Input from '@/components/input';
import PageHeader from '@/components/page-header';
import Pagination from '@/components/pagination';
import type { SelectItem } from '@/components/select';
import Select from '@/components/select';
import WebsiteCard from '@/components/website-card';
import { useMutate, useQuery } from '@/hooks/query';
import WebsiteModal, { type WebsiteModalData } from '@/modal/website.modal';
import WebsiteService from '@/services/websites';
import type { Website } from '@/types';
import { extractError } from '@/util/error';
import { Globe, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

const WebsiteCardSkeleton = () => (
  <div className="bg-surface rounded-lg border border-muted p-4 sm:p-6 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <div className="h-5 sm:h-6 bg-muted rounded w-3/4 mb-2"></div>
        <div className="h-3 sm:h-4 bg-muted rounded w-1/2"></div>
      </div>
      <div className="h-5 sm:h-6 w-12 sm:w-16 bg-muted rounded"></div>
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-3 sm:h-4 bg-muted rounded w-full"></div>
      <div className="h-3 sm:h-4 bg-muted rounded w-2/3"></div>
    </div>
    <div className="flex gap-2">
      <div className="h-7 sm:h-8 w-12 sm:w-16 bg-muted rounded"></div>
      <div className="h-7 sm:h-8 w-12 sm:w-16 bg-muted rounded"></div>
      <div className="h-7 sm:h-8 w-16 sm:w-20 bg-muted rounded"></div>
    </div>
  </div>
);

export default function AdminWebsites() {
  const [itemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const websiteModalController = useDialogController<WebsiteModalData>();

  const {
    data,
    query,
    isLoading: loading,
    refetch,
  } = useQuery({
    callback: async () => await WebsiteService.getAdminWebsites(),
    onFail: (error) => {
      console.error('Failed to fetch websites:', error);
      toast.error(extractError(error));
    },
  });

  const { mutate: updateStatus } = useMutate({
    callback: async ({ siteName, action }: { siteName: string; action: string }) =>
      await WebsiteService.updateWebsiteStatus(siteName, action),
    onSuccess: () => {
      refetch();
      toast.success('Website status updated successfully!');
    },
    onFail: (error) => {
      console.error('Failed to update website status:', error);
      toast.error(extractError(error));
    },
  });

  const { mutate: deleteWebsite } = useMutate({
    callback: async (name: string) => await WebsiteService.deleteWebsite(name),
    onSuccess: () => {
      refetch();
      toast.success('Website deleted successfully!');
    },
    onFail: (error) => {
      console.error('Failed to delete website:', error);
      toast.error(extractError(error));
    },
  });

  const filters = useMemo<SelectItem[]>(
    () => [
      {
        label: 'All',
        value: 'all',
      },
      {
        label: 'Started',
        value: 'Started',
      },
      {
        label: 'Stopped',
        value: 'Stopped',
      },
    ],
    []
  );

  // Filter data based on selected filter and search query
  const filteredData = useMemo(() => {
    let filtered = data ?? [];

    // Filter by status
    if (selectedFilter !== 'all') {
      filtered = filtered.filter((website) => website.state === selectedFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((website) =>
        website.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [data, selectedFilter, searchQuery]);

  // Calculate pagination
  const totalItems = filteredData.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  useEffect(() => {
    const q = async () => await query();
    q();
  }, []);

  // Reset to first page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter, searchQuery]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (value: string | number) => {
    setSelectedFilter(String(value));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleStart = async (website: Website) => {
    console.log('Starting website:', website.name);
    await updateStatus({ siteName: website.name, action: 'Start' });
  };

  const handleStop = async (website: Website) => {
    console.log('Stopping website:', website.name);
    await updateStatus({ siteName: website.name, action: 'Stop' });
  };

  const handleRestart = async (website: Website) => {
    console.log('Restarting website:', website.name);
    await updateStatus({ siteName: website.name, action: 'Restart' });
  };

  const handleDelete = async (website: Website) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${website.name}"? This action cannot be undone.`
      )
    ) {
      console.log('Deleting website:', website.name);
      await deleteWebsite(website.name);
    }
  };

  const handleCreateWebsite = () => {
    websiteModalController.onOpen({ mode: 'create' });
  };

  const handleEditWebsite = (data: Website) => {
    websiteModalController.onOpen({ mode: 'edit', website: data });
  };

  const handleWebsiteSubmit = async () => {
    refetch();
  };

  return (
    <section className="p-4 sm:p-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Website Management"
          description="Manage your IIS websites with style"
          breadcrumbs={[]}
        />

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <label className="text-background font-medium text-sm sm:text-base">
              Filter by status:
            </label>
            <Select
              items={filters}
              value={selectedFilter}
              onChange={handleFilterChange}
              placeholder="Select status"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <label className="text-background font-medium text-sm sm:text-base whitespace-nowrap">
                Search:
              </label>
              <Input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search by website name..."
                className="w-full sm:w-48 md:w-64"
              />
            </div>
            <Button onClick={handleCreateWebsite} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Create Website</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <WebsiteCardSkeleton key={index} />
            ))}
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-8 sm:py-12 px-4">
            <Globe className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 opacity-50 text-background" />
            <h3 className="text-lg sm:text-xl font-semibold text-background mb-2">
              {searchQuery.trim()
                ? `No websites found matching "${searchQuery}"`
                : selectedFilter === 'all'
                  ? 'No websites found'
                  : `No ${selectedFilter.toLowerCase()} websites found`}
            </h3>
            <p className="text-sm sm:text-base text-background opacity-70 mb-4 max-w-md mx-auto">
              {searchQuery.trim()
                ? 'Try adjusting your search terms or filters'
                : selectedFilter === 'all'
                  ? 'Create your first website to get started'
                  : 'Try changing the filter or create a new website'}
            </p>
            <Button onClick={handleCreateWebsite} size="lg" className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Create Website
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {paginatedData.map((website) => (
              <WebsiteCard
                key={website.id}
                website={website}
                onStart={handleStart}
                onStop={handleStop}
                onRestart={handleRestart}
                onDelete={handleDelete}
                onClick={handleEditWebsite}
              />
            ))}
          </div>
        )}

        {!loading && filteredData.length > 0 && (
          <div className="mt-6 sm:mt-8">
            <Pagination
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      <WebsiteModal controller={websiteModalController} onSubmit={handleWebsiteSubmit} />
    </section>
  );
}
