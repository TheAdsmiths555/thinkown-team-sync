import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Calendar, Users, Settings, Activity } from 'lucide-react';
import { useProjects, Project } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Import tab components (we'll create these)
import { ProjectTasksTab } from './project-detail/ProjectTasksTab';
import { ProjectQATab } from './project-detail/ProjectQATab';
import { ProjectFilesTab } from './project-detail/ProjectFilesTab';
import { ProjectActivityTab } from './project-detail/ProjectActivityTab';
import { ProjectTeamTab } from './project-detail/ProjectTeamTab';

export function ProjectDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { projects, loading: projectsLoading } = useProjects();
  const { tasks } = useTasks();
  const { teamMembers } = useTeamMembers();
  
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState('tasks');

  useEffect(() => {
    if (projects.length > 0 && id) {
      const foundProject = projects.find(p => p.id === id);
      if (foundProject) {
        setProject(foundProject);
      } else {
        toast({
          title: "Project not found",
          description: "The requested project could not be found.",
          variant: "destructive"
        });
        navigate('/');
      }
    }
  }, [projects, id, navigate, toast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'bg-success/20 text-success';
      case 'at-risk': return 'bg-warning/20 text-warning';
      case 'delayed': return 'bg-destructive/20 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getProjectStats = () => {
    if (!project) return { totalTasks: 0, completedTasks: 0, assignedMembers: [] };
    
    const projectTasks = tasks.filter(task => task.project_id === project.id);
    const completedTasks = projectTasks.filter(task => task.status === 'completed');
    const assignedMembers = teamMembers.filter(member => 
      projectTasks.some(task => task.assignee_id === member.id)
    );
    
    return {
      totalTasks: projectTasks.length,
      completedTasks: completedTasks.length,
      assignedMembers
    };
  };

  const calculateProgress = () => {
    const stats = getProjectStats();
    if (stats.totalTasks === 0) return 0;
    return Math.round((stats.completedTasks / stats.totalTasks) * 100);
  };

  const updateProjectStatus = async (newStatus: 'on-track' | 'at-risk' | 'delayed') => {
    if (!project) return;

    const { error } = await supabase
      .from('projects')
      .update({ status: newStatus })
      .eq('id', project.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update project status",
        variant: "destructive"
      });
    } else {
      setProject({ ...project, status: newStatus });
      toast({
        title: "Success",
        description: "Project status updated successfully"
      });
    }
  };

  if (projectsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <Card className="glass-card">
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground">Loading project...</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <Card className="glass-card">
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground">Project not found</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const stats = getProjectStats();
  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <Card className="glass-card">
            <CardHeader>
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="space-y-2">
                  <CardTitle className="text-2xl">{project.name}</CardTitle>
                  <p className="text-muted-foreground">
                    {project.description || 'No description provided'}
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <Select 
                    value={project.status || 'on-track'} 
                    onValueChange={updateProjectStatus}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="on-track">On Track</SelectItem>
                      <SelectItem value="at-risk">At Risk</SelectItem>
                      <SelectItem value="delayed">Delayed</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Badge className={getStatusColor(project.status || 'on-track')}>
                    {(project.status || 'on-track').replace('-', ' ')}
                  </Badge>
                </div>
              </div>
              
              {/* Project Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div className="text-sm">
                    <span className="text-muted-foreground">Deadline: </span>
                    <span className="font-medium">
                      {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Not set'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <div className="text-sm">
                    <span className="text-muted-foreground">Tasks: </span>
                    <span className="font-medium">{stats.completedTasks}/{stats.totalTasks}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div className="text-sm">
                    <span className="text-muted-foreground">Team: </span>
                    <span className="font-medium">{stats.assignedMembers.length} members</span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Tabs Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <Card className="glass-card">
            <CardHeader className="pb-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="tasks" className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Tasks
                </TabsTrigger>
                <TabsTrigger value="team" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Team
                </TabsTrigger>
                <TabsTrigger value="qa" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  QA Status
                </TabsTrigger>
                <TabsTrigger value="files" className="flex items-center gap-2">
                  📁 Files
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex items-center gap-2">
                  📊 Activity
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            
            <CardContent>
              <TabsContent value="tasks" className="mt-0">
                <ProjectTasksTab projectId={project.id} />
              </TabsContent>
              
              <TabsContent value="team" className="mt-0">
                <ProjectTeamTab projectId={project.id} />
              </TabsContent>
              
              <TabsContent value="qa" className="mt-0">
                <ProjectQATab projectId={project.id} />
              </TabsContent>
              
              <TabsContent value="files" className="mt-0">
                <ProjectFilesTab projectId={project.id} />
              </TabsContent>
              
              <TabsContent value="activity" className="mt-0">
                <ProjectActivityTab projectId={project.id} />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
}