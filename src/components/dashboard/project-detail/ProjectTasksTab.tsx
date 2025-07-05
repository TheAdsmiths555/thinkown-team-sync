import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, MoreVertical, Edit, ArrowRight } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useTasks, Task } from '@/hooks/useTasks';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { supabase } from '@/integrations/supabase/client';
import { RealTaskModal } from '../RealTaskModal';
import { useProjects } from '@/hooks/useProjects';

interface ProjectTasksTabProps {
  projectId: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onStatusChange: (taskId: string, newStatus: string) => void;
}

function TaskCard({ task, onClick, onStatusChange }: TaskCardProps) {
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    taskId: string;
    newStatus: string;
    statusLabel: string;
  }>({
    isOpen: false,
    taskId: '',
    newStatus: '',
    statusLabel: ''
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'medium': return 'bg-warning/20 text-warning border-warning/30';
      case 'low': return 'bg-success/20 text-success border-success/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const statusOptions = [
    { value: 'todo', label: 'To Do' },
    { value: 'progress', label: 'In Progress' },
    { value: 'testing', label: 'Testing' },
    { value: 'hold', label: 'Hold' },
    { value: 'completed', label: 'Completed' }
  ];

  const handleStatusChangeClick = (taskId: string, newStatus: string) => {
    const statusLabel = statusOptions.find(s => s.value === newStatus)?.label || newStatus;
    setConfirmDialog({
      isOpen: true,
      taskId,
      newStatus,
      statusLabel
    });
  };

  const confirmStatusChange = () => {
    onStatusChange(confirmDialog.taskId, confirmDialog.newStatus);
    setConfirmDialog({
      isOpen: false,
      taskId: '',
      newStatus: '',
      statusLabel: ''
    });
  };

  return (
    <>
      <Card
        className={`transition-all duration-200 hover:shadow-medium cursor-pointer group ${
          isOverdue ? 'border-destructive bg-destructive/5' : ''
        }`}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <h4 className={`font-medium text-sm leading-tight group-hover:text-primary transition-colors ${
                isOverdue ? 'text-destructive' : ''
              }`}>
                {task.title}
              </h4>
              <div className="flex items-center gap-2">
                <Badge className={`text-xs ${getPriorityColor(task.priority || 'medium')}`}>
                  {task.priority || 'medium'}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={handleMenuClick}
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="z-[70]">
                    <DropdownMenuItem onClick={(e) => { 
                      e.stopPropagation(); 
                      onClick(); 
                    }}>
                      <Edit className="w-3 h-3 mr-2" />
                      Edit Task
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {statusOptions.map((status) => (
                      <DropdownMenuItem 
                        key={status.value}
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handleStatusChangeClick(task.id, status.value); 
                        }}
                        disabled={task.status === status.value}
                      >
                        <ArrowRight className="w-3 h-3 mr-2" />
                        Move to {status.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground line-clamp-2">
              {task.description}
            </p>
            
            <div className="flex flex-wrap gap-1">
              {task.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <div className="flex items-center justify-between">
              <Avatar className="w-6 h-6">
                <AvatarImage src={task.assignee?.avatar_url || ''} />
                <AvatarFallback className="text-xs bg-primary/20 text-primary">
                  {task.assignee?.name.substring(0, 2).toUpperCase() || 'UN'}
                </AvatarFallback>
              </Avatar>
              
              <div className={`flex items-center gap-1 text-xs ${
                isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'
              }`}>
                <Calendar className="w-3 h-3" />
                {task.due_date || 'No date'}
                {isOverdue && ' (Overdue)'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={confirmDialog.isOpen} onOpenChange={(open) => 
        setConfirmDialog(prev => ({ ...prev, isOpen: open }))
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to move "{task.title}" to {confirmDialog.statusLabel}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>
              Yes, Move Task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function ProjectTasksTab({ projectId }: ProjectTasksTabProps) {
  const { toast } = useToast();
  const { tasks, loading: tasksLoading, refetch: refetchTasks } = useTasks();
  const { teamMembers } = useTeamMembers();
  const { projects } = useProjects();
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter tasks for this project only
  const projectTasks = tasks.filter(task => task.project_id === projectId);

  // Define columns structure
  const columns: Column[] = [
    {
      id: 'todo',
      title: 'To Do',
      tasks: projectTasks.filter(task => task.status === 'todo')
    },
    {
      id: 'progress',
      title: 'In Progress',
      tasks: projectTasks.filter(task => task.status === 'progress')
    },
    {
      id: 'testing',
      title: 'Testing',
      tasks: projectTasks.filter(task => task.status === 'testing')
    },
    {
      id: 'hold',
      title: 'Hold',
      tasks: projectTasks.filter(task => task.status === 'hold')
    },
    {
      id: 'completed',
      title: 'Completed',
      tasks: projectTasks.filter(task => task.status === 'completed')
    }
  ];

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    const task = projectTasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // Update task status in database
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive"
      });
    } else {
      refetchTasks();
      toast({
        title: "Task Status Updated",
        description: `Task moved to ${columns.find(c => c.id === newStatus)?.title}`
      });
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleTaskSave = async () => {
    refetchTasks();
    toast({
      title: "Task Saved",
      description: "Task has been saved successfully."
    });
  };

  const handleTaskDelete = async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive"
      });
    } else {
      refetchTasks();
      toast({
        title: "Task Deleted",
        description: "Task has been deleted successfully.",
        variant: "destructive"
      });
    }
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  if (tasksLoading) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Project Tasks</h3>
        <Button onClick={handleCreateTask} className="gradient-primary text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {columns.map((column) => (
          <div key={column.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">{column.title}</h4>
              <Badge variant="outline" className="text-xs">
                {column.tasks.length}
              </Badge>
            </div>
            
            <div className="space-y-3 min-h-[200px]">
              {column.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => handleTaskClick(task)}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <RealTaskModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        onSave={handleTaskSave}
        onDelete={handleTaskDelete}
        teamMembers={teamMembers}
        projects={projects}
        defaultProjectId={projectId}
      />
    </div>
  );
}