import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar, Plus } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { ProjectForm } from '@/components/forms/ProjectForm';

export function ProjectTracker() {
  const { projects, loading: projectsLoading } = useProjects();
  const { tasks } = useTasks();
  const { teamMembers } = useTeamMembers();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'bg-success/20 text-success';
      case 'at-risk': return 'bg-warning/20 text-warning';
      case 'delayed': return 'bg-destructive/20 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getProjectStats = (projectId: string) => {
    const projectTasks = tasks.filter(task => task.project_id === projectId);
    const completedTasks = projectTasks.filter(task => task.status === 'completed');
    const assignedMembers = teamMembers.filter(member => 
      projectTasks.some(task => task.assignee_id === member.id)
    );
    
    return {
      totalTasks: projectTasks.length,
      completedTasks: completedTasks.length,
      assignedMembers: assignedMembers.slice(0, 4), // Show max 4 avatars
      totalMembers: assignedMembers.length
    };
  };

  const calculateProgress = (projectId: string) => {
    const stats = getProjectStats(projectId);
    if (stats.totalTasks === 0) return 0;
    return Math.round((stats.completedTasks / stats.totalTasks) * 100);
  };

  if (projectsLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">Loading projects...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              📈
            </div>
            Project Tracker
          </CardTitle>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="gradient-primary text-white"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {projects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-4">No projects found</p>
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="gradient-primary text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Project
              </Button>
            </div>
          ) : (
            projects.map((project) => {
              const stats = getProjectStats(project.id);
              const progress = calculateProgress(project.id);
              
              return (
                <Link key={project.id} to={`/project/${project.id}`} className="block">
                  <div className="p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-all duration-200 group cursor-pointer hover:shadow-md">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold group-hover:text-primary transition-colors">
                            {project.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {project.description || 'No description provided'}
                          </p>
                        </div>
                        <Badge className={getStatusColor(project.status || 'on-track')}>
                          {(project.status || 'on-track').replace('-', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <Progress 
                          value={progress} 
                          className="h-2"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {project.deadline && (
                            <>
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                Due {new Date(project.deadline).toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          {stats.completedTasks}/{stats.totalTasks} tasks
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Team:</span>
                          <div className="flex -space-x-2">
                            {stats.assignedMembers.map((member, index) => (
                              <Avatar key={member.id} className="w-6 h-6 border-2 border-background" title={member.name}>
                                <AvatarImage src={member.avatar_url || ''} />
                                <AvatarFallback className="text-xs bg-primary/20 text-primary">
                                  {member.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {stats.totalMembers > 4 && (
                              <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                                <span className="text-xs text-muted-foreground">
                                  +{stats.totalMembers - 4}
                                </span>
                              </div>
                            )}
                            {stats.totalMembers === 0 && (
                              <span className="text-xs text-muted-foreground">No members assigned</span>
                            )}
                          </div>
                        </div>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          View Details →
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </CardContent>
      
      <ProjectForm 
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSuccess={() => setShowCreateForm(false)}
      />
    </Card>
  );
}