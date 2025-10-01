import AdminDashboard from '@/screen/admin/dashboard';
import AdminWebsites from '@/screen/admin/websites';
import type { Route } from '@/types';
import { LucideLayoutDashboard, LucideServer } from 'lucide-react';

const ADMIN: Route[] = [
  {
    key: 'dashboard',
    title: 'Dashboard',
    path: '/admin/dashboard',
    component: <AdminDashboard />,
    sidebar: true,
    layout: 'sidebar',
    icon: <LucideLayoutDashboard />,
  },
  {
    key: 'websites',
    title: 'Websites',
    path: '/admin/websites',
    component: <AdminWebsites />,
    sidebar: true,
    layout: 'sidebar',
    icon: <LucideServer />,
  },
];

export default ADMIN;
