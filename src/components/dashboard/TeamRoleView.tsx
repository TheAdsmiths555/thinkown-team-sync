import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

interface TeamMember {
  id: string;
  name: string;
  role: 'Dev' | 'QA' | 'UI/UX' | 'BA';
  avatar: string;
  initials: string;
  currentTasks: number;
  maxCapacity: number;
  activeProjects: string[];
  skills: string[];
  status: 'available' | 'busy' | 'overloaded';
}

const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Alex Chen',
    role: 'Dev',
    avatar: '',
    initials: 'AC',
    currentTasks: 6,
    maxCapacity: 8,
    activeProjects: ['ThinkOwn Teams v2.0', 'API Documentation'],
    skills: ['React', 'Node.js', 'TypeScript'],
    status: 'busy'
  },
  {
    id: '2',
    name: 'Sarah Kim',
    role: 'UI/UX',
    avatar: '',
    initials: 'SK',
    currentTasks: 4,
    maxCapacity: 6,
    activeProjects: ['ThinkOwn Teams v2.0', 'Mobile App MVP'],
    skills: ['Figma', 'Design Systems', 'Prototyping'],
    status: 'available'
  },
  {
    id: '3',
    name: 'Mike Rodriguez',
    role: 'Dev',
    avatar: '',
    initials: 'MR',
    currentTasks: 9,
    maxCapacity: 8,
    activeProjects: ['ThinkOwn Teams v2.0', 'Mobile App MVP', 'Infrastructure'],
    skills: ['Python', 'AWS', 'Docker'],
    status: 'overloaded'
  },
  {
    id: '4',
    name: 'Emma Wilson',
    role: 'QA',
    avatar: '',
    initials: 'EW',
    currentTasks: 5,
    maxCapacity: 7,
    activeProjects: ['ThinkOwn Teams v2.0', 'Mobile App MVP'],
    skills: ['Automation', 'Test Planning', 'Selenium'],
    status: 'busy'
  },
  {
    id: '5',
    name: 'Rachel Green',
    role: 'BA',
    avatar: '',
    initials: 'RG',
    currentTasks: 3,
    maxCapacity: 5,
    activeProjects: ['API Documentation', 'Requirements Analysis'],
    skills: ['Requirements', 'Documentation', 'Stakeholder Management'],
    status: 'available'
  },
  {
    id: '6',
    name: 'David Park',
    role: 'Dev',
    avatar: '',
    initials: 'DP',
    currentTasks: 7,
    maxCapacity: 8,
    activeProjects: ['Mobile App MVP', 'DevOps'],
    skills: ['React Native', 'Flutter', 'CI/CD'],
    status: 'busy'
  }
];

export function TeamRoleView() {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Dev': return 'role-dev';
      case 'QA': return 'role-qa';
      case 'UI/UX': return 'role-design';
      case 'BA': return 'role-ba';
      default: return 'bg-muted text-muted-foreground';
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

  const getWorkloadColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage > 100) return 'bg-destructive';
    if (percentage > 80) return 'bg-warning';
    return 'bg-primary';
  };

  const roleStats = {
    Dev: teamMembers.filter(m => m.role === 'Dev').length,
    QA: teamMembers.filter(m => m.role === 'QA').length,
    'UI/UX': teamMembers.filter(m => m.role === 'UI/UX').length,
    BA: teamMembers.filter(m => m.role === 'BA').length
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-surface rounded-lg flex items-center justify-center">
              👥
            </div>
            Team Overview
          </div>
          <div className="text-sm text-muted-foreground">
            {teamMembers.length} Members
          </div>
        </CardTitle>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamMembers.map((member) => (
              <div 
                key={member.id}
                className="p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-all duration-200 group"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className={`text-sm ${getRoleColor(member.role)}`}>
                          {member.initials}
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
                    <Badge className={getStatusColor(member.status)}>
                      {member.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Workload</span>
                      <span className="font-medium">
                        {member.currentTasks}/{member.maxCapacity} tasks
                      </span>
                    </div>
                    <Progress 
                      value={(member.currentTasks / member.maxCapacity) * 100} 
                      className="h-2"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Skills:</div>
                    <div className="flex flex-wrap gap-1">
                      {member.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Active Projects:</div>
                    <div className="space-y-1">
                      {member.activeProjects.map((project) => (
                        <div key={project} className="text-sm px-2 py-1 rounded bg-muted/20">
                          {project}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}