import type { Website } from '@/types';
import api from './api';

const WebsiteService = new (class {
  async getAdminWebsites(): Promise<Website[]> {
    return await api.get('website').then((x) => x.data);
  }

  async getWebsite(name: string): Promise<Website> {
    return await api.get(`website/${name}`).then((x) => x.data);
  }

  async createWebsite(website: Partial<Website>): Promise<Website> {
    return await api.post('website', website).then((x) => x.data);
  }

  async updateWebsite(original: string, website: Partial<Website>): Promise<Website> {
    return await api.put('website/' + original, website).then((x) => x.data);
  }

  async updateWebsiteStatus(siteName: string, action: string): Promise<void> {
    return await api.patch(`website/${siteName}/${action}`).then((x) => x.data);
  }

  async deleteWebsite(name: string): Promise<void> {
    return await api.delete(`website/${name}`).then((x) => x.data);
  }

  async getLogs(siteName: string): Promise<{ logs: string }> {
    return await api.get(`log/${siteName}`).then((x) => x.data);
  }
})();

export default WebsiteService;
