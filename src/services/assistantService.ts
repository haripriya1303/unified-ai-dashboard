import api from './api';

export interface AssistantMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: { title: string; url: string }[];
  timestamp: string;
}

export const assistantService = {
  query: async (query: string): Promise<{ answer: string; sources: { title: string; url: string }[] }> => {
    try {
      const { data } = await api.post('/assistant/query', { query });
      return data;
    } catch {
      /*
      TEMP MOCK DATA
      REMOVE WHEN FASTAPI BACKEND IS READY
      */
      return {
        answer: `Based on your workspace data, here's what I found regarding "${query}":\n\nYou have 2 active tasks today. Your highest priority is reviewing the Q3 API documentation. Sarah Chen is waiting on your PR review. Consider checking the Slack thread about Q4 roadmap planning.`,
        sources: [
          { title: 'Slack — #engineering', url: '#' },
          { title: 'GitHub — PR #142', url: '#' },
        ],
      };
    }
  },
};
