import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { ChevronDown, Loader2 } from 'lucide-react';

interface ConnectMicrosoftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (data: MicrosoftConnectionData) => Promise<void>;
  loading?: boolean;
}

export interface MicrosoftConnectionData {
  apps: { teams: boolean; outlookEmail: boolean; outlookCalendar: boolean };
  email: string;
  domain: string;
  connectionString: string;
  tenantId: string;
  clientId: string;
  clientSecret: string;
}

const ConnectMicrosoftModal = ({ open, onOpenChange, onConnect, loading }: ConnectMicrosoftModalProps) => {
  const [apps, setApps] = useState({ teams: true, outlookEmail: true, outlookCalendar: false });
  const [email, setEmail] = useState('');
  const [domain, setDomain] = useState('');
  const [connectionString, setConnectionString] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const handleSubmit = () => {
    onConnect({ apps, email, domain, connectionString, tenantId, clientId, clientSecret });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border/50 surface-glow">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground">Connect Microsoft Workspace</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Sync your emails, meetings, and conversations to your workspace dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2 max-h-[60vh] overflow-y-auto scrollbar-thin pr-1">
          {/* Apps to Sync */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Choose Apps to Sync</h4>
            <div className="space-y-2.5">
              {([
                ['teams', 'Connect Microsoft Teams messages'],
                ['outlookEmail', 'Connect Outlook emails'],
                ['outlookCalendar', 'Sync Outlook calendar events'],
              ] as const).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2.5">
                  <Checkbox
                    id={key}
                    checked={apps[key]}
                    onCheckedChange={(v) => setApps(prev => ({ ...prev, [key]: !!v }))}
                  />
                  <Label htmlFor={key} className="text-sm text-foreground cursor-pointer">{label}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Microsoft Account */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Microsoft Account</h4>
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
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Organization Permissions</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We need permission to read messages and calendar events so AI can generate summaries for your workspace.
            </p>
          </div>

          {/* Advanced */}
          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleTrigger className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${advancedOpen ? 'rotate-0' : '-rotate-90'}`} />
              Advanced Setup
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-2.5">
              <Input placeholder="Connection string" value={connectionString} onChange={e => setConnectionString(e.target.value)} className="bg-background/50 text-xs" />
              <Input placeholder="Tenant ID" value={tenantId} onChange={e => setTenantId(e.target.value)} className="bg-background/50 text-xs" />
              <Input placeholder="Client ID" value={clientId} onChange={e => setClientId(e.target.value)} className="bg-background/50 text-xs" />
              <Input placeholder="Client Secret" type="password" value={clientSecret} onChange={e => setClientSecret(e.target.value)} className="bg-background/50 text-xs" />
              <p className="text-[11px] text-muted-foreground">Enter Microsoft integration credentials (optional advanced setup)</p>
            </CollapsibleContent>
          </Collapsible>
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

export default ConnectMicrosoftModal;
