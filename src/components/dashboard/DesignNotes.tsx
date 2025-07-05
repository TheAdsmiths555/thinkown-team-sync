import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Calendar } from 'lucide-react';

interface DesignNote {
  id: string;
  title: string;
  project: string;
  designer: {
    name: string;
    avatar: string;
    initials: string;
  };
  figmaLink?: string;
  status: 'draft' | 'review' | 'approved' | 'implemented';
  lastUpdated: string;
  description: string;
  tags: string[];
  thumbnail?: string;
}

const designNotes: DesignNote[] = [
  {
    id: '1',
    title: 'Dashboard Redesign v2.0',
    project: 'ThinkOwn Teams v2.0',
    designer: { name: 'Sarah Kim', avatar: '', initials: 'SK' },
    figmaLink: 'https://figma.com/design/abc123',
    status: 'review',
    lastUpdated: '2024-01-15',
    description: 'Complete redesign of the main dashboard with improved navigation and visual hierarchy. Focus on dark mode optimization and accessibility.',
    tags: ['Dashboard', 'Dark Mode', 'Accessibility']
  },
  {
    id: '2',
    title: 'Mobile App Navigation System',
    project: 'Mobile App MVP',
    designer: { name: 'Lisa Zhang', avatar: '', initials: 'LZ' },
    figmaLink: 'https://figma.com/design/def456',
    status: 'approved',
    lastUpdated: '2024-01-14',
    description: 'Native mobile navigation patterns for iOS and Android. Includes tab bar, stack navigation, and modal presentations.',
    tags: ['Mobile', 'Navigation', 'iOS', 'Android']
  },
  {
    id: '3',
    title: 'Component Library Updates',
    project: 'Design System',
    designer: { name: 'Sarah Kim', avatar: '', initials: 'SK' },
    status: 'draft',
    lastUpdated: '2024-01-13',
    description: 'Updates to button variants, form components, and data visualization elements. Adding new color tokens and spacing utilities.',
    tags: ['Components', 'Design System', 'Tokens']
  },
  {
    id: '4',
    title: 'Data Visualization Charts',
    project: 'Analytics Dashboard',
    designer: { name: 'Lisa Zhang', avatar: '', initials: 'LZ' },
    figmaLink: 'https://figma.com/design/ghi789',
    status: 'implemented',
    lastUpdated: '2024-01-12',
    description: 'Interactive charts and graphs for project analytics. Includes progress tracking, team performance metrics, and timeline visualizations.',
    tags: ['Charts', 'Analytics', 'Data Viz']
  },
  {
    id: '5',
    title: 'Onboarding Flow Wireframes',
    project: 'User Experience',
    designer: { name: 'Sarah Kim', avatar: '', initials: 'SK' },
    figmaLink: 'https://figma.com/design/jkl012',
    status: 'review',
    lastUpdated: '2024-01-11',
    description: 'Step-by-step onboarding experience for new users. Includes account setup, team invitations, and initial project creation.',
    tags: ['Onboarding', 'UX', 'Wireframes']
  }
];

export function DesignNotes() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-muted text-muted-foreground';
      case 'review': return 'bg-warning/20 text-warning border border-warning/30';
      case 'approved': return 'bg-success/20 text-success border border-success/30';
      case 'implemented': return 'bg-primary/20 text-primary border border-primary/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const statusCounts = {
    draft: designNotes.filter(note => note.status === 'draft').length,
    review: designNotes.filter(note => note.status === 'review').length,
    approved: designNotes.filter(note => note.status === 'approved').length,
    implemented: designNotes.filter(note => note.status === 'implemented').length
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-surface rounded-lg flex items-center justify-center">
              🎨
            </div>
            Design Notes & Figma Links
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              Open Figma
            </Button>
            <Button variant="ghost" size="sm">
              <Bell className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Status Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/10">
              <div className="text-lg font-bold text-muted-foreground">{statusCounts.draft}</div>
              <div className="text-xs text-muted-foreground">Draft</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-warning/10">
              <div className="text-lg font-bold text-warning">{statusCounts.review}</div>
              <div className="text-xs text-muted-foreground">In Review</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-success/10">
              <div className="text-lg font-bold text-success">{statusCounts.approved}</div>
              <div className="text-xs text-muted-foreground">Approved</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-primary/10">
              <div className="text-lg font-bold text-primary">{statusCounts.implemented}</div>
              <div className="text-xs text-muted-foreground">Implemented</div>
            </div>
          </div>

          {/* Design Notes List */}
          <div className="space-y-4">
            {designNotes.map((note) => (
              <div 
                key={note.id}
                className="p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-all duration-200 group"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium group-hover:text-primary transition-colors">
                          {note.title}
                        </h4>
                        {note.figmaLink && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs h-6 px-2"
                            onClick={() => window.open(note.figmaLink, '_blank')}
                          >
                            Open Figma
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{note.project}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Avatar className="w-4 h-4">
                            <AvatarImage src={note.designer.avatar} />
                            <AvatarFallback className="text-xs bg-accent/20 text-accent-foreground">
                              {note.designer.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span>{note.designer.name}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={`text-xs ${getStatusColor(note.status)}`}>
                      {note.status}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {note.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>Updated {formatDate(note.lastUpdated)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="border-t border-border/50 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="justify-start">
                <div className="w-4 h-4 mr-2">🎨</div>
                Create Design Task
              </Button>
              <Button variant="outline" className="justify-start">
                <div className="w-4 h-4 mr-2">📋</div>
                Request Review
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}