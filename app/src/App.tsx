import ROUTES from '@/routing';
import { createBrowserRouter, RouterProvider, type RouteObject } from 'react-router-dom';
import DefaultLayout from './layout/default';
import SidebarLayout from './layout/sidebar';
import type { Route } from './types';

const routes = createBrowserRouter(
  ROUTES.map((r: Route) => ({
    path: r.path,
    element:
      r.layout == 'sidebar' ? (
        <SidebarLayout>{r.component}</SidebarLayout>
      ) : (
        <DefaultLayout>{r.component}</DefaultLayout>
      ),
  })) as RouteObject[]
);

function App() {
  return <RouterProvider router={routes} />;
}

export default App;
