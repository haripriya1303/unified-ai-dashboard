import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import { LayoutDashboard, Search, Bot, Activity, Puzzle, Settings, Sun, Moon } from 'lucide-react';
import { useCommandK } from '@/hooks/useCommandK';

const COMMANDS = [
  { label: 'Go to Dashboard', icon: LayoutDashboard, action: '/dashboard' },
  { label: 'Open Search', icon: Search, action: '/search' },
  { label: 'Open Assistant', icon: Bot, action: '/assistant' },
  { label: 'View Activity', icon: Activity, action: '/activity' },
  { label: 'Open Integrations', icon: Puzzle, action: '/integrations' },
  { label: 'Open Settings', icon: Settings, action: '/settings' },
];

export const CommandPalette = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { isOpen, setIsOpen } = useCommandK(() => setIsOpen(true));

  const runAction = (action: string) => {
    setIsOpen(false);
    navigate(action);
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {COMMANDS.map(cmd => (
            <CommandItem key={cmd.label} onSelect={() => runAction(cmd.action)}>
              <cmd.icon className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{cmd.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => { toggleTheme(); setIsOpen(false); }}>
            {theme === 'dark' ? <Sun className="mr-2 h-4 w-4 text-muted-foreground" /> : <Moon className="mr-2 h-4 w-4 text-muted-foreground" />}
            <span>Toggle Theme</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
