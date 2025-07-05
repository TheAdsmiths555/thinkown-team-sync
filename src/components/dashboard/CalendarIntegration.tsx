import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'deadline' | 'meeting' | 'review';
  date: string;
  time: string;
  attendees?: string[];
  project?: string;
}

const calendarEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'ThinkOwn Teams v2.0 Deadline',
    type: 'deadline',
    date: '2024-02-15',
    time: 'All Day',
    project: 'ThinkOwn Teams v2.0'
  },
  {
    id: '2',
    title: 'Sprint Planning Meeting',
    type: 'meeting',
    date: '2024-01-22',
    time: '10:00 AM',
    attendees: ['Alex Chen', 'Sarah Kim', 'Mike Rodriguez'],
    project: 'ThinkOwn Teams v2.0'
  },
  {
    id: '3',
    title: 'Design Review Session',
    type: 'review',
    date: '2024-01-24',
    time: '2:00 PM',
    attendees: ['Sarah Kim', 'Rachel Green'],
    project: 'Mobile App MVP'
  },
  {
    id: '4',
    title: 'QA Review Call',
    type: 'review',
    date: '2024-01-26',
    time: '11:00 AM',
    attendees: ['Emma Wilson', 'Tom Johnson'],
    project: 'API Documentation'
  },
  {
    id: '5',
    title: 'Client Demo Preparation',
    type: 'meeting',
    date: '2024-01-28',
    time: '3:00 PM',
    attendees: ['Alex Chen', 'Sarah Kim', 'Rachel Green']
  }
];

export function CalendarIntegration() {
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'deadline': return 'bg-destructive/20 text-destructive border border-destructive/30';
      case 'meeting': return 'bg-primary/20 text-primary border border-primary/30';
      case 'review': return 'bg-warning/20 text-warning border border-warning/30';
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

  const isToday = (dateString: string) => {
    const today = new Date();
    const eventDate = new Date(dateString);
    return today.toDateString() === eventDate.toDateString();
  };

  const isUpcoming = (dateString: string) => {
    const today = new Date();
    const eventDate = new Date(dateString);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Calendar & Deadlines
          </div>
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {calendarEvents
            .filter(event => isUpcoming(event.date))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((event) => (
              <div 
                key={event.id}
                className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-medium ${
                  isToday(event.date) ? 'border-primary/50 bg-primary/5' : 'border-border/50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">{event.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatDate(event.date)}</span>
                      <span>•</span>
                      <span>{event.time}</span>
                      {isToday(event.date) && (
                        <>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs bg-accent/20 text-accent-foreground">
                            Today
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                  <Badge className={`text-xs ${getEventTypeColor(event.type)}`}>
                    {event.type}
                  </Badge>
                </div>
                
                {event.project && (
                  <div className="mb-2">
                    <span className="text-xs px-2 py-1 rounded bg-muted/20 text-muted-foreground">
                      {event.project}
                    </span>
                  </div>
                )}
                
                {event.attendees && event.attendees.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>Attendees:</span>
                    <span>{event.attendees.join(', ')}</span>
                  </div>
                )}
              </div>
            ))}
          
          {calendarEvents.filter(event => isUpcoming(event.date)).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming events this week</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}