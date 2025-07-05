import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  progress: number;
  deadline: string;
  status: 'on-track' | 'at-risk' | 'delayed';
  team: Array<{
    name: string;
    avatar: string;
    initials: string;
    role: string;
  }>;
  tasksCompleted: number;
  totalTasks: number;
}

const projects: Project[] = [
  {
    id: '1',
    name: 'ThinkOwn Teams v2.0',
    description: 'Major platform redesign with new collaboration features',
    progress: 75,
    deadline: '2024-02-15',
    status: 'on-track',
    team: [
      { name: 'Alex Chen', avatar: '', initials: 'AC', role: 'Dev' },
      { name: 'Sarah Kim', avatar: '', initials: 'SK', role: 'Design' },
      { name: 'Mike Rodriguez', avatar: '', initials: 'MR', role: 'Dev' },
      { name: 'Emma Wilson', avatar: '', initials: 'EW', role: 'QA' }
    ],
    tasksCompleted: 18,
    totalTasks: 24
  },
  {
    id: '2',
    name: 'Mobile App MVP',
    description: 'React Native mobile application for iOS and Android',
    progress: 45,
    deadline: '2024-03-01',
    status: 'at-risk',
    team: [
      { name: 'David Park', avatar: '', initials: 'DP', role: 'Dev' },
      { name: 'Lisa Zhang', avatar: '', initials: 'LZ', role: 'Design' },
      { name: 'Tom Johnson', avatar: '', initials: 'TJ', role: 'QA' }
    ],
    tasksCompleted: 9,
    totalTasks: 20
  },
  {
    id: '3',
    name: 'API Documentation Portal',
    description: 'Comprehensive developer documentation and API reference',
    progress: 90,
    deadline: '2024-01-30',
    status: 'on-track',
    team: [
      { name: 'Rachel Green', avatar: '', initials: 'RG', role: 'BA' },
      { name: 'Chris Lee', avatar: '', initials: 'CL', role: 'Dev' }
    ],
    tasksCompleted: 14,
    totalTasks: 15
  }
];

export function ProjectTracker() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'bg-success/20 text-success';
      case 'at-risk': return 'bg-warning/20 text-warning';
      case 'delayed': return 'bg-destructive/20 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-success';
    if (progress >= 50) return 'bg-primary';
    return 'bg-warning';
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 gradient-surface rounded-lg flex items-center justify-center">
            📈
          </div>
          Project Tracker
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {projects.map((project) => (
            <div key={project.id} className="p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-all duration-200 group">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {project.description}
                    </p>
                  </div>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status.replace('-', ' ')}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress 
                    value={project.progress} 
                    className="h-2"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Due {project.deadline}
                    </span>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {project.tasksCompleted}/{project.totalTasks} tasks
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Team:</span>
                    <div className="flex -space-x-2">
                      {project.team.slice(0, 4).map((member, index) => (
                        <Avatar key={index} className="w-6 h-6 border-2 border-background">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="text-xs bg-primary/20 text-primary">
                            {member.initials}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {project.team.length > 4 && (
                        <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">
                            +{project.team.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}