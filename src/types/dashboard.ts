export interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string;
  dueDate?: string;
}

export interface Message {
  id: string;
  sender: string;
  avatar?: string;
  content: string;
  source: 'slack' | 'email' | 'github';
  timestamp: string;
  unread: boolean;
}

export interface WorkspaceActivity {
  id: string;
  type: 'commit' | 'pr' | 'comment' | 'deploy' | 'message';
  title: string;
  description: string;
  source: string;
  timestamp: string;
  actor: string;
}

export interface ConnectedApp {
  id: string;
  name: string;
  icon: string;
  status: 'connected' | 'disconnected' | 'syncing';
  lastSync?: string;
}

export interface DashboardData {
  tasks: Task[];
  messages: Message[];
  workspace_activity: WorkspaceActivity[];
  ai_summary: string;
  connected_apps: ConnectedApp[];
}
