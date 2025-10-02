/* eslint-disable react-hooks/exhaustive-deps */
import Card from '@/components/card';
import { useDialogController } from '@/components/dialog';
import PageHeader from '@/components/page-header';
import Tabs, { type TabItem } from '@/components/tab';
import { useQuery } from '@/hooks/query';
import WebsiteModal, { type WebsiteModalData } from '@/modal/website.modal';
import WebsiteService from '@/services/websites';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DeploymentTab from './deployment.tab';
import LogTab from './log.tab';
import OverviewTab from './overview.tab';

export default function AdminWebsiteInfoView() {
  const { website } = useParams();

  const websiteModalController = useDialogController<WebsiteModalData>();

  const {
    data: websiteInfo,
    query,
    refetch,
  } = useQuery({
    callback: async () => await WebsiteService.getWebsite(website!),
  });

  useEffect(() => {
    const q = async () => await query();
    q();
  }, []);

  const handleTabChange = (tabId: string) => {
    console.log(tabId);
  };

  const handleWebsiteSubmit = async () => {
    refetch();
  };

  const tabItems: TabItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      content: <OverviewTab />,
    },
    {
      id: 'logs',
      label: 'Logs',
      content: <LogTab />,
    },
    {
      id: 'deployment',
      label: 'Deployment',
      content: <DeploymentTab />,
    },
  ];

  return (
    <section className="p-4 sm:p-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title={websiteInfo?.name || 'Website'}
          description="Manage your IIS website configuration and status"
          breadcrumbs={[]}
        />

        {websiteInfo ? (
          <Tabs items={tabItems} defaultActiveTab="overview" onTabChange={handleTabChange} />
        ) : (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
              <p className="text-muted-foreground">Loading website information...</p>
            </div>
          </Card>
        )}
      </div>

      <WebsiteModal controller={websiteModalController} onSubmit={handleWebsiteSubmit} />
    </section>
  );
}
