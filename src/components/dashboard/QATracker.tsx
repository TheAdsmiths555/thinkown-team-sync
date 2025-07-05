import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

interface TestCase {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in-progress' | 'resolved';
  assignedTester: {
    name: string;
    avatar: string;
    initials: string;
  };
  createdDate: string;
  project: string;
}

const testCases: TestCase[] = [
  {
    id: 'TC-001',
    title: 'Login validation failure',
    description: 'Invalid credentials should display proper error message',
    severity: 'high',
    status: 'open',
    assignedTester: { name: 'Emma Wilson', avatar: '', initials: 'EW' },
    createdDate: '2024-01-14',
    project: 'ThinkOwn Teams v2.0'
  },
  {
    id: 'TC-002',
    title: 'Dashboard loading performance',
    description: 'Dashboard should load within 2 seconds',
    severity: 'medium',
    status: 'in-progress',
    assignedTester: { name: 'Tom Johnson', avatar: '', initials: 'TJ' },
    createdDate: '2024-01-13',
    project: 'ThinkOwn Teams v2.0'
  },
  {
    id: 'TC-003',
    title: 'Mobile responsive layout',
    description: 'Check layout compatibility across different screen sizes',
    severity: 'medium',
    status: 'resolved',
    assignedTester: { name: 'Emma Wilson', avatar: '', initials: 'EW' },
    createdDate: '2024-01-12',
    project: 'Mobile App MVP'
  },
  {
    id: 'TC-004',
    title: 'Data export functionality',
    description: 'CSV export should include all selected fields',
    severity: 'low',
    status: 'open',
    assignedTester: { name: 'Tom Johnson', avatar: '', initials: 'TJ' },
    createdDate: '2024-01-11',
    project: 'API Documentation Portal'
  },
  {
    id: 'TC-005',
    title: 'Security vulnerability scan',
    description: 'Critical security flaw in authentication system',
    severity: 'critical',
    status: 'in-progress',
    assignedTester: { name: 'Emma Wilson', avatar: '', initials: 'EW' },
    createdDate: '2024-01-15',
    project: 'ThinkOwn Teams v2.0'
  }
];

export function QATracker() {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-destructive/80 text-destructive-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-success/80 text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-muted text-muted-foreground';
      case 'in-progress': return 'bg-primary/20 text-primary border border-primary/30';
      case 'resolved': return 'bg-success/20 text-success border border-success/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const statusCounts = {
    open: testCases.filter(tc => tc.status === 'open').length,
    inProgress: testCases.filter(tc => tc.status === 'in-progress').length,
    resolved: testCases.filter(tc => tc.status === 'resolved').length
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-surface rounded-lg flex items-center justify-center">
              🧪
            </div>
            QA Tracker
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {testCases.length} Total
            </Badge>
            <Button variant="ghost" size="sm">
              <Bell className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Status Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 rounded-lg bg-muted/20">
              <div className="text-2xl font-bold text-muted-foreground">{statusCounts.open}</div>
              <div className="text-xs text-muted-foreground">Open</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-primary/10">
              <div className="text-2xl font-bold text-primary">{statusCounts.inProgress}</div>
              <div className="text-xs text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-success/10">
              <div className="text-2xl font-bold text-success">{statusCounts.resolved}</div>
              <div className="text-xs text-muted-foreground">Resolved</div>
            </div>
          </div>

          {/* Test Cases List */}
          <div className="space-y-3">
            {testCases.map((testCase) => (
              <div 
                key={testCase.id} 
                className="p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-muted-foreground">
                        {testCase.id}
                      </span>
                      <Badge className={getSeverityColor(testCase.severity)}>
                        {testCase.severity}
                      </Badge>
                    </div>
                    <h4 className="font-medium group-hover:text-primary transition-colors">
                      {testCase.title}
                    </h4>
                  </div>
                  <Badge className={getStatusColor(testCase.status)}>
                    {testCase.status.replace('-', ' ')}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {testCase.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={testCase.assignedTester.avatar} />
                        <AvatarFallback className="text-xs bg-warning/20 text-warning">
                          {testCase.assignedTester.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">
                        {testCase.assignedTester.name}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{testCase.project}</span>
                    <span>{testCase.createdDate}</span>
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