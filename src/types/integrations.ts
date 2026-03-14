export interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'connected' | 'disconnected' | 'pending';
  category: 'communication' | 'development' | 'project-management' | 'productivity';
  lastSync?: string;
  eventsCount?: number;
}
