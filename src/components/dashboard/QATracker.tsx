import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bell, Plus, Bug, Loader2, Upload, Filter, Search, FileText, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useProjects } from '@/hooks/useProjects';

interface QAIssue {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in-progress' | 'resolved' | 'cant-reproduce' | 'rejected';
  assigned_tester_id: string | null;
  project_id: string | null;
  created_at: string;
  assigned_tester?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  project?: {
    id: string;
    name: string;
  };
}

interface TestCase {
  id: string;
  title: string;
  test_type: 'functional' | 'ui' | 'api' | 'integration' | 'performance';
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'pass' | 'fail' | 'pending' | 'retest';
  assigned_tester_id: string | null;
  project_id: string | null;
  notes: string | null;
  screenshot_url: string | null;
  created_at: string;
  updated_at: string;
  assigned_tester?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  project?: {
    id: string;
    name: string;
  };
}

export function QATracker() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { teamMembers } = useTeamMembers();
  const { projects } = useProjects();
  
  // State for QA Issues
  const [qaIssues, setQaIssues] = useState<QAIssue[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bugs');
  
  // Modal states
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    project: 'all',
    tester: 'all',
    status: 'all',
    severity: 'all',
    testType: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form data states  
  const [bugFormData, setBugFormData] = useState({
    title: '',
    description: '',
    severity: 'medium' as 'critical' | 'high' | 'medium' | 'low',
    assigned_tester_id: 'unassigned',
    project_id: 'no-project'
  });

  const [testFormData, setTestFormData] = useState({
    title: '',
    test_type: 'functional' as 'functional' | 'ui' | 'api' | 'integration' | 'performance',
    severity: 'medium' as 'critical' | 'high' | 'medium' | 'low',
    assigned_tester_id: 'unassigned',
    project_id: 'no-project',
    notes: '',
    screenshot_url: ''
  });

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [issuesResponse, testCasesResponse] = await Promise.all([
        supabase
          .from('qa_issues')
          .select(`
            *,
            assigned_tester:team_members(id, name, avatar_url),
            project:projects(id, name)
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('test_cases')
          .select(`
            *,
            assigned_tester:team_members(id, name, avatar_url),
            project:projects(id, name)
          `)
          .order('created_at', { ascending: false })
      ]);

      if (issuesResponse.error) throw issuesResponse.error;
      if (testCasesResponse.error) throw testCasesResponse.error;

      setQaIssues((issuesResponse.data || []) as QAIssue[]);
      setTestCases((testCasesResponse.data || []) as TestCase[]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load QA data",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    
    // Real-time subscriptions
    const issuesChannel = supabase
      .channel('qa_issues_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'qa_issues'
      }, () => fetchData())
      .subscribe();

    const testCasesChannel = supabase
      .channel('test_cases_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'test_cases'
      }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(issuesChannel);
      supabase.removeChannel(testCasesChannel);
    };
  }, []);

  // Helper functions
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-destructive/80 text-destructive-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-success/80 text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string, type: 'bug' | 'test' = 'bug') => {
    if (type === 'bug') {
      switch (status) {
        case 'open': return 'bg-destructive/20 text-destructive border border-destructive/30';
        case 'in-progress': return 'bg-warning/20 text-warning border border-warning/30';
        case 'resolved': return 'bg-success/20 text-success border border-success/30';
        case 'cant-reproduce': return 'bg-muted/50 text-muted-foreground border border-muted';
        case 'rejected': return 'bg-secondary/20 text-secondary-foreground border border-secondary/30';
        default: return 'bg-muted text-muted-foreground';
      }
    } else {
      switch (status) {
        case 'pass': return 'bg-success/20 text-success border border-success/30';
        case 'fail': return 'bg-destructive/20 text-destructive border border-destructive/30';
        case 'pending': return 'bg-warning/20 text-warning border border-warning/30';
        case 'retest': return 'bg-primary/20 text-primary border border-primary/30';
        default: return 'bg-muted text-muted-foreground';
      }
    }
  };

  // Filter functions
  const filteredBugs = qaIssues.filter(bug => {
    const matchesSearch = bug.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bug.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = filters.project === 'all' || bug.project_id === filters.project;
    const matchesTester = filters.tester === 'all' || bug.assigned_tester_id === filters.tester;
    const matchesStatus = filters.status === 'all' || bug.status === filters.status;
    const matchesSeverity = filters.severity === 'all' || bug.severity === filters.severity;
    
    return matchesSearch && matchesProject && matchesTester && matchesStatus && matchesSeverity;
  });

  const filteredTestCases = testCases.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = filters.project === 'all' || test.project_id === filters.project;
    const matchesTester = filters.tester === 'all' || test.assigned_tester_id === filters.tester;
    const matchesStatus = filters.status === 'all' || test.status === filters.status;
    const matchesSeverity = filters.severity === 'all' || test.severity === filters.severity;
    const matchesType = filters.testType === 'all' || test.test_type === filters.testType;
    
    return matchesSearch && matchesProject && matchesTester && matchesStatus && matchesSeverity && matchesType;
  });

  // Submit handlers
  const handleBugSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create bug reports",
        variant: "destructive"
      });
      return;
    }

    if (!bugFormData.title.trim()) {
      toast({
        title: "Error",
        description: "Bug title is required",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase
      .from('qa_issues')
      .insert({
        title: bugFormData.title,
        description: bugFormData.description,
        severity: bugFormData.severity,
        assigned_tester_id: bugFormData.assigned_tester_id === 'unassigned' ? null : bugFormData.assigned_tester_id,
        project_id: bugFormData.project_id === 'no-project' ? null : bugFormData.project_id,
        created_by: user.id,
        status: 'open'
      });

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create bug report",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Bug Report Created",
        description: "Bug report has been created successfully"
      });
      setBugFormData({
        title: '',
        description: '',
        severity: 'medium',
        assigned_tester_id: 'unassigned',
        project_id: 'no-project'
      });
      setIsBugModalOpen(false);
    }
  };

  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create test cases",
        variant: "destructive"
      });
      return;
    }

    if (!testFormData.title.trim()) {
      toast({
        title: "Error",
        description: "Test case title is required",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase
      .from('test_cases')
      .insert({
        title: testFormData.title,
        test_type: testFormData.test_type,
        severity: testFormData.severity,
        assigned_tester_id: testFormData.assigned_tester_id === 'unassigned' ? null : testFormData.assigned_tester_id,
        project_id: testFormData.project_id === 'no-project' ? null : testFormData.project_id,
        notes: testFormData.notes,
        screenshot_url: testFormData.screenshot_url || null,
        created_by: user.id,
        status: 'pending'
      });

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create test case",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Test Case Created",
        description: "Test case has been created successfully"
      });
      setTestFormData({
        title: '',
        test_type: 'functional',
        severity: 'medium',
        assigned_tester_id: 'unassigned',
        project_id: 'no-project',
        notes: '',
        screenshot_url: ''
      });
      setIsTestModalOpen(false);
    }
  };

  const updateBugStatus = async (bugId: string, newStatus: QAIssue['status']) => {
    const { error } = await supabase
      .from('qa_issues')
      .update({ status: newStatus })
      .eq('id', bugId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update bug status",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Status Updated",
        description: `Bug status updated to ${newStatus.replace('-', ' ')}`
      });
    }
  };

  const updateTestStatus = async (testId: string, newStatus: TestCase['status']) => {
    const { error } = await supabase
      .from('test_cases')
      .update({ status: newStatus })
      .eq('id', testId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update test case status",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Status Updated",
        description: `Test case status updated to ${newStatus}`
      });
    }
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">Loading QA data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <Bug className="w-4 h-4 text-white" />
              </div>
              QA Management System
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="bugs" className="flex items-center gap-2">
                <Bug className="w-4 h-4" />
                Bug Reports ({qaIssues.length})
              </TabsTrigger>
              <TabsTrigger value="tests" className="flex items-center gap-2">
                <TestTube className="w-4 h-4" />
                Test Cases ({testCases.length})
              </TabsTrigger>
            </TabsList>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 my-4 p-4 bg-muted/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48"
                />
              </div>
              
              <Select value={filters.project} onValueChange={(value) => setFilters(prev => ({ ...prev, project: value }))}>
                <SelectTrigger className="w-40">
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

              <Select value={filters.tester} onValueChange={(value) => setFilters(prev => ({ ...prev, tester: value }))}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Testers</SelectItem>
                  {teamMembers.filter(member => member.role === 'QA').map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {activeTab === 'bugs' ? (
                    <>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="cant-reproduce">Can't Reproduce</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="pass">Pass</SelectItem>
                      <SelectItem value="fail">Fail</SelectItem>
                      <SelectItem value="retest">Retest</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>

              {activeTab === 'tests' && (
                <Select value={filters.testType} onValueChange={(value) => setFilters(prev => ({ ...prev, testType: value }))}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Test Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="functional">Functional</SelectItem>
                    <SelectItem value="ui">UI</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="integration">Integration</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            <TabsContent value="bugs" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Bug Reports</h3>
                <Dialog open={isBugModalOpen} onOpenChange={setIsBugModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="gradient-primary text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Report Bug
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-background border max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-foreground">Report New Bug</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleBugSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="bug-title">Bug Title *</Label>
                        <Input
                          id="bug-title"
                          value={bugFormData.title}
                          onChange={(e) => setBugFormData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter bug title..."
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bug-description">Description</Label>
                        <Textarea
                          id="bug-description"
                          value={bugFormData.description}
                          onChange={(e) => setBugFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe the bug..."
                          rows={3}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Severity</Label>
                          <Select value={bugFormData.severity} onValueChange={(value: any) => setBugFormData(prev => ({ ...prev, severity: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="z-[70]">
                              <SelectItem value="critical">Critical</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Assign Tester</Label>
                          <Select value={bugFormData.assigned_tester_id} onValueChange={(value) => setBugFormData(prev => ({ ...prev, assigned_tester_id: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select tester" />
                            </SelectTrigger>
                            <SelectContent className="z-[70]">
                              <SelectItem value="unassigned">Unassigned</SelectItem>
                              {teamMembers.filter(member => member.role === 'QA').map((member) => (
                                <SelectItem key={member.id} value={member.id}>
                                  {member.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Project</Label>
                        <Select value={bugFormData.project_id} onValueChange={(value) => setBugFormData(prev => ({ ...prev, project_id: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select project" />
                          </SelectTrigger>
                          <SelectContent className="z-[70]">
                            <SelectItem value="no-project">No Project</SelectItem>
                            {projects.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsBugModalOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" className="gradient-primary text-white" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            'Create Bug Report'
                          )}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {filteredBugs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bug className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-4">No bug reports found</p>
                  <Button onClick={() => setIsBugModalOpen(true)} className="gradient-primary text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Report Your First Bug
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredBugs.map((bug) => (
                    <div 
                      key={bug.id} 
                      className="p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-all duration-200 group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className={getSeverityColor(bug.severity)}>
                              {bug.severity}
                            </Badge>
                            <Badge className={getStatusColor(bug.status, 'bug')}>
                              {bug.status.replace('-', ' ')}
                            </Badge>
                          </div>
                          <h4 className="font-medium group-hover:text-primary transition-colors">
                            {bug.title}
                          </h4>
                        </div>
                        <Select value={bug.status} onValueChange={(value: any) => updateBugStatus(bug.id, value)}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="z-[70]">
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="cant-reproduce">Can't Reproduce</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {bug.description || 'No description provided'}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          {bug.assigned_tester && (
                            <div className="flex items-center gap-2">
                              <Avatar className="w-5 h-5">
                                <AvatarImage src={bug.assigned_tester.avatar_url || ''} />
                                <AvatarFallback className="text-xs bg-warning/20 text-warning">
                                  {bug.assigned_tester.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span>{bug.assigned_tester.name}</span>
                            </div>
                          )}
                          {bug.project && <span>• {bug.project.name}</span>}
                        </div>
                        <span>{new Date(bug.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="tests" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Test Cases</h3>
                <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="gradient-primary text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Test Case
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-background border max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-foreground">Create New Test Case</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleTestSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="test-title">Test Title *</Label>
                        <Input
                          id="test-title"
                          value={testFormData.title}
                          onChange={(e) => setTestFormData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter test case title..."
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Test Type</Label>
                          <Select value={testFormData.test_type} onValueChange={(value: any) => setTestFormData(prev => ({ ...prev, test_type: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="z-[70]">
                              <SelectItem value="functional">Functional</SelectItem>
                              <SelectItem value="ui">UI</SelectItem>
                              <SelectItem value="api">API</SelectItem>
                              <SelectItem value="integration">Integration</SelectItem>
                              <SelectItem value="performance">Performance</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Severity</Label>
                          <Select value={testFormData.severity} onValueChange={(value: any) => setTestFormData(prev => ({ ...prev, severity: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="z-[70]">
                              <SelectItem value="critical">Critical</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Assign Tester</Label>
                          <Select value={testFormData.assigned_tester_id} onValueChange={(value) => setTestFormData(prev => ({ ...prev, assigned_tester_id: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select tester" />
                            </SelectTrigger>
                            <SelectContent className="z-[70]">
                              <SelectItem value="unassigned">Unassigned</SelectItem>
                              {teamMembers.filter(member => member.role === 'QA').map((member) => (
                                <SelectItem key={member.id} value={member.id}>
                                  {member.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Project</Label>
                          <Select value={testFormData.project_id} onValueChange={(value) => setTestFormData(prev => ({ ...prev, project_id: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select project" />
                            </SelectTrigger>
                            <SelectContent className="z-[70]">
                              <SelectItem value="no-project">No Project</SelectItem>
                              {projects.map((project) => (
                                <SelectItem key={project.id} value={project.id}>
                                  {project.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="test-notes">Notes / Test Steps</Label>
                        <Textarea
                          id="test-notes"
                          value={testFormData.notes}
                          onChange={(e) => setTestFormData(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Describe test steps, expected results..."
                          rows={3}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="screenshot">Screenshot URL</Label>
                        <div className="flex gap-2">
                          <Input
                            id="screenshot"
                            value={testFormData.screenshot_url}
                            onChange={(e) => setTestFormData(prev => ({ ...prev, screenshot_url: e.target.value }))}
                            placeholder="Enter screenshot URL..."
                          />
                          <Button type="button" variant="outline" size="sm">
                            <Upload className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsTestModalOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" className="gradient-primary text-white" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            'Create Test Case'
                          )}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {filteredTestCases.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TestTube className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-4">No test cases found</p>
                  <Button onClick={() => setIsTestModalOpen(true)} className="gradient-primary text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Test Case
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test Title</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned Tester</TableHead>
                      <TableHead>Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTestCases.map((test) => (
                      <TableRow key={test.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-medium">{test.title}</div>
                            {test.notes && (
                              <div className="text-xs text-muted-foreground mt-1 truncate max-w-48">
                                {test.notes}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {test.project ? (
                            <Badge variant="outline" className="text-xs">
                              {test.project.name}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">No Project</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {test.test_type.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getSeverityColor(test.severity)}>
                            {test.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select value={test.status} onValueChange={(value: any) => updateTestStatus(test.id, value)}>
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="z-[70]">
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="pass">Pass</SelectItem>
                              <SelectItem value="fail">Fail</SelectItem>
                              <SelectItem value="retest">Retest</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {test.assigned_tester ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={test.assigned_tester.avatar_url || ''} />
                                <AvatarFallback className="text-xs bg-warning/20 text-warning">
                                  {test.assigned_tester.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{test.assigned_tester.name}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(test.updated_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}