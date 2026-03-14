import { useState } from 'react';
import { useSearch } from '@/hooks/useSearch';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, FileText, GitBranch, Notebook, Loader2 } from 'lucide-react';

const SOURCE_ICONS: Record<string, React.ElementType> = {
  Notion: Notebook,
  GitHub: GitBranch,
};

const SearchPage = () => {
  const { results, isLoading, search } = useSearch();
  const [input, setInput] = useState('');

  const handleSearch = (value: string) => {
    setInput(value);
    search(value);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={input}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search workspace..."
          className="pl-10 h-11 bg-card/50 border-border/50"
          autoFocus
        />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && results.length > 0 && (
        <div className="space-y-1">
          {results.map(result => {
            const Icon = SOURCE_ICONS[result.source] || FileText;
            return (
              <div key={result.id} className="flex items-center gap-3 rounded-md px-3 py-3 transition-colors hover:bg-accent/50 surface-glow cursor-pointer">
                <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{result.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{result.description}</p>
                </div>
                <span className="text-xs text-muted-foreground">{result.source}</span>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && input && results.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-12">No results found for "{input}"</p>
      )}

      {!input && (
        <p className="text-sm text-muted-foreground text-center py-12">Start typing to search your workspace</p>
      )}
    </div>
  );
};

export default SearchPage;
