import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, UserMinus, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTeamMembers, TeamMember } from '@/hooks/useTeamMembers';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ProjectTeamTabProps {
  projectId: string;
}

interface ProjectTeamMember {
  id: string;
  project_id: string;
  team_member_id: string;
  created_at: string;
  team_member: TeamMember;
}

export function ProjectTeamTab({ projectId }: ProjectTeamTabProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { teamMembers } = useTeamMembers();
  const [projectTeamMembers, setProjectTeamMembers] = useState<ProjectTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');

  const fetchProjectTeamMembers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('project_team_members')
      .select(`
        *,
        team_member:team_members(*)
      `)
      .eq('project_id', projectId);

    if (error) {
      console.error('Error fetching project team members:', error);
      toast({
        title: "Error",
        description: "Failed to load team members",
        variant: "destructive"
      });
    } else {
      setProjectTeamMembers((data || []) as ProjectTeamMember[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjectTeamMembers();

    // Listen for real-time updates
    const channel = supabase
      .channel('project_team_members_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'project_team_members',
        filter: `project_id=eq.${projectId}`
      }, () => {
        fetchProjectTeamMembers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const availableMembers = teamMembers.filter(member => 
    !projectTeamMembers.some(ptm => ptm.team_member_id === member.id)
  );

  const handleAddMember = async () => {
    if (!selectedMemberId || !user) return;

    const { error } = await supabase
      .from('project_team_members')
      .insert({
        project_id: projectId,
        team_member_id: selectedMemberId
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add team member to project",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Team member added to project successfully"
      });
      setIsModalOpen(false);
      setSelectedMemberId('');
      fetchProjectTeamMembers();
    }
  };

  const handleRemoveMember = async (membershipId: string, memberName: string) => {
    const { error } = await supabase
      .from('project_team_members')
      .delete()
      .eq('id', membershipId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove team member from project",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: `${memberName} removed from project`
      });
      fetchProjectTeamMembers();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-success/20 text-success';
      case 'busy': return 'bg-warning/20 text-warning';
      case 'unavailable': return 'bg-destructive/20 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">Loading team members...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Project Team</h3>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Team Member to Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Team Member</Label>
                <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        <div className="flex items-center gap-2">
                          <span>{member.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {member.role}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {availableMembers.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  All team members are already assigned to this project.
                </p>
              )}
              
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleAddMember} 
                  className="gradient-primary text-white flex-1"
                  disabled={!selectedMemberId}
                >
                  Add to Project
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {projectTeamMembers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No team members assigned to this project.</p>
            <p className="text-sm text-muted-foreground mt-2">Add team members to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projectTeamMembers.map((projectMember) => (
            <Card key={projectMember.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={projectMember.team_member.avatar_url || ''} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {projectMember.team_member.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-base">{projectMember.team_member.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {projectMember.team_member.role}
                      </Badge>
                      <Badge className={`text-xs ${getStatusColor(projectMember.team_member.status || 'available')}`}>
                        {projectMember.team_member.status || 'available'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projectMember.team_member.skills && projectMember.team_member.skills.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {projectMember.team_member.skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      Capacity: {projectMember.team_member.current_tasks || 0}/{projectMember.team_member.max_capacity || 8}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveMember(projectMember.id, projectMember.team_member.name)}
                      className="text-destructive hover:text-destructive"
                    >
                      <UserMinus className="w-3 h-3 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}