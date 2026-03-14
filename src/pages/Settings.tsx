import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Sun, Moon, User, Shield, Bell, Loader2 } from 'lucide-react';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import ChangePasswordModal from '@/components/settings/ChangePasswordModal';
import { toast } from '@/hooks/use-toast';

const SettingsPage = () => {
  const { user, updateUserName } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { settings, updateSetting } = useNotificationSettings();
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const [name, setName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  const handleSaveProfile = async () => {
    if (!user || !name.trim()) return;
    setIsSaving(true);
    try {
      const { supabase } = await import('@/lib/supabase');

      // Update users table
      const { error } = await supabase
        .from('users')
        .update({ name: name.trim(), updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;

      // Also update auth metadata
      await supabase.auth.updateUser({ data: { name: name.trim() } });

      // Update local state so sidebar reflects immediately
      updateUserName(name.trim());

      toast({ title: 'Profile updated successfully' });
    } catch {
      toast({
        title: 'Unable to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const nameChanged = name.trim() !== (user?.name || '');

  const notificationToggles: { key: keyof typeof settings; label: string }[] = [
    { key: 'workspaceNotifications', label: 'Enable workspace notifications' },
    { key: 'emailAlerts', label: 'Enable email alerts' },
    { key: 'integrationActivityAlerts', label: 'Enable integration activity alerts' },
    { key: 'aiDailySummary', label: 'Enable AI daily summary' },
  ];

  const sections = [
    {
      title: 'User Profile',
      icon: User,
      content: (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="profile-name" className="text-xs text-muted-foreground">Name</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full md:max-w-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Email</label>
            <p className="text-sm text-foreground">{user?.email || '—'}</p>
          </div>
          {nameChanged && (
            <Button
              size="sm"
              className="text-xs h-7"
              onClick={handleSaveProfile}
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />}
              Save Changes
            </Button>
          )}
        </div>
      ),
    },
    {
      title: 'Theme',
      icon: theme === 'dark' ? Moon : Sun,
      content: (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground">Appearance</p>
            <p className="text-xs text-muted-foreground">Currently using {theme} mode</p>
          </div>
          <Button variant="outline" size="sm" onClick={toggleTheme} className="text-xs h-7">
            {theme === 'dark' ? <Sun className="h-3.5 w-3.5 mr-1.5" /> : <Moon className="h-3.5 w-3.5 mr-1.5" />}
            Switch to {theme === 'dark' ? 'light' : 'dark'}
          </Button>
        </div>
      ),
    },
    {
      title: 'Notifications',
      icon: Bell,
      content: (
        <div className="space-y-4">
          {notificationToggles.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <Label htmlFor={key} className="text-sm text-foreground cursor-pointer">{label}</Label>
              <Switch
                id={key}
                checked={settings[key]}
                onCheckedChange={(v) => updateSetting(key, v)}
              />
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Security',
      icon: Shield,
      content: (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground">Password</p>
            <p className="text-xs text-muted-foreground">Update your account password</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setPasswordModalOpen(true)} className="text-xs h-7">
            Change Password
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      {sections.map(section => (
        <div key={section.title} className="rounded-xl border border-border/50 bg-card/30 p-5 surface-glow">
          <div className="flex items-center gap-2 mb-4">
            <section.icon className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{section.title}</h3>
          </div>
          {section.content}
        </div>
      ))}

      <ChangePasswordModal open={passwordModalOpen} onOpenChange={setPasswordModalOpen} />
    </div>
  );
};

export default SettingsPage;