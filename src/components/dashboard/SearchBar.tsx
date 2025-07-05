import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X, User, Calendar, CheckCircle } from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'task' | 'team' | 'project' | 'file';
  title: string;
  description: string;
  metadata?: string;
}

const mockSearchResults: SearchResult[] = [
  {
    id: '1',
    type: 'task',
    title: 'User Authentication API',
    description: 'Implement JWT-based authentication system',
    metadata: 'Alex Chen • High Priority'
  },
  {
    id: '2',
    type: 'team',
    title: 'Sarah Kim',
    description: 'UI/UX Designer',
    metadata: '5 active tasks'
  },
  {
    id: '3',
    type: 'project',
    title: 'ThinkOwn Teams v2.0',
    description: 'Main project management dashboard',
    metadata: '12 tasks • 75% complete'
  },
  {
    id: '4',
    type: 'file',
    title: 'Design System Guidelines.pdf',
    description: 'Brand guidelines and design tokens',
    metadata: 'Uploaded 2 days ago'
  }
];

interface SearchBarProps {
  onResultSelect?: (result: SearchResult) => void;
}

export function SearchBar({ onResultSelect }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    if (term.trim().length > 0) {
      // Simulate search - in real app, this would be an API call
      const filtered = mockSearchResults.filter(
        result =>
          result.title.toLowerCase().includes(term.toLowerCase()) ||
          result.description.toLowerCase().includes(term.toLowerCase())
      );
      setResults(filtered);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    onResultSelect?.(result);
    setSearchTerm('');
    setIsOpen(false);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'task':
        return <CheckCircle className="w-4 h-4" />;
      case 'team':
        return <User className="w-4 h-4" />;
      case 'project':
        return <Calendar className="w-4 h-4" />;
      case 'file':
        return <Search className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getResultBadgeColor = (type: string) => {
    switch (type) {
      case 'task':
        return 'bg-primary/20 text-primary';
      case 'team':
        return 'bg-success/20 text-success';
      case 'project':
        return 'bg-warning/20 text-warning';
      case 'file':
        return 'bg-accent/20 text-accent-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search tasks, teams, files..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 pr-10 bg-input border-border"
          onFocus={() => searchTerm && setIsOpen(true)}
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => {
              setSearchTerm('');
              setIsOpen(false);
            }}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 glass-card shadow-strong">
          <CardContent className="p-2">
            <div className="space-y-1">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/20 cursor-pointer transition-colors"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="text-muted-foreground">
                    {getResultIcon(result.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">{result.title}</h4>
                      <Badge className={`text-xs ${getResultBadgeColor(result.type)}`}>
                        {result.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {result.description}
                    </p>
                    {result.metadata && (
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        {result.metadata}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isOpen && results.length === 0 && searchTerm && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">No results found for "{searchTerm}"</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}