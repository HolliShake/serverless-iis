/* eslint-disable react-hooks/exhaustive-deps */
import Card from '@/components/card';
import { useQuery } from '@/hooks/query';
import WebsiteService from '@/services/websites';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function LogTab() {
  const { website } = useParams();

  const { data: logsResponse, query: queryLogs } = useQuery({
    callback: async () => await WebsiteService.getLogs(website!),
  });

  useEffect(() => {
    queryLogs();
  }, []);

  // Parse the logs string into individual lines
  const logs = logsResponse?.logs
    ? logsResponse.logs.split('\r\n').filter((line: string) => line.trim())
    : null;

  return (
    <Card className="h-full">
      <div className="pb-4 border-b border-muted">
        <h3 className="text-lg font-semibold text-surface-primary">Website Logs</h3>
      </div>
      <div className="pt-6 h-full">
        {logs ? (
          <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            {logs.length > 0 ? (
              logs.map((log: string, index: number) => (
                <div key={index} className="mb-1 whitespace-pre-wrap">
                  {log}
                </div>
              ))
            ) : (
              <div className="text-gray-400">No logs available</div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-foreground"></div>
            <span className="ml-2 text-surface-secondary">Loading logs...</span>
          </div>
        )}
      </div>
    </Card>
  );
}
