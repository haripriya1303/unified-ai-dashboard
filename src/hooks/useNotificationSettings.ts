import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export interface NotificationSettings {
  workspaceNotifications: boolean;
  emailAlerts: boolean;
  integrationActivityAlerts: boolean;
  aiDailySummary: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  workspaceNotifications: true,
  emailAlerts: true,
  integrationActivityAlerts: true,
  aiDailySummary: false,
};

export const useNotificationSettings = () => {
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem('notification_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const updateSetting = useCallback((key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      localStorage.setItem('notification_settings', JSON.stringify(next));
      // TODO: Replace with FastAPI endpoint POST /api/settings/notifications
      toast({ title: 'Notification preference updated' });
      return next;
    });
  }, []);

  return { settings, updateSetting };
};
