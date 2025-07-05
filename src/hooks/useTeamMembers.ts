import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TeamMember {
  id: string;
  name: string;
  role: 'Dev' | 'QA' | 'UI/UX' | 'BA';
  avatar_url: string | null;
  current_tasks: number;
  max_capacity: number;
  skills: string[];
  status: 'available' | 'busy' | 'overloaded';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function useTeamMembers() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeamMembers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching team members:', error);
    } else {
      setTeamMembers((data || []) as TeamMember[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTeamMembers();

    // Listen for real-time updates
    const channel = supabase
      .channel('team_members_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'team_members'
      }, () => {
        fetchTeamMembers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { teamMembers, loading, refetch: fetchTeamMembers };
}