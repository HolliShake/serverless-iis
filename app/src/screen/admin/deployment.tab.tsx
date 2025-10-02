/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Button from '@/components/button';
import Card from '@/components/card';
import Table, { type TableColumn } from '@/components/table';
import FileService from '@/services/file';
import type { DirFile } from '@/types';
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

const DeploymentTab: React.FC = () => {
  const { website } = useParams();
  const [files, setFiles] = useState<DirFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [vTree, setVTree] = useState<DirFile[]>([]);

  const onRowClick = (row: DirFile) => {
    if (!row.isDir) return;
    setVTree((prev) => [...prev, row]);
    setFiles([]);
  };

  const loadDirectoryContent = async () => {
    if (!website) return;

    setLoading(true);
    setError(null);

    try {
      const directoryContent = await FileService.getDirectoryContent(website);
      setFiles(directoryContent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load directory content');
    } finally {
      setLoading(false);
    }
  };

  const loadDirectoryTreeContent = async (tree: string) => {
    if (!website) return;

    setLoading(true);
    setError(null);

    try {
      const directoryContent = await FileService.getDirectoryTreeContent(website, tree);
      setFiles(directoryContent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load directory content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vTree.length <= 0) {
      loadDirectoryContent();
    } else {
      const dir = vTree.map((d) => d.name).join('/');
      loadDirectoryTreeContent(dir);
    }
  }, [vTree]);

  useEffect(() => {
    if (website) {
      loadDirectoryContent();
    }
  }, [website]);

  const filteredFiles = useMemo(() => {
    if (!searchTerm) return files;
    return files.filter((file) => file.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [files, searchTerm]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const columns: TableColumn[] = [
    {
      key: 'name',
      label: 'Name',
      render: (value: string, row: DirFile) => (
        <div className="flex items-center space-x-2">
          <span className="text-sm">{row.isDir ? '📁' : '📄'}</span>
          <span className={`text-sm font-medium ${row.isDir ? 'text-primary' : 'text-foreground'}`}>
            {value}
          </span>
        </div>
      ),
    },
    {
      key: 'isDir',
      label: 'Type',
      render: (value: boolean) => (
        <span
          className={`inline-flex px-1.5 py-0.5 text-xs font-medium rounded ${
            value ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
          }`}
        >
          {value ? 'Directory' : 'File'}
        </span>
      ),
    },
    {
      key: 'size',
      label: 'Size',
      render: (value: number, row: DirFile) => (
        <span className="text-xs text-muted-foreground">
          {row.isDir ? '-' : formatFileSize(value)}
        </span>
      ),
    },
    {
      key: 'modTime',
      label: 'Modified',
      render: (value: string) => (
        <span className="text-xs text-muted-foreground">{new Date(value).toLocaleString()}</span>
      ),
    },
    {
      key: 'permission',
      label: 'Permissions',
      render: (value: string) => (
        <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-mono">
          {value}
        </code>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Deployment Files</h2>
            <p className="text-muted-foreground">Browse and manage files for {website}</p>
          </div>
          <Button onClick={loadDirectoryContent} disabled={!website || loading} size="md">
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Refreshing...</span>
              </div>
            ) : (
              'Refresh Directory'
            )}
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search files and directories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
          {searchTerm && (
            <p className="text-sm text-muted-foreground mt-2">
              Showing {filteredFiles.length} of {files.length} files
            </p>
          )}
        </div>

        {error && (
          <div className="bg-error/10 border border-error/20 rounded-md p-4 mb-6">
            <div className="flex items-center space-x-2">
              <span className="text-error">⚠️</span>
              <span className="text-error font-medium">Error: {error}</span>
            </div>
          </div>
        )}
        {vTree.length > 0 && (
          <div className="mb-4 p-3 bg-muted/50 rounded-md border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm">
                <button
                  onClick={() => setVTree(vTree.slice(0, -1))}
                  className="text-muted-foreground hover:text-foreground px-2 py-1 rounded border border-border hover:border-foreground/20 mr-2"
                  title="Go back"
                >
                  ←
                </button>
                <span className="text-muted-foreground">Path:</span>
                <button
                  onClick={() => setVTree([])}
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  {website}
                </button>
                {vTree.map((dir, index) => (
                  <React.Fragment key={index}>
                    <span className="text-muted-foreground">/</span>
                    <button
                      onClick={() => setVTree(vTree.slice(0, index + 1))}
                      className="text-primary hover:text-primary/80 font-medium"
                    >
                      {dir.name}
                    </button>
                  </React.Fragment>
                ))}
              </div>
              <button
                onClick={() => setVTree([])}
                className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded border border-border hover:border-foreground/20"
              >
                Clear
              </button>
            </div>
          </div>
        )}
        {filteredFiles.length > 0 || loading ? (
          <div>
            <Table
              columns={columns}
              data={filteredFiles}
              title="Directory Content"
              isLoading={loading}
              showPagination={false}
              onRowClick={onRowClick as any}
            />
          </div>
        ) : (
          !loading &&
          !error && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-6xl mb-4">📂</div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchTerm ? 'No matching files found' : 'No files found'}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? `No files match "${searchTerm}". Try a different search term.`
                  : 'The directory appears to be empty or inaccessible.'}
              </p>
            </div>
          )
        )}
      </Card>
    </div>
  );
};

export default DeploymentTab;
