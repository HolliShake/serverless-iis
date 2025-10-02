import type { RouteKeys } from '@/types';

export const KEY: RouteKeys = {
  Dashboard: {
    key: '/admin/dashboard',
    parse: function () {
      return '/admin/dashboard';
    },
  },
  Websites: {
    key: '/admin/websites',
  },
  ViewWebsite: {
    key: '/admin/websites/:website',
    parse: function (name: string) {
      return `/admin/websites/${name}`;
    },
  },
};
