import AdminWebsiteInfoView from '@/screen/admin/[website]';
import AdminDashboard from '@/screen/admin/dashboard';
import AdminWebsites from '@/screen/admin/websites';
import type { Route } from '@/types';
import { LucideGlobe, LucideLayoutDashboard, LucideServer } from 'lucide-react';
import { KEY } from './navigation';

const ADMIN: Route[] = [
  {
    key: 'dashboard',
    title: 'Dashboard',
    path: KEY.Dashboard.key,
    component: <AdminDashboard />,
    sidebar: true,
    layout: 'sidebar',
    icon: <LucideLayoutDashboard />,
  },
  {
    key: 'websites',
    title: 'Websites',
    path: KEY.Websites.key,
    component: <AdminWebsites />,
    sidebar: true,
    layout: 'sidebar',
    icon: <LucideServer />,
  },
  {
    key: 'view website',
    title: 'View Website',
    path: KEY.ViewWebsite.key,
    component: <AdminWebsiteInfoView />,
    sidebar: false,
    layout: 'sidebar',
    icon: <LucideGlobe />,
  },
];

export default ADMIN;
