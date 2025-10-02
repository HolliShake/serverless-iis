/* eslint-disable react-refresh/only-export-components */
import LoginView from '@/screen/auth/login.view';
import type { Route } from '@/types';
import ADMIN from './admin';

const ROUTES: Route[] = [
  {
    key: 'root',
    title: 'root',
    path: '/',
    component: <LoginView />,
    layout: 'default',
  },
  ...ADMIN,
];

export default ROUTES;
