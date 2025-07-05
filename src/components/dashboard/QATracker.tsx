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
import { Bell, Plus, Bug, Loader2 } from 'lucide-react';
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
  status: 'open' | 'in-progress' | 'resolved';
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

export function QATracker() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { teamMembers } = useTeamMembers();
  const { projects } = useProjects();
  
  const [qaIssues, setQaIssues] = useState<QAIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'medium' as 'critical' | 'high' | 'medium' | 'low',
    assigned_tester_id: 'unassigned',
    project_id: 'no-project'
  });

  // Fetch QA issues
  const fetchQAIssues = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('qa_issues')
      .select(`
        *,
        assigned_tester:team_members(id, name, avatar_url),
        project:projects(id, name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching QA issues:', error);
      toast({
        title: "Error",
        description: "Failed to load QA issues",
        variant: "destructive"
      });
    } else {
      setQaIssues((data || []) as QAIssue[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQAIssues();
    
    // Listen for real-time updates
    const channel = supabase
      .channel('qa_issues_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'qa_issues'
      }, () => {
        fetchQAIssues();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
    open: qaIssues.filter(issue => issue.status === 'open').length,
    inProgress: qaIssues.filter(issue => issue.status === 'in-progress').length,
    resolved: qaIssues.filter(issue => issue.status === 'resolved').length
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create QA issues",
        variant: "destructive"
      });
      return;
    }

    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Issue title is required",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase
      .from('qa_issues')
      .insert({
        title: formData.title,
        description: formData.description,
        severity: formData.severity,
        assigned_tester_id: formData.assigned_tester_id === 'unassigned' ? null : formData.assigned_tester_id,
        project_id: formData.project_id === 'no-project' ? null : formData.project_id,
        created_by: user.id,
        status: 'open'
      });

    setIsSubmitting(false);

    if (error) {
      console.error('Error creating QA issue:', error);
      toast({
        title: "Error",
        description: "Failed to create QA issue",
        variant: "destructive"
      });
    } else {
      toast({
        title: "QA Issue Created",
        description: "Issue has been created successfully"
      });
      setFormData({
        title: '',
        description: '',
        severity: 'medium',
        assigned_tester_id: 'unassigned',
        project_id: 'no-project'
      });
      setIsModalOpen(false);
      fetchQAIssues();
    }
  };

  const updateIssueStatus = async (issueId: string, newStatus: 'open' | 'in-progress' | 'resolved') => {
    const { error } = await supabase
      .from('qa_issues')
      .update({ status: newStatus })
      .eq('id', issueId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update issue status",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Status Updated",
        description: `Issue status updated to ${newStatus.replace('-', ' ')}`
      });
      fetchQAIssues();
    }
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">Loading QA issues...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Bug className="w-4 h-4 text-white" />
            </div>
            QA Tracker
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {qaIssues.length} Total
            </Badge>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary text-white" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Issue
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-background border max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Create New QA Issue</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Issue Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter issue title..."
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the issue..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Severity</Label>
                      <Select value={formData.severity} onValueChange={(value: any) => setFormData(prev => ({ ...prev, severity: value }))}>
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
                      <Select value={formData.assigned_tester_id} onValueChange={(value) => setFormData(prev => ({ ...prev, assigned_tester_id: value }))}>
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
                    <Select value={formData.project_id} onValueChange={(value) => setFormData(prev => ({ ...prev, project_id: value }))}>
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
                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="gradient-primary text-white" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Issue'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
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

          {/* QA Issues List */}
          {qaIssues.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-4">No QA issues found</p>
              <Button onClick={() => setIsModalOpen(true)} className="gradient-primary text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Issue
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {qaIssues.map((issue) => (
                <div 
                  key={issue.id} 
                  className="p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(issue.severity)}>
                          {issue.severity}
                        </Badge>
                      </div>
                      <h4 className="font-medium group-hover:text-primary transition-colors">
                        {issue.title}
                      </h4>
                    </div>
                    <Select value={issue.status} onValueChange={(value: any) => updateIssueStatus(issue.id, value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[70]">
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {issue.description || 'No description provided'}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {issue.assigned_tester && (
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={issue.assigned_tester.avatar_url || ''} />
                            <AvatarFallback className="text-xs bg-warning/20 text-warning">
                              {issue.assigned_tester.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">
                            {issue.assigned_tester.name}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {issue.project && <span>{issue.project.name}</span>}
                      <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}