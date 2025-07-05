import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Calendar, Circle, Filter, Plus, Search, SortAsc, MoreVertical, Edit, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTasks, Task } from '@/hooks/useTasks';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useProjects } from '@/hooks/useProjects';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { RealTaskModal } from './RealTaskModal';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onStatusChange: (taskId: string, newStatus: string) => void;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
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
                  {task.assignee?.name?.substring(0, 2).toUpperCase() || 'UN'}
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

export default function EnhancedKanbanBoard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { tasks, loading: tasksLoading, refetch: refetchTasks } = useTasks();
  const { teamMembers } = useTeamMembers();
  const { projects } = useProjects();
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');

  // Filter and sort tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesAssignee = assigneeFilter === 'all' || task.assignee_id === assigneeFilter;
    const matchesProject = projectFilter === 'all' || task.project_id === projectFilter;
    
    return matchesSearch && matchesPriority && matchesAssignee && matchesProject;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
               (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
      case 'due_date':
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  // Define columns structure
  const columns: Column[] = [
    {
      id: 'todo',
      title: 'To Do',
      tasks: filteredTasks.filter(task => task.status === 'todo')
    },
    {
      id: 'progress',
      title: 'In Progress',
      tasks: filteredTasks.filter(task => task.status === 'progress')
    },
    {
      id: 'testing',
      title: 'Testing',
      tasks: filteredTasks.filter(task => task.status === 'testing')
    },
    {
      id: 'hold',
      title: 'Hold',
      tasks: filteredTasks.filter(task => task.status === 'hold')
    },
    {
      id: 'completed',
      title: 'Completed',
      tasks: filteredTasks.filter(task => task.status === 'completed')
    }
  ];

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    const task = tasks.find(t => t.id === taskId);
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

  const clearFilters = () => {
    setSearchTerm('');
    setPriorityFilter('all');
    setAssigneeFilter('all');
    setProjectFilter('all');
    setSortBy('created_at');
  };

  if (!user) {
    return (
      <Card className="glass-card p-8 text-center">
        <CardContent>
          <p className="text-muted-foreground">Please log in to view your kanban board.</p>
        </CardContent>
      </Card>
    );
  }

  if (tasksLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">Loading tasks...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Enhanced Kanban Board</span>
            <Button onClick={handleCreateTask} className="gradient-primary text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-input border-border"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px] bg-input border-border">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                <SelectTrigger className="w-[140px] bg-input border-border">
                  <SelectValue placeholder="Assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignees</SelectItem>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-[140px] bg-input border-border">
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px] bg-input border-border">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Created Date</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="due_date">Due Date</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={clearFilters}>
                <Filter className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>

          {/* Task Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {columns.map((column) => (
              <div key={column.id} className="text-center">
                <div className="text-2xl font-bold text-primary">{column.tasks.length}</div>
                <div className="text-sm text-muted-foreground">{column.title}</div>
              </div>
            ))}
          </div>

          {/* Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {columns.map((column) => (
              <div key={column.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{column.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {column.tasks.length}
                  </Badge>
                </div>
                
                <div className="space-y-3 min-h-[400px] p-2 rounded-lg border-2 border-dashed border-border/50">
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
        </CardContent>
      </Card>

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
      />
    </div>
  );
}