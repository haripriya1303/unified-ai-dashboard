import { useLocation } from 'react-router-dom';
import { AppSidebar } from '@/components/shared/AppSidebar';
import { ContextPanel } from '@/components/shared/ContextPanel';
import { CommandPalette } from '@/components/shared/CommandPalette';

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/search': 'Search',
  '/assistant': 'AI Assistant',
  '/activity': 'Activity',
  '/integrations': 'Integrations',
  '/settings': 'Settings',
};

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const title = ROUTE_TITLES[location.pathname] || 'Workspace';

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground font-sans antialiased">
      <AppSidebar />

      <main className="flex-1 overflow-y-auto scrollbar-thin relative">
        <header className="sticky top-0 z-10 h-14 border-b border-border/40 bg-background/80 backdrop-blur-md px-8 flex items-center">
          <h1 className="text-sm font-semibold text-foreground">{title}</h1>
        </header>
        <div className="max-w-5xl mx-auto p-8">
          {children}
        </div>
      </main>

      <ContextPanel />
      <CommandPalette />
    </div>
  );
};
