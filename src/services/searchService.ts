import api from './api';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  source: string;
  sourceIcon: string;
  url: string;
  type: 'task' | 'message' | 'document' | 'integration';
}

export const searchService = {
  search: async (q: string): Promise<SearchResult[]> => {
    try {
      const { data } = await api.get(`/search?q=${encodeURIComponent(q)}`);
      return data;
    } catch {
      /*
      TEMP MOCK DATA
      REMOVE WHEN FASTAPI BACKEND IS READY
      */
      if (!q) return [];
      return [
        { id: '1', title: 'Q3 API Documentation', description: 'Review pending changes', source: 'Notion', sourceIcon: 'notebook', url: '#', type: 'document' },
        { id: '2', title: 'Auth flow hydration fix', description: 'Bug fix in progress', source: 'GitHub', sourceIcon: 'github', url: '#', type: 'task' },
      ];
    }
  },
};
