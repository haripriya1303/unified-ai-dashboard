import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export interface IntegrationFeature {
  key: string;
  label: string;
  defaultChecked?: boolean;
}

export interface IntegrationModalConfig {
  id: string;
  name: string;
  subtitle: string;
  features: IntegrationFeature[];
}

export interface ConnectionFormData {
  features: Record<string, boolean>;
  email: string;
  domain: string;
}

/*
TEMP MOCK DATA
REMOVE WHEN FASTAPI BACKEND IS READY
*/
export const INTEGRATION_CONFIGS: Record<string, IntegrationModalConfig> = {
  '1': {
    id: '1',
    name: 'Slack',
    subtitle: 'Sync conversations, updates, and events from Slack to your workspace dashboard.',
    features: [
      { key: 'channels', label: 'Sync channel messages', defaultChecked: true },
      { key: 'mentions', label: 'Sync mentions', defaultChecked: true },
      { key: 'threads', label: 'Sync thread replies', defaultChecked: false },
    ],
  },
  '2': {
    id: '2',
    name: 'GitHub',
    subtitle: 'Sync code activity and updates from GitHub to your workspace dashboard.',
    features: [
      { key: 'prs', label: 'Sync pull requests', defaultChecked: true },
      { key: 'issues', label: 'Sync issues', defaultChecked: true },
      { key: 'deployments', label: 'Sync deployments', defaultChecked: false },
    ],
  },
  '3': {
    id: '3',
    name: 'Notion',
    subtitle: 'Sync documentation and knowledge base updates to your workspace dashboard.',
    features: [
      { key: 'pages', label: 'Sync page updates', defaultChecked: true },
      { key: 'databases', label: 'Sync database changes', defaultChecked: true },
      { key: 'comments', label: 'Sync comments', defaultChecked: false },
    ],
  },
  '4': {
    id: '4',
    name: 'Jira',
    subtitle: 'Sync project tracking and issue updates to your workspace dashboard.',
    features: [
      { key: 'issues', label: 'Sync issues and stories', defaultChecked: true },
      { key: 'sprints', label: 'Sync sprint progress', defaultChecked: true },
      { key: 'boards', label: 'Sync board updates', defaultChecked: false },
    ],
  },
  '5': {
    id: '5',
    name: 'Google Workspace',
    subtitle: 'Sync email, calendar, and documents from Google to your workspace dashboard.',
    features: [
      { key: 'gmail', label: 'Sync Gmail messages', defaultChecked: true },
      { key: 'calendar', label: 'Sync Google Calendar events', defaultChecked: true },
      { key: 'drive', label: 'Sync Google Drive activity', defaultChecked: false },
    ],
  },
  '6': {
    id: '6',
    name: 'Microsoft Workspace',
    subtitle: 'Sync your emails, meetings, and conversations to your workspace dashboard.',
    features: [
      { key: 'teams', label: 'Connect Microsoft Teams messages', defaultChecked: true },
      { key: 'outlookEmail', label: 'Connect Outlook emails', defaultChecked: true },
      { key: 'outlookCalendar', label: 'Sync Outlook calendar events', defaultChecked: false },
    ],
  },
};

interface ConnectIntegrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (data: ConnectionFormData) => Promise<void>;
  loading?: boolean;
  integrationId: string | null;
}

const ConnectIntegrationModal = ({ open, onOpenChange, onConnect, loading, integrationId }: ConnectIntegrationModalProps) => {
  const config = integrationId ? INTEGRATION_CONFIGS[integrationId] : null;

  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [email, setEmail] = useState('');
  const [domain, setDomain] = useState('');

  useEffect(() => {
    if (config) {
      const defaults: Record<string, boolean> = {};
      config.features.forEach(f => { defaults[f.key] = f.defaultChecked ?? false; });
      setFeatures(defaults);
      setEmail('');
      setDomain('');
    }
  }, [integrationId, open]);

  if (!config) return null;

  const handleSubmit = () => {
    // TODO: Connect to backend API POST /api/integrations/connect
    onConnect({ features, email, domain });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border/50 surface-glow">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground">Connect {config.name}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {config.subtitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2 max-h-[60vh] overflow-y-auto scrollbar-thin pr-1">
          {/* Features to Sync */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Choose Apps to Sync</h4>
            <div className="space-y-2.5">
              {config.features.map(f => (
                <div key={f.key} className="flex items-center gap-2.5">
                  <Checkbox
                    id={`${integrationId}-${f.key}`}
                    checked={features[f.key] ?? false}
                    onCheckedChange={(v) => setFeatures(prev => ({ ...prev, [f.key]: !!v }))}
                  />
                  <Label htmlFor={`${integrationId}-${f.key}`} className="text-sm text-foreground cursor-pointer">{f.label}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Account */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Account</h4>
            <Input
              placeholder="yourname@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="bg-background/50"
            />
            <Input
              placeholder="Workspace domain (optional)"
              value={domain}
              onChange={e => setDomain(e.target.value)}
              className="bg-background/50"
            />
          </div>

          {/* Permissions */}
          <div className="rounded-lg bg-muted/30 border border-border/40 p-3.5">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Permissions</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We need permission to read activity from this app so AI can generate summaries for your workspace dashboard.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs">Cancel</Button>
          <Button size="sm" onClick={handleSubmit} disabled={loading} className="text-xs">
            {loading && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
            Connect Workspace
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectIntegrationModal;
