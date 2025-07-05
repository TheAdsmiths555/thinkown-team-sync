import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'progress' | 'testing' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  tags: string[];
  project_id: string | null;
  assignee_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined data
  assignee?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  project?: {
    id: string;
    name: string;
  };
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:team_members(id, name, avatar_url),
        project:projects(id, name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
    } else {
      setTasks((data || []) as Task[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();

    // Listen for real-time updates
    const channel = supabase
      .channel('tasks_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks'
      }, () => {
        fetchTasks();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { tasks, loading, refetch: fetchTasks };
}