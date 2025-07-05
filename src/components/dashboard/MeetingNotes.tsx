import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Calendar } from 'lucide-react';

interface MeetingNote {
  id: string;
  title: string;
  date: string;
  attendees: Array<{
    name: string;
    avatar: string;
    initials: string;
  }>;
  notes: string;
  actionItems: string[];
  project?: string;
  type: 'standup' | 'planning' | 'review' | 'retrospective';
}

const meetingNotes: MeetingNote[] = [
  {
    id: '1',
    title: 'Daily Standup - ThinkOwn Teams',
    date: '2024-01-15',
    type: 'standup',
    attendees: [
      { name: 'Alex Chen', avatar: '', initials: 'AC' },
      { name: 'Sarah Kim', avatar: '', initials: 'SK' },
      { name: 'Mike Rodriguez', avatar: '', initials: 'MR' }
    ],
    notes: 'Discussed progress on authentication system. Sarah shared design updates for the dashboard. Mike highlighted database optimization improvements.',
    actionItems: [
      'Complete JWT implementation by EOD',
      'Review design mockups by Thursday',
      'Set up database performance monitoring'
    ],
    project: 'ThinkOwn Teams v2.0'
  },
  {
    id: '2',
    title: 'Sprint Planning - Q1 2024',
    date: '2024-01-12',
    type: 'planning',
    attendees: [
      { name: 'Rachel Green', avatar: '', initials: 'RG' },
      { name: 'Emma Wilson', avatar: '', initials: 'EW' },
      { name: 'David Park', avatar: '', initials: 'DP' }
    ],
    notes: 'Planned upcoming sprint with focus on mobile app development. Identified key user stories and acceptance criteria.',
    actionItems: [
      'Finalize mobile app requirements',
      'Set up React Native development environment',
      'Create test plan for mobile features'
    ],
    project: 'Mobile App MVP'
  },
  {
    id: '3',
    title: 'Design Review Session',
    date: '2024-01-10',
    type: 'review',
    attendees: [
      { name: 'Sarah Kim', avatar: '', initials: 'SK' },
      { name: 'Rachel Green', avatar: '', initials: 'RG' }
    ],
    notes: 'Reviewed latest design iterations for the dashboard interface. Discussed color scheme and accessibility improvements.',
    actionItems: [
      'Update color contrast ratios',
      'Create mobile-responsive breakpoints',
      'Prepare design system documentation'
    ],
    project: 'ThinkOwn Teams v2.0'
  }
];

export function MeetingNotes() {
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  const getMeetingTypeColor = (type: string) => {
    switch (type) {
      case 'standup': return 'bg-primary/20 text-primary border border-primary/30';
      case 'planning': return 'bg-success/20 text-success border border-success/30';
      case 'review': return 'bg-warning/20 text-warning border border-warning/30';
      case 'retrospective': return 'bg-accent/20 text-accent-foreground border border-accent/30';
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

  const handleAddNote = () => {
    if (newNote.trim()) {
      // In a real app, this would save to the backend
      console.log('Adding new note:', newNote);
      setNewNote('');
      setIsAddingNote(false);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-surface rounded-lg flex items-center justify-center">
              💬
            </div>
            Meeting Notes
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsAddingNote(!isAddingNote)}
            >
              {isAddingNote ? 'Cancel' : 'Add Note'}
            </Button>
            <Button variant="ghost" size="sm">
              <Bell className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Quick Add Note */}
          {isAddingNote && (
            <div className="p-4 rounded-lg border border-dashed border-primary/30 bg-primary/5">
              <div className="space-y-3">
                <Textarea
                  placeholder="Add quick meeting notes or action items..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsAddingNote(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" className="gradient-primary text-white" onClick={handleAddNote}>
                    Save Note
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Recent Meeting Notes */}
          <div className="space-y-4">
            {meetingNotes.map((meeting) => (
              <div 
                key={meeting.id}
                className="p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-all duration-200 group"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium group-hover:text-primary transition-colors">
                          {meeting.title}
                        </h4>
                        <Badge className={`text-xs ${getMeetingTypeColor(meeting.type)}`}>
                          {meeting.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(meeting.date)}</span>
                        {meeting.project && (
                          <>
                            <span>•</span>
                            <span>{meeting.project}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Attendees:</span>
                    <div className="flex -space-x-1">
                      {meeting.attendees.map((attendee, index) => (
                        <Avatar key={index} className="w-6 h-6 border-2 border-background">
                          <AvatarImage src={attendee.avatar} />
                          <AvatarFallback className="text-xs bg-primary/20 text-primary">
                            {attendee.initials}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-muted-foreground">Notes:</h5>
                    <p className="text-sm leading-relaxed bg-muted/20 p-3 rounded-lg">
                      {meeting.notes}
                    </p>
                  </div>
                  
                  {meeting.actionItems.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-muted-foreground">Action Items:</h5>
                      <ul className="space-y-1">
                        {meeting.actionItems.map((item, index) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Templates */}
          <div className="border-t border-border/50 pt-4">
            <h5 className="text-sm font-medium text-muted-foreground mb-3">Quick Templates:</h5>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="justify-start text-xs"
                onClick={() => {
                  setNewNote('**Daily Standup Notes**\n\n**What did you work on yesterday?**\n\n**What will you work on today?**\n\n**Any blockers?**\n\n**Action Items:**\n- ');
                  setIsAddingNote(true);
                }}
              >
                Daily Standup
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="justify-start text-xs"
                onClick={() => {
                  setNewNote('**Sprint Planning Notes**\n\n**Sprint Goal:**\n\n**User Stories Discussed:**\n\n**Capacity & Velocity:**\n\n**Action Items:**\n- ');
                  setIsAddingNote(true);
                }}
              >
                Sprint Planning
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}