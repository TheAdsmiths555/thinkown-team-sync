import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar, Bell, Circle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  assignee: {
    name: string;
    avatar: string;
    initials: string;
  };
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  tags: string[];
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
}

const initialColumns: Column[] = [
  {
    id: 'todo',
    title: 'To Do',
    color: 'status-todo',
    tasks: [
      {
        id: '1',
        title: 'User Authentication API',
        description: 'Implement JWT-based authentication system',
        assignee: { name: 'Alex Chen', avatar: '', initials: 'AC' },
        priority: 'high',
        dueDate: '2024-01-15',
        tags: ['Backend', 'Security']
      },
      {
        id: '2',
        title: 'Dashboard UI Mockups',
        description: 'Create initial design mockups for the main dashboard',
        assignee: { name: 'Sarah Kim', avatar: '', initials: 'SK' },
        priority: 'medium',
        dueDate: '2024-01-18',
        tags: ['Design', 'UI/UX']
      }
    ]
  },
  {
    id: 'progress',
    title: 'In Progress',
    color: 'status-progress',
    tasks: [
      {
        id: '3',
        title: 'Database Schema Design',
        description: 'Design and implement user management schema',
        assignee: { name: 'Mike Rodriguez', avatar: '', initials: 'MR' },
        priority: 'high',
        dueDate: '2024-01-20',
        tags: ['Database', 'Backend']
      }
    ]
  },
  {
    id: 'testing',
    title: 'Testing',
    color: 'status-testing',
    tasks: [
      {
        id: '4',
        title: 'Login Flow Testing',
        description: 'Comprehensive testing of user login functionality',
        assignee: { name: 'Emma Wilson', avatar: '', initials: 'EW' },
        priority: 'medium',
        dueDate: '2024-01-22',
        tags: ['QA', 'Testing']
      }
    ]
  },
  {
    id: 'completed',
    title: 'Completed',
    color: 'status-completed',
    tasks: [
      {
        id: '5',
        title: 'Project Setup',
        description: 'Initial project configuration and dependencies',
        assignee: { name: 'David Park', avatar: '', initials: 'DP' },
        priority: 'low',
        dueDate: '2024-01-10',
        tags: ['Setup', 'DevOps']
      }
    ]
  }
];

export function KanbanBoard() {
  const [columns, setColumns] = useState(initialColumns);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive/20 text-destructive';
      case 'medium': return 'bg-warning/20 text-warning';
      case 'low': return 'bg-success/20 text-success';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
            <Circle className="w-4 h-4 text-white" />
          </div>
          Task Board
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column) => (
            <div key={column.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{column.title}</h3>
                <Badge variant="outline" className="text-xs">
                  {column.tasks.length}
                </Badge>
              </div>
              
              <div className="space-y-3">
                {column.tasks.map((task) => (
                  <Card key={task.id} className="transition-all duration-200 hover:shadow-medium cursor-pointer group">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm leading-tight group-hover:text-primary transition-colors">
                            {task.title}
                          </h4>
                          <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {task.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-1">
                          {task.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={task.assignee.avatar} />
                            <AvatarFallback className="text-xs bg-primary/20 text-primary">
                              {task.assignee.initials}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {task.dueDate}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Button variant="ghost" size="sm" className="w-full border-2 border-dashed border-border hover:border-primary/50">
                + Add Task
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}