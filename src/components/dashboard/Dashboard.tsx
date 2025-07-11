import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Calendar, File, Folder, Bell as BellIcon, Plus, Bug, CheckCircle } from 'lucide-react';

import EnhancedKanbanBoard from './EnhancedKanbanBoard';
import { ProjectTracker } from './ProjectTracker';
import { QATracker } from './QATracker';
import { TeamRoleView } from './TeamRoleView';
import { CalendarIntegration } from './CalendarIntegration';
import { FileRepository } from './FileRepository';
import { MeetingNotes } from './MeetingNotes';
import { DesignNotes } from './DesignNotes';
import { MarketingCalendar } from './MarketingCalendar';
import { SearchBar } from './SearchBar';
import { UserProfile } from './UserProfile';
import { ProjectForm } from '@/components/forms/ProjectForm';
import { TeamMemberForm } from '@/components/forms/TeamMemberForm';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects } from '@/hooks/useProjects';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useTasks } from '@/hooks/useTasks';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

export function Dashboard() {
  const { signOut } = useAuth();
  const { projects } = useProjects();
  const { teamMembers } = useTeamMembers();
  const { tasks } = useTasks();
  const [activeView, setActiveView] = useState('overview');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [qaIssues, setQaIssues] = useState([]);
  const [testCases, setTestCases] = useState([]);

  // Fetch QA data
  const fetchQAData = async () => {
    try {
      const [issuesResponse, testCasesResponse] = await Promise.all([
        supabase.from('qa_issues').select('*'),
        supabase.from('test_cases').select('*')
      ]);
      
      if (issuesResponse.data) setQaIssues(issuesResponse.data);
      if (testCasesResponse.data) setTestCases(testCasesResponse.data);
    } catch (error) {
      console.error('Error fetching QA data:', error);
    }
  };

  useEffect(() => {
    fetchQAData();
  }, []);

  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const openIssues = tasks.filter(task => task.status === 'todo').length;

  // Calculate QA metrics
  const qaMetrics = {
    open: qaIssues.filter(issue => issue.status === 'open').length,
    inProgress: qaIssues.filter(issue => issue.status === 'in-progress').length,
    resolved: qaIssues.filter(issue => issue.status === 'resolved').length,
    cantReproduce: qaIssues.filter(issue => issue.status === 'cant-reproduce').length,
    rejected: qaIssues.filter(issue => issue.status === 'rejected').length,
    total: qaIssues.length
  };

  const testMetrics = {
    passed: testCases.filter(test => test.status === 'pass').length,
    failed: testCases.filter(test => test.status === 'fail').length,
    pending: testCases.filter(test => test.status === 'pending').length,
    retest: testCases.filter(test => test.status === 'retest').length,
    total: testCases.length
  };

  const qaProgress = qaMetrics.total > 0 ? ((qaMetrics.resolved + qaMetrics.cantReproduce + qaMetrics.rejected) / qaMetrics.total) * 100 : 0;
  const testProgress = testMetrics.total > 0 ? (testMetrics.passed / testMetrics.total) * 100 : 0;

  const quickStats = [
    { label: 'Active Projects', value: projects.length.toString(), change: '+12%', color: 'text-primary' },
    { label: 'Tasks Completed', value: completedTasks.toString(), change: '+8%', color: 'text-success' },
    { label: 'Team Members', value: teamMembers.length.toString(), change: '+2', color: 'text-accent-foreground' },
    { label: 'Open Issues', value: openIssues.toString(), change: '-23%', color: 'text-warning' }
  ];

  // Calculate upcoming deadlines from real projects
  const upcomingDeadlines = projects
    .filter(project => project.deadline && new Date(project.deadline) > new Date())
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 5)
    .map(project => ({
      project: project.name,
      deadline: new Date(project.deadline!).toLocaleDateString(),
      priority: project.status === 'delayed' ? 'high' : project.status === 'at-risk' ? 'medium' : 'low'
    }));

  const notifications = [
    { id: 1, type: 'task', message: 'New high-priority task assigned to you', time: '5m ago' },
    { id: 2, type: 'deadline', message: 'Project deadline approaching in 3 days', time: '1h ago' },
    { id: 3, type: 'comment', message: 'Sarah commented on your design mockup', time: '2h ago' },
    { id: 4, type: 'approval', message: 'Code review approved and merged', time: '4h ago' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">F</span>
                </div>
                <div>
                  <h1 className="font-bold text-xl">ThinkFlow</h1>
                  <p className="text-sm text-muted-foreground">Teams Collaboration and Project Management</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <SearchBar onResultSelect={(result) => console.log('Selected:', result)} />
              
              <Tabs value={activeView} onValueChange={setActiveView} className="w-auto">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                  <TabsTrigger value="team">Team</TabsTrigger>
                  <TabsTrigger value="qa">QA</TabsTrigger>
                  <TabsTrigger value="files">Files</TabsTrigger>
                  <TabsTrigger value="marketing">Marketing</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Button variant="ghost" size="sm" className="relative">
                <BellIcon className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-accent text-accent-foreground">
                  4
                </Badge>
              </Button>

              {/* User Profile */}
              <UserProfile />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeView} onValueChange={setActiveView}>
          <TabsContent value="overview" className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickStats.map((stat, index) => (
                <Card key={index} className="glass-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-3xl font-bold">{stat.value}</p>
                        <p className={`text-sm ${stat.color}`}>{stat.change}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* QA Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bug Tracking Overview */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                      <Bug className="w-4 h-4 text-white" />
                    </div>
                    Bug Tracking Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">{qaMetrics.total}</div>
                      <div className="text-xs text-muted-foreground">Total Bugs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-success">{qaProgress.toFixed(0)}%</div>
                      <div className="text-xs text-muted-foreground">Resolution Rate</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Overall Progress</span>
                      <span className="text-sm font-medium">{qaProgress.toFixed(0)}%</span>
                    </div>
                    <Progress value={qaProgress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-5 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-destructive/10">
                      <div className="text-sm font-bold text-destructive">{qaMetrics.open}</div>
                      <div className="text-xs text-muted-foreground">Open</div>
                    </div>
                    <div className="p-2 rounded-lg bg-warning/10">
                      <div className="text-sm font-bold text-warning">{qaMetrics.inProgress}</div>
                      <div className="text-xs text-muted-foreground">In Progress</div>
                    </div>
                    <div className="p-2 rounded-lg bg-success/10">
                      <div className="text-sm font-bold text-success">{qaMetrics.resolved}</div>
                      <div className="text-xs text-muted-foreground">Resolved</div>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/20">
                      <div className="text-sm font-bold text-muted-foreground">{qaMetrics.cantReproduce}</div>
                      <div className="text-xs text-muted-foreground">Can't Reproduce</div>
                    </div>
                    <div className="p-2 rounded-lg bg-secondary/10">
                      <div className="text-sm font-bold text-secondary-foreground">{qaMetrics.rejected}</div>
                      <div className="text-xs text-muted-foreground">Rejected</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Test Case Overview */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    Test Case Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">{testMetrics.total}</div>
                      <div className="text-xs text-muted-foreground">Total Tests</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-success">{testProgress.toFixed(0)}%</div>
                      <div className="text-xs text-muted-foreground">Pass Rate</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Test Progress</span>
                      <span className="text-sm font-medium">{testProgress.toFixed(0)}%</span>
                    </div>
                    <Progress value={testProgress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-success/10">
                      <div className="text-sm font-bold text-success">{testMetrics.passed}</div>
                      <div className="text-xs text-muted-foreground">Passed</div>
                    </div>
                    <div className="p-2 rounded-lg bg-destructive/10">
                      <div className="text-sm font-bold text-destructive">{testMetrics.failed}</div>
                      <div className="text-xs text-muted-foreground">Failed</div>
                    </div>
                    <div className="p-2 rounded-lg bg-warning/10">
                      <div className="text-sm font-bold text-warning">{testMetrics.pending}</div>
                      <div className="text-xs text-muted-foreground">Pending</div>
                    </div>
                    <div className="p-2 rounded-lg bg-primary/10">
                      <div className="text-sm font-bold text-primary">{testMetrics.retest}</div>
                      <div className="text-xs text-muted-foreground">Retest</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Enhanced Task Board */}
              <div className="lg:col-span-2">
                <EnhancedKanbanBoard />
              </div>

              {/* Right Column - Side Panels */}
              <div className="space-y-8">
                {/* Upcoming Deadlines */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Upcoming Deadlines
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {upcomingDeadlines.length > 0 ? (
                      upcomingDeadlines.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                          <div>
                            <p className="font-medium text-sm">{item.project}</p>
                            <p className="text-xs text-muted-foreground">{item.deadline}</p>
                          </div>
                          <Badge className={`text-xs ${
                            item.priority === 'high' ? 'bg-destructive/20 text-destructive' : 'bg-warning/20 text-warning'
                          }`}>
                            {item.priority}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
                        <p className="text-xs text-muted-foreground mt-1">All projects are on track!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      className="w-full justify-start gradient-primary text-white"
                      onClick={() => setShowProjectForm(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Project
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setShowTeamForm(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Team Member
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={signOut}
                    >
                      <File className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </CardContent>
                </Card>

                {/* Recent Notifications */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                        <p className="text-sm font-medium">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="projects">
            <ProjectTracker />
          </TabsContent>

          <TabsContent value="team">
            <TeamRoleView />
          </TabsContent>

          <TabsContent value="qa">
            <QATracker />
          </TabsContent>

          <TabsContent value="files" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FileRepository />
            <div className="space-y-8">
              <CalendarIntegration />
              <DesignNotes />
            </div>
          </TabsContent>

          <TabsContent value="marketing" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <MarketingCalendar />
            <MeetingNotes />
          </TabsContent>
        </Tabs>
      </main>

      {/* Forms */}
      <ProjectForm 
        isOpen={showProjectForm}
        onClose={() => setShowProjectForm(false)}
        onSuccess={() => {}}
      />
      <TeamMemberForm 
        isOpen={showTeamForm}
        onClose={() => setShowTeamForm(false)}
        onSuccess={() => {}}
      />
    </div>
  );
}