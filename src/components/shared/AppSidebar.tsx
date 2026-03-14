import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Search,
  Bot,
  Activity,
  Puzzle,
  Settings,
  Command,
  LogOut,
  ChevronDown,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Search', icon: Search, to: '/search' },
  { label: 'AI Assistant', icon: Bot, to: '/assistant' },
  { label: 'Activity', icon: Activity, to: '/activity' },
  { label: 'Integrations', icon: Puzzle, to: '/integrations' },
  { label: 'Settings', icon: Settings, to: '/settings' },
];

export const AppSidebar = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="flex h-full w-60 flex-shrink-0 flex-col border-r border-border/50 bg-card/30">
      {/* Workspace Switcher */}
      <div className="flex h-14 items-center gap-2 border-b border-border/40 px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
          W
        </div>
        <div className="flex flex-1 items-center gap-1">
          <span className="text-sm font-semibold text-foreground">Workspace</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-150 ${
                isActive
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}

        {/* Command Palette Shortcut */}
        <button
          onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
          className="mt-4 flex w-full items-center gap-3 rounded-md border border-border/50 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
        >
          <Command className="h-4 w-4" />
          <span>Command</span>
          <kbd className="ml-auto rounded border border-border/50 bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </button>
      </nav>

      {/* User Section */}
      <div className="border-t border-border/40 p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
            {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{user?.name || 'User'}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <button onClick={logout} className="text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
