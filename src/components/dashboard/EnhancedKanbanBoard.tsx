import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar, Circle, Filter, Plus, Search, SortAsc } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTasks, Task } from '@/hooks/useTasks';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useProjects } from '@/hooks/useProjects';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { RealTaskModal } from './RealTaskModal';

interface Column {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
}

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

function TaskCard({ task, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'medium': return 'bg-warning/20 text-warning border-warning/30';
      case 'low': return 'bg-success/20 text-success border-success/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
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
            <Badge className={`text-xs ${getPriorityColor(task.priority || 'medium')}`}>
              {task.priority || 'medium'}
            </Badge>
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
  );
}

export function EnhancedKanbanBoard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { tasks, loading: tasksLoading, refetch: refetchTasks } = useTasks();
  const { teamMembers, loading: teamLoading } = useTeamMembers();
  const { projects } = useProjects();
  
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('due_date');

  // Define columns structure
  const columns: Column[] = [
    {
      id: 'todo',
      title: 'To Do',
      color: 'status-todo',
      tasks: tasks.filter(task => task.status === 'todo')
    },
    {
      id: 'progress',
      title: 'In Progress',
      color: 'status-progress',
      tasks: tasks.filter(task => task.status === 'progress')
    },
    {
      id: 'testing',
      title: 'Testing',
      color: 'status-testing',
      tasks: tasks.filter(task => task.status === 'testing')
    },
    {
      id: 'completed',
      title: 'Completed',
      color: 'status-completed',
      tasks: tasks.filter(task => task.status === 'completed')
    }
  ];

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id as string);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTaskId = active.id as string;
    const overColumnId = over.id as string;

    const task = tasks.find(t => t.id === activeTaskId);
    if (!task || task.status === overColumnId) return;

    // Update task status in database
    const { error } = await supabase
      .from('tasks')
      .update({ status: overColumnId })
      .eq('id', activeTaskId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive"
      });
    } else {
      refetchTasks();
      toast({
        title: "Task Moved",
        description: `Task moved to ${columns.find(c => c.id === overColumnId)?.title}`
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

  const filteredColumns = columns.map(column => ({
    ...column,
    tasks: column.tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.assignee?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      const matchesAssignee = filterAssignee === 'all' || task.assignee?.name === filterAssignee;
      
      return matchesSearch && matchesPriority && matchesAssignee;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'due_date':
          const dateA = a.due_date ? new Date(a.due_date).getTime() : 0;
          const dateB = b.due_date ? new Date(b.due_date).getTime() : 0;
          return dateA - dateB;
        case 'priority':
          const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
          return (priorityOrder[b.priority as keyof typeof priorityOrder] || 2) - 
                 (priorityOrder[a.priority as keyof typeof priorityOrder] || 2);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    })
  }));

  if (tasksLoading || teamLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">Loading tasks...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Circle className="w-4 h-4 text-white" />
            </div>
            Enhanced Task Board
          </CardTitle>

          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>

            {/* Filters */}
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full sm:w-32">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterAssignee} onValueChange={setFilterAssignee}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                {teamMembers.map(member => (
                  <SelectItem key={member.id} value={member.name}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-32">
                <SortAsc className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="due_date">Due Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleCreateTask} className="gradient-primary text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <DndContext
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredColumns.map((column) => (
              <div key={column.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{column.title}</h3>
                  <Badge variant="outline" className="text-xs">
                    {column.tasks.length}
                  </Badge>
                </div>
                
                <SortableContext
                  items={column.tasks.map(task => task.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3 min-h-[200px] p-2 rounded-lg border-2 border-dashed border-border/50">
                    {column.tasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onClick={() => handleTaskClick(task)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </div>
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <TaskCard task={activeTask} onClick={() => {}} />
            ) : null}
          </DragOverlay>
        </DndContext>
      </CardContent>

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
    </Card>
  );
}