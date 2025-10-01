import LoginView from '@/screen/auth/login.view';
import type { Route } from '@/types';
import ADMIN from './admin';

const ROUTES: Route[] = [
  {
    key: 'root',
    title: 'root',
    path: '/',
    component: <LoginView />,
  },
  ...ADMIN,
];

export default ROUTES;
