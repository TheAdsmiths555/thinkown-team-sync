import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Bell } from 'lucide-react';

interface MarketingEvent {
  id: string;
  title: string;
  type: 'post' | 'campaign' | 'launch' | 'content';
  platform: 'LinkedIn' | 'Twitter' | 'Blog' | 'Email' | 'Website';
  scheduledDate: string;
  status: 'scheduled' | 'draft' | 'published' | 'cancelled';
  assignee: {
    name: string;
    avatar: string;
    initials: string;
  };
  description: string;
  tags: string[];
  campaign?: string;
}

const marketingEvents: MarketingEvent[] = [
  {
    id: '1',
    title: 'ThinkOwn Teams v2.0 Launch Announcement',
    type: 'launch',
    platform: 'LinkedIn',
    scheduledDate: '2024-02-15',
    status: 'scheduled',
    assignee: { name: 'Marketing Team', avatar: '', initials: 'MT' },
    description: 'Official launch announcement for the new version with feature highlights and customer testimonials.',
    tags: ['Product Launch', 'Features', 'Testimonials'],
    campaign: 'V2.0 Launch'
  },
  {
    id: '2',
    title: 'Weekly Development Update #47',
    type: 'post',
    platform: 'Blog',
    scheduledDate: '2024-01-19',
    status: 'draft',
    assignee: { name: 'Rachel Green', avatar: '', initials: 'RG' },
    description: 'Weekly progress update covering recent development milestones, team highlights, and upcoming features.',
    tags: ['Development', 'Progress', 'Team'],
    campaign: 'Weekly Updates'
  },
  {
    id: '3',
    title: 'Project Management Best Practices',
    type: 'content',
    platform: 'Blog',
    scheduledDate: '2024-01-22',
    status: 'scheduled',
    assignee: { name: 'Content Team', avatar: '', initials: 'CT' },
    description: 'Educational content about effective project management strategies for software teams.',
    tags: ['Education', 'Best Practices', 'Tips'],
    campaign: 'Thought Leadership'
  },
  {
    id: '4',
    title: 'Customer Success Story - TechCorp',
    type: 'post',
    platform: 'LinkedIn',
    scheduledDate: '2024-01-25',
    status: 'draft',
    assignee: { name: 'Marketing Team', avatar: '', initials: 'MT' },
    description: 'Case study featuring how TechCorp improved their project delivery by 40% using ThinkOwn Teams.',
    tags: ['Case Study', 'Customer', 'Success'],
    campaign: 'Customer Stories'
  },
  {
    id: '5',
    title: 'New Features Newsletter',
    type: 'campaign',
    platform: 'Email',
    scheduledDate: '2024-01-30',
    status: 'scheduled',
    assignee: { name: 'Marketing Team', avatar: '', initials: 'MT' },
    description: 'Monthly newsletter highlighting new features, updates, and customer success stories.',
    tags: ['Newsletter', 'Features', 'Updates'],
    campaign: 'Monthly Newsletter'
  },
  {
    id: '6',
    title: 'Behind the Scenes: Development Process',
    type: 'content',
    platform: 'Twitter',
    scheduledDate: '2024-02-01',
    status: 'draft',
    assignee: { name: 'Alex Chen', avatar: '', initials: 'AC' },
    description: 'Thread showcasing our development workflow, tools, and team collaboration practices.',
    tags: ['Behind the Scenes', 'Development', 'Process'],
    campaign: 'Developer Stories'
  }
];

export function MarketingCalendar() {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'post': return 'bg-primary/20 text-primary border border-primary/30';
      case 'campaign': return 'bg-success/20 text-success border border-success/30';
      case 'launch': return 'bg-accent/20 text-accent-foreground border border-accent/30';
      case 'content': return 'bg-warning/20 text-warning border border-warning/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-success/20 text-success';
      case 'draft': return 'bg-muted text-muted-foreground';
      case 'published': return 'bg-primary/20 text-primary';
      case 'cancelled': return 'bg-destructive/20 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'LinkedIn': return 'bg-blue-500/20 text-blue-400';
      case 'Twitter': return 'bg-sky-500/20 text-sky-400';
      case 'Blog': return 'bg-purple-500/20 text-purple-400';
      case 'Email': return 'bg-green-500/20 text-green-400';
      case 'Website': return 'bg-orange-500/20 text-orange-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const isUpcoming = (dateString: string) => {
    const today = new Date();
    const eventDate = new Date(dateString);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 14;
  };

  const statusCounts = {
    scheduled: marketingEvents.filter(event => event.status === 'scheduled').length,
    draft: marketingEvents.filter(event => event.status === 'draft').length,
    published: marketingEvents.filter(event => event.status === 'published').length
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-surface rounded-lg flex items-center justify-center">
              📅
            </div>
            Marketing Calendar
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              Schedule Post
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
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-success/10">
              <div className="text-lg font-bold text-success">{statusCounts.scheduled}</div>
              <div className="text-xs text-muted-foreground">Scheduled</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/10">
              <div className="text-lg font-bold text-muted-foreground">{statusCounts.draft}</div>
              <div className="text-xs text-muted-foreground">Drafts</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-primary/10">
              <div className="text-lg font-bold text-primary">{statusCounts.published}</div>
              <div className="text-xs text-muted-foreground">Published</div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">Upcoming Events</h4>
            <div className="space-y-3">
              {marketingEvents
                .filter(event => isUpcoming(event.scheduledDate))
                .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
                .map((event) => (
                  <div 
                    key={event.id}
                    className="p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-all duration-200 group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h5 className="font-medium text-sm group-hover:text-primary transition-colors">
                            {event.title}
                          </h5>
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs ${getTypeColor(event.type)}`}>
                              {event.type}
                            </Badge>
                            <Badge className={`text-xs ${getPlatformColor(event.platform)}`}>
                              {event.platform}
                            </Badge>
                          </div>
                        </div>
                        <Badge className={`text-xs ${getStatusColor(event.status)}`}>
                          {event.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {event.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-5 h-5">
                            <AvatarImage src={event.assignee.avatar} />
                            <AvatarFallback className="text-xs bg-primary/20 text-primary">
                              {event.assignee.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {event.assignee.name}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(event.scheduledDate)}</span>
                        </div>
                      </div>
                      
                      {event.campaign && (
                        <div className="text-xs px-2 py-1 rounded bg-muted/20 text-muted-foreground w-fit">
                          Campaign: {event.campaign}
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-1">
                        {event.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-t border-border/50 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="justify-start">
                <div className="w-4 h-4 mr-2">📝</div>
                Create Content
              </Button>
              <Button variant="outline" className="justify-start">
                <div className="w-4 h-4 mr-2">🚀</div>
                Launch Campaign
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}