/* eslint-disable react-hooks/exhaustive-deps */
import Card from '@/components/card';
import Table, { type TableColumn } from '@/components/table';
import { useQuery } from '@/hooks/query';
import MachineService from '@/services/machine';
import type { MachineState } from '@/types';
import { Activity } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export default function AdminDashboard() {
  const {
    data,
    query,
    refetch,
    isLoading: loading,
  } = useQuery({
    callback: async () => await MachineService.getMachineState(),
  });

  const {
    data: processes,
    query: queryProcesses,
    refetch: refetchProcesses,
    isLoading: isLoadingProcesses,
    isPending: isPendingProcess,
  } = useQuery({
    callback: async () => await MachineService.getMachineProcesses(),
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    if (!data) query();
    if (!processes) queryProcesses();
    setInterval(() => {
      refetch();
    }, 5_000);
    setInterval(() => {
      if (!isPendingProcess) refetchProcesses();
    }, 10_000);
  }, []);

  const machineData = data as MachineState;

  const formatBytes = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(0)} MB`;
  };

  const formatUptime = (uptime: string) => {
    return uptime.replace(/(\d+)h(\d+)m(\d+)s/, '$1h $2m');
  };

  // Parse process data into table format
  const parseProcessData = (processes: string[]) => {
    if (!processes || processes.length === 0) return [];

    return processes.map((process, index) => {
      // Split process string by pipe symbol '|'
      const parts = process
        .trim()
        .split('|')
        .map((part) => part.trim());

      // Extract values from each part
      const pid = parts[0]?.replace('PID:', '').trim() || 'N/A';
      const name = parts[1]?.replace('Name:', '').trim() || 'N/A';
      const cpu = parts[2]?.replace('CPU:', '').trim() || 'N/A';
      const rss = parts[3]?.replace('RSS:', '').trim() || 'N/A';

      return {
        id: index + 1,
        pid,
        name,
        cpu,
        rss,
        fullProcess: process,
      };
    });
  };

  const processColumns: TableColumn[] = [
    {
      key: 'pid',
      label: 'PID',
      align: 'left',
      sortable: true,
    },
    {
      key: 'name',
      label: 'Process Name',
      align: 'left',
      sortable: true,
    },
    {
      key: 'cpu',
      label: 'CPU Usage',
      align: 'center',
      sortable: true,
    },
    {
      key: 'rss',
      label: 'Memory (RSS)',
      align: 'center',
      sortable: true,
    },
  ];

  const processTableData = parseProcessData((processes as string[]) || []);

  // Use useMemo to slice the data for pagination
  const paginatedProcessData = useMemo(() => {
    // Sort by memory usage (RSS) from highest to lowest
    const sortedData = [...processTableData].sort((a, b) => {
      // Extract numeric value from RSS string (remove 'MB', 'KB', etc.)
      const aMemory = parseFloat(a.rss.replace(/[^\d.]/g, '')) || 0;
      const bMemory = parseFloat(b.rss.replace(/[^\d.]/g, '')) || 0;
      return bMemory - aMemory; // Descending order (highest to lowest)
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedData.slice(startIndex, endIndex);
  }, [processTableData, currentPage, itemsPerPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">System Dashboard</h1>
          <p className="text-muted-foreground">Real-time system monitoring and analytics</p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Hostname
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">{machineData?.hostname}</p>
              </div>
              <div className="p-3 rounded-full bg-primary text-primary">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  CPU Cores
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">{machineData?.cpus}</p>
              </div>
              <div className="p-3 rounded-full bg-success text-success">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Uptime
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {machineData?.uptime && formatUptime(machineData.uptime)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-warning text-warning">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Memory Usage
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {machineData?.memoryUsage?.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 rounded-full bg-primary text-primary">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                  />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Detailed Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* System Information */}
          <Card className="p-8 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="p-2 rounded-lg bg-primary text-primary mr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground">System Information</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-muted">
                <span className="text-muted-foreground font-medium">Operating System</span>
                <span className="font-semibold text-foreground bg-muted px-3 py-1 rounded-full text-sm">
                  {machineData?.platform}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-muted">
                <span className="text-muted-foreground font-medium">Platform Family</span>
                <span className="font-semibold text-foreground bg-muted px-3 py-1 rounded-full text-sm">
                  {machineData?.platformFamily}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-muted">
                <span className="text-muted-foreground font-medium">Platform Version</span>
                <span className="font-semibold text-foreground bg-muted px-3 py-1 rounded-full text-sm">
                  {machineData?.platformVersion}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-muted">
                <span className="text-muted-foreground font-medium">Kernel Version</span>
                <span className="font-semibold text-foreground bg-muted px-3 py-1 rounded-full text-sm">
                  {machineData?.kernelVersion}
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-muted-foreground font-medium">Architecture</span>
                <span className="font-semibold text-foreground bg-muted px-3 py-1 rounded-full text-sm">
                  {machineData?.kernelArch}
                </span>
              </div>
            </div>
          </Card>

          {/* Memory Information */}
          <Card className="p-8 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="p-2 rounded-lg bg-primary text-primary mr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground">Memory Information</h2>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-muted-foreground font-medium">Memory Usage</span>
                  <span className="font-bold text-2xl text-foreground">
                    {machineData?.memoryUsage?.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 rounded-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${machineData?.memoryUsage || 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-muted rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Total Memory</span>
                    <span className="font-bold text-foreground text-lg">
                      {machineData?.totalMemory && formatBytes(machineData.totalMemory)}
                    </span>
                  </div>
                </div>
                <div className="bg-muted rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Used Memory</span>
                    <span className="font-bold text-foreground text-lg">
                      {machineData?.usedMemory && formatBytes(machineData.usedMemory)}
                    </span>
                  </div>
                </div>
                <div className="bg-muted rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Available Memory</span>
                    <span className="font-bold text-foreground text-lg">
                      {machineData?.availableMemory && formatBytes(machineData.availableMemory)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Process Information Table */}
        <div className="mb-8">
          <Card className="p-8 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="p-2 rounded-lg bg-primary text-primary mr-3">
                <Activity className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Running Processes</h2>
            </div>
            <Table
              columns={processColumns}
              data={paginatedProcessData}
              page={currentPage}
              isLoading={isLoadingProcesses}
              showPagination={true}
              pageSize={itemsPerPage}
              totalItems={processTableData.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={setItemsPerPage}
              className="bg-surface"
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
