import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Trash2, Archive, Save } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

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
  status: string;
}

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onArchive: (taskId: string) => void;
  teamMembers: Array<{ name: string; initials: string; avatar: string }>;
}

export function TaskModal({ task, isOpen, onClose, onSave, onDelete, onArchive, teamMembers }: TaskModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Task>(
    task || {
      id: '',
      title: '',
      description: '',
      assignee: { name: '', avatar: '', initials: '' },
      priority: 'medium',
      dueDate: new Date().toISOString().split('T')[0],
      tags: [],
      status: 'todo'
    }
  );
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task ? new Date(task.dueDate) : new Date()
  );
  const [newTag, setNewTag] = useState('');

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive"
      });
      return;
    }

    const updatedTask = {
      ...formData,
      dueDate: dueDate ? dueDate.toISOString().split('T')[0] : formData.dueDate,
      id: formData.id || Date.now().toString()
    };

    onSave(updatedTask);
    toast({
      title: "Task Saved",
      description: `Task "${updatedTask.title}" has been saved successfully.`
    });
    onClose();
  };

  const handleDelete = () => {
    if (task?.id) {
      onDelete(task.id);
      toast({
        title: "Task Deleted",
        description: `Task "${task.title}" has been deleted.`,
        variant: "destructive"
      });
      onClose();
    }
  };

  const handleArchive = () => {
    if (task?.id) {
      onArchive(task.id);
      toast({
        title: "Task Archived",
        description: `Task "${task.title}" has been archived.`
      });
      onClose();
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAssigneeChange = (memberName: string) => {
    const member = teamMembers.find(m => m.name === memberName);
    if (member) {
      setFormData(prev => ({
        ...prev,
        assignee: member
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {task ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter task title..."
              className="bg-input border-border"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter task description..."
              className="bg-input border-border min-h-[100px]"
            />
          </div>

          {/* Priority and Assignee Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={formData.priority} onValueChange={(value: 'high' | 'medium' | 'low') => 
                setFormData(prev => ({ ...prev, priority: value }))
              }>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Assignee</Label>
              <Select value={formData.assignee.name} onValueChange={handleAssigneeChange}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.name} value={member.name}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-input border-border",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                  {tag} ×
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                className="bg-input border-border"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Add
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button onClick={handleSave} className="gradient-primary text-white flex-1">
              <Save className="w-4 h-4 mr-2" />
              Save Task
            </Button>
            
            {task && (
              <>
                <Button onClick={handleArchive} variant="outline" className="flex-1">
                  <Archive className="w-4 h-4 mr-2" />
                  Archive
                </Button>
                <Button onClick={handleDelete} variant="destructive" className="flex-1">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}