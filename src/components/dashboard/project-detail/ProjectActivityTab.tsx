import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Activity, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock,
  FileText,
  Users,
  AlertTriangle
} from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useTeamMembers } from '@/hooks/useTeamMembers';

interface ProjectActivityTabProps {
  projectId: string;
}

interface ActivityItem {
  id: string;
  type: 'task_created' | 'task_updated' | 'task_completed' | 'task_assigned' | 'qa_issue' | 'file_uploaded';
  title: string;
  description: string;
  user: {
    name: string;
    avatar_url?: string;
  };
  timestamp: string;
  metadata?: any;
}

export function ProjectActivityTab({ projectId }: ProjectActivityTabProps) {
  const { tasks } = useTasks();
  const { teamMembers } = useTeamMembers();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filterType, setFilterType] = useState<string>('all');

  // Generate demo activity data based on existing tasks
  useEffect(() => {
    const projectTasks = tasks.filter(task => task.project_id === projectId);
    const demoActivities: ActivityItem[] = [];

    // Generate activities from tasks
    projectTasks.forEach((task, index) => {
      const assignee = teamMembers.find(m => m.id === task.assignee_id);
      
      // Task created activity
      demoActivities.push({
        id: `activity-${task.id}-created`,
        type: 'task_created',
        title: 'Task Created',
        description: `Created task "${task.title}"`,
        user: {
          name: 'System User',
          avatar_url: undefined
        },
        timestamp: task.created_at,
        metadata: { taskId: task.id }
      });

      // Task assigned activity
      if (assignee) {
        demoActivities.push({
          id: `activity-${task.id}-assigned`,
          type: 'task_assigned',
          title: 'Task Assigned',
          description: `Assigned "${task.title}" to ${assignee.name}`,
          user: {
            name: 'System User',
            avatar_url: undefined
          },
          timestamp: task.created_at,
          metadata: { taskId: task.id, assigneeName: assignee.name }
        });
      }

      // Task completed activity (for completed tasks)
      if (task.status === 'completed') {
        demoActivities.push({
          id: `activity-${task.id}-completed`,
          type: 'task_completed',
          title: 'Task Completed',
          description: `Completed task "${task.title}"`,
          user: {
            name: assignee?.name || 'Unknown User',
            avatar_url: assignee?.avatar_url || undefined
          },
          timestamp: task.updated_at,
          metadata: { taskId: task.id }
        });
      }

      // Task updated activity (for in-progress and testing tasks)
      if (task.status === 'progress' || task.status === 'testing') {
        demoActivities.push({
          id: `activity-${task.id}-updated`,
          type: 'task_updated',
          title: 'Task Updated',
          description: `Updated task "${task.title}" status to ${task.status.replace('_', ' ')}`,
          user: {
            name: assignee?.name || 'Unknown User',
            avatar_url: assignee?.avatar_url || undefined
          },
          timestamp: task.updated_at,
          metadata: { taskId: task.id, newStatus: task.status }
        });
      }
    });

    // Add some demo file and QA activities
    const additionalActivities: ActivityItem[] = [
      {
        id: 'file-upload-1',
        type: 'file_uploaded',
        title: 'File Uploaded',
        description: 'Uploaded project-mockup.figma to Designs folder',
        user: {
          name: 'Design Team',
          avatar_url: undefined
        },
        timestamp: new Date().toISOString(),
        metadata: { fileName: 'project-mockup.figma' }
      },
      {
        id: 'qa-issue-1',
        type: 'qa_issue',
        title: 'QA Issue Reported',
        description: 'Reported critical bug: Login form validation not working',
        user: {
          name: 'QA Team',
          avatar_url: undefined
        },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        metadata: { severity: 'critical' }
      }
    ];

    const allActivities = [...demoActivities, ...additionalActivities]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setActivities(allActivities);
  }, [tasks, teamMembers, projectId]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_created': return <Plus className="w-4 h-4" />;
      case 'task_updated': return <Edit className="w-4 h-4" />;
      case 'task_completed': return <CheckCircle className="w-4 h-4" />;
      case 'task_assigned': return <Users className="w-4 h-4" />;
      case 'qa_issue': return <AlertTriangle className="w-4 h-4" />;
      case 'file_uploaded': return <FileText className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'task_created': return 'bg-primary/20 text-primary';
      case 'task_updated': return 'bg-warning/20 text-warning';
      case 'task_completed': return 'bg-success/20 text-success';
      case 'task_assigned': return 'bg-accent/20 text-accent-foreground';
      case 'qa_issue': return 'bg-destructive/20 text-destructive';
      case 'file_uploaded': return 'bg-secondary/20 text-secondary-foreground';
      default: return 'bg-muted/20 text-muted-foreground';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredActivities = activities.filter(activity => 
    filterType === 'all' || activity.type === filterType
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Project Activity Log</h3>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Activities</SelectItem>
            <SelectItem value="task_created">Task Created</SelectItem>
            <SelectItem value="task_updated">Task Updated</SelectItem>
            <SelectItem value="task_completed">Task Completed</SelectItem>
            <SelectItem value="task_assigned">Task Assigned</SelectItem>
            <SelectItem value="qa_issue">QA Issues</SelectItem>
            <SelectItem value="file_uploaded">File Uploads</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredActivities.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No activities found.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Activities will appear here as team members work on the project.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredActivities.map((activity) => (
            <Card key={activity.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-full flex-shrink-0 ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">{activity.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>by {activity.user.name}</span>
                          <span>•</span>
                          <span>{formatTimestamp(activity.timestamp)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={activity.user.avatar_url} />
                          <AvatarFallback className="text-xs bg-primary/20 text-primary">
                            {activity.user.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <Clock className="w-3 h-3 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}