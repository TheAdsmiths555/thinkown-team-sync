import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useTasks } from '@/hooks/useTasks';
import { TeamMemberForm } from '@/components/forms/TeamMemberForm';

export function TeamRoleView() {
  const { teamMembers, loading: teamLoading } = useTeamMembers();
  const { tasks } = useTasks();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Dev': return 'bg-blue/20 text-blue border-blue/30';
      case 'QA': return 'bg-orange/20 text-orange border-orange/30';
      case 'UI/UX': return 'bg-purple/20 text-purple border-purple/30';
      case 'BA': return 'bg-green/20 text-green border-green/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-success/20 text-success';
      case 'busy': return 'bg-warning/20 text-warning';
      case 'overloaded': return 'bg-destructive/20 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getMemberStats = (memberId: string) => {
    const memberTasks = tasks.filter(task => task.assignee_id === memberId);
    const activeTasks = memberTasks.filter(task => task.status !== 'completed').length;
    const completedTasks = memberTasks.filter(task => task.status === 'completed').length;
    
    return {
      activeTasks,
      completedTasks,
      totalTasks: memberTasks.length
    };
  };

  const getMemberStatus = (currentTasks: number, maxCapacity: number) => {
    const percentage = (currentTasks / maxCapacity) * 100;
    if (percentage > 100) return 'overloaded';
    if (percentage > 80) return 'busy';
    return 'available';
  };

  const roleStats = {
    Dev: teamMembers.filter(m => m.role === 'Dev').length,
    QA: teamMembers.filter(m => m.role === 'QA').length,
    'UI/UX': teamMembers.filter(m => m.role === 'UI/UX').length,
    BA: teamMembers.filter(m => m.role === 'BA').length
  };

  if (teamLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">Loading team members...</div>
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
              <Users className="w-4 h-4 text-white" />
            </div>
            Team Overview
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              {teamMembers.length} Members
            </div>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="gradient-primary text-white"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Role Distribution */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(roleStats).map(([role, count]) => (
              <div key={role} className="text-center p-3 rounded-lg bg-muted/10">
                <div className="text-xl font-bold">{count}</div>
                <Badge className={`text-xs ${getRoleColor(role)}`}>
                  {role}
                </Badge>
              </div>
            ))}
          </div>

          {/* Team Members */}
          {teamMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-4">No team members found</p>
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="gradient-primary text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Team Member
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers.map((member) => {
                const stats = getMemberStats(member.id);
                const status = getMemberStatus(stats.activeTasks, member.max_capacity || 8);
                const workloadPercentage = ((stats.activeTasks) / (member.max_capacity || 8)) * 100;
                
                return (
                  <div 
                    key={member.id}
                    className="p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-all duration-200 group"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={member.avatar_url || ''} />
                            <AvatarFallback className="text-sm bg-primary/20 text-primary">
                              {member.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium group-hover:text-primary transition-colors">
                              {member.name}
                            </h4>
                            <Badge className={`text-xs ${getRoleColor(member.role)}`}>
                              {member.role}
                            </Badge>
                          </div>
                        </div>
                        <Badge className={getStatusColor(status)}>
                          {status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Current Workload</span>
                          <span className="font-medium">
                            {stats.activeTasks}/{member.max_capacity || 8} tasks
                          </span>
                        </div>
                        <Progress 
                          value={Math.min(workloadPercentage, 100)} 
                          className="h-2"
                        />
                      </div>
                      
                      {member.skills && member.skills.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">Skills:</div>
                          <div className="flex flex-wrap gap-1">
                            {member.skills.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {member.skills.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{member.skills.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Completed: {stats.completedTasks}</span>
                        <span>Total: {stats.totalTasks}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
      
      <TeamMemberForm 
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSuccess={() => setShowCreateForm(false)}
      />
    </Card>
  );
}