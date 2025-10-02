import type { DirFile } from '@/types';
import api from './api';

const FileService = new (class {
  async getDirectoryContent(site: string): Promise<DirFile[]> {
    return await api.get(`dir/${site}`).then((x) => x.data);
  }
  async getDirectoryTreeContent(site: string, tree: string): Promise<DirFile[]> {
    return await api
      .get(`dirtree/${site}`, {
        params: {
          tree: tree,
        },
      })
      .then((x) => x.data);
  }
})();

export default FileService;
