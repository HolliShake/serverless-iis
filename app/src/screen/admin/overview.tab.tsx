/* eslint-disable react-hooks/exhaustive-deps */
import Button from '@/components/button';
import Card from '@/components/card';
import { useDialogController } from '@/components/dialog';
import Input from '@/components/input';
import { useMutate, useQuery } from '@/hooks/query';
import WebsiteModal, { type WebsiteModalData } from '@/modal/website.modal';
import WebsiteService from '@/services/websites';
import { extractError } from '@/util/error';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';

export default function OverviewTab() {
  const { website } = useParams();

  const websiteModalController = useDialogController<WebsiteModalData>();

  const {
    data: websiteInfo,
    query,
    refetch,
    isLoading,
  } = useQuery({
    callback: async () => await WebsiteService.getWebsite(website!),
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

  useEffect(() => {
    const q = async () => await query();
    q();
  }, []);

  const handleStart = async () => {
    if (websiteInfo) {
      console.log('Starting website:', websiteInfo.name);
      await updateStatus({ siteName: websiteInfo.name, action: 'Start' });
    }
  };

  const handleStop = async () => {
    if (websiteInfo) {
      console.log('Stopping website:', websiteInfo.name);
      await updateStatus({ siteName: websiteInfo.name, action: 'Stop' });
    }
  };

  const handleRestart = async () => {
    if (websiteInfo) {
      console.log('Restarting website:', websiteInfo.name);
      await updateStatus({ siteName: websiteInfo.name, action: 'Restart' });
    }
  };

  const handleEditWebsite = () => {
    if (websiteInfo) {
      websiteModalController.onOpen({ mode: 'edit', website: websiteInfo });
    }
  };

  const handleWebsiteSubmit = async () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Status Banner Skeleton */}
        <Card className="bg-gray-50 border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded animate-pulse w-32"></div>
          </div>
        </Card>

        {/* Main Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Settings Skeleton */}
            <Card>
              <div className="pb-4 border-b border-muted">
                <div className="h-6 bg-gray-300 rounded animate-pulse w-20"></div>
              </div>
              <div className="pt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="h-4 bg-gray-300 rounded animate-pulse w-24 mb-1"></div>
                    <div className="h-10 bg-gray-200 rounded border border-muted animate-pulse"></div>
                  </div>
                  <div>
                    <div className="h-4 bg-gray-300 rounded animate-pulse w-16 mb-1"></div>
                    <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20"></div>
                  </div>
                </div>
                <div>
                  <div className="h-4 bg-gray-300 rounded animate-pulse w-24 mb-1"></div>
                  <div className="h-10 bg-gray-200 rounded border border-muted animate-pulse"></div>
                </div>
              </div>
            </Card>

            {/* Bindings Skeleton */}
            <Card>
              <div className="pb-4 border-b border-muted">
                <div className="h-6 bg-gray-300 rounded animate-pulse w-20"></div>
              </div>
              <div className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <div className="h-4 bg-gray-300 rounded animate-pulse w-16 mb-1"></div>
                    <div className="h-10 bg-gray-200 rounded border border-muted animate-pulse"></div>
                  </div>
                  <div>
                    <div className="h-4 bg-gray-300 rounded animate-pulse w-20 mb-1"></div>
                    <div className="h-10 bg-gray-200 rounded border border-muted animate-pulse"></div>
                  </div>
                  <div>
                    <div className="h-4 bg-gray-300 rounded animate-pulse w-12 mb-1"></div>
                    <div className="h-10 bg-gray-200 rounded border border-muted animate-pulse"></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Actions Skeleton */}
          <div className="space-y-6">
            {/* Quick Actions Skeleton */}
            <Card>
              <div className="pb-4 border-b border-muted">
                <div className="h-6 bg-gray-300 rounded animate-pulse w-16"></div>
              </div>
              <div className="pt-6 space-y-3">
                <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {/* Status Banner */}
        <Card
          className={`${
            websiteInfo?.state === 'Started'
              ? 'bg-green-50 border-green-200'
              : 'bg-yellow-50 border-yellow-200'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`w-2 h-2 rounded-full ${
                websiteInfo?.state === 'Started' ? 'bg-green-500' : 'bg-yellow-500'
              }`}
            ></div>
            <span
              className={`font-medium ${
                websiteInfo?.state === 'Started' ? 'text-green-700' : 'text-yellow-700'
              }`}
            >
              {websiteInfo?.state === 'Started' ? 'Website is running' : 'Website is stopped'}
            </span>
          </div>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Settings */}
            <Card>
              <div className="pb-4 border-b border-muted">
                <h3 className="text-lg font-semibold text-surface-primary">General</h3>
              </div>
              <div className="pt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-secondary mb-1">
                      Website Name
                    </label>
                    <Input value={websiteInfo?.name || ''} disabled className="font-mono" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-secondary mb-1">
                      Status
                    </label>
                    <div
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        websiteInfo?.state === 'Started'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {websiteInfo?.state}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-secondary mb-1">
                    Physical Path
                  </label>
                  <Input value={websiteInfo?.physicalPath || ''} disabled className="font-mono" />
                </div>
              </div>
            </Card>

            {/* Bindings */}
            <Card>
              <div className="pb-4 border-b border-muted">
                <h3 className="text-lg font-semibold text-surface-primary">Bindings</h3>
              </div>
              <div className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-secondary mb-1">
                      Protocol
                    </label>
                    <Input
                      value={websiteInfo?.bindings.protocol || ''}
                      disabled
                      className="font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-secondary mb-1">
                      Host/Domain
                    </label>
                    <Input
                      value={websiteInfo?.bindings.host || '*'}
                      disabled
                      className="font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-secondary mb-1">
                      Port
                    </label>
                    <Input
                      value={websiteInfo?.bindings.port?.toString() || ''}
                      disabled
                      className="font-mono"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <div className="pb-4 border-b border-muted">
                <h3 className="text-lg font-semibold text-surface-primary">Actions</h3>
              </div>
              <div className="pt-6 space-y-3">
                <Button
                  onClick={websiteInfo?.state === 'Started' ? handleStop : handleStart}
                  variant={websiteInfo?.state === 'Started' ? 'error' : 'success'}
                  className="w-full"
                >
                  {websiteInfo?.state === 'Started' ? 'Stop Website' : 'Start Website'}
                </Button>
                <Button onClick={handleRestart} variant="warning" className="w-full">
                  Restart Website
                </Button>
                <Button onClick={handleEditWebsite} variant="default" className="w-full">
                  Edit Configuration
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <WebsiteModal controller={websiteModalController} onSubmit={handleWebsiteSubmit} />
    </>
  );
}
