import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Bug, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ProjectQATabProps {
  projectId: string;
}

interface QAIssue {
  id: string;
  title: string;
  description: string | null;
  severity: string;
  status: string;
  project_id: string;
  assigned_tester_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  assigned_tester?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}

export function ProjectQATab({ projectId }: ProjectQATabProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { teamMembers } = useTeamMembers();
  const [qaIssues, setQaIssues] = useState<QAIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<QAIssue | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'medium',
    status: 'open',
    assigned_tester_id: ''
  });

  const fetchQAIssues = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('qa_issues')
      .select(`
        *,
        assigned_tester:team_members(id, name, avatar_url)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching QA issues:', error);
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
        table: 'qa_issues',
        filter: `project_id=eq.${projectId}`
      }, () => {
        fetchQAIssues();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-destructive/20 text-destructive';
      case 'medium': return 'bg-warning/20 text-warning';
      case 'low': return 'bg-success/20 text-success';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Bug className="w-4 h-4" />;
      case 'in_progress': return <AlertTriangle className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <XCircle className="w-4 h-4" />;
      default: return <Bug className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-destructive/20 text-destructive';
      case 'in_progress': return 'bg-warning/20 text-warning';
      case 'resolved': return 'bg-success/20 text-success';
      case 'closed': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const issueData = {
      ...formData,
      project_id: projectId,
      created_by: user.id,
      assigned_tester_id: formData.assigned_tester_id || null
    };

    let result;
    if (selectedIssue) {
      // Update existing issue
      result = await supabase
        .from('qa_issues')
        .update(issueData)
        .eq('id', selectedIssue.id);
    } else {
      // Create new issue
      result = await supabase
        .from('qa_issues')
        .insert([issueData]);
    }

    if (result.error) {
      toast({
        title: "Error",
        description: `Failed to ${selectedIssue ? 'update' : 'create'} QA issue`,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: `QA issue ${selectedIssue ? 'updated' : 'created'} successfully`
      });
      setIsModalOpen(false);
      resetForm();
      fetchQAIssues();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      severity: 'medium',
      status: 'open',
      assigned_tester_id: ''
    });
    setSelectedIssue(null);
  };

  const openEditModal = (issue: QAIssue) => {
    setSelectedIssue(issue);
    setFormData({
      title: issue.title,
      description: issue.description || '',
      severity: issue.severity,
      status: issue.status,
      assigned_tester_id: issue.assigned_tester_id || ''
    });
    setIsModalOpen(true);
  };

  const deleteIssue = async (issueId: string) => {
    const { error } = await supabase
      .from('qa_issues')
      .delete()
      .eq('id', issueId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete QA issue",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "QA issue deleted successfully"
      });
      fetchQAIssues();
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">Loading QA issues...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">QA Issues & Testing</h3>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-white" onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              New QA Issue
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-background border border-border">
            <DialogHeader>
              <DialogTitle>
                {selectedIssue ? 'Edit QA Issue' : 'Create QA Issue'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="severity">Severity</Label>
                <Select 
                  value={formData.severity} 
                  onValueChange={(value) => setFormData({ ...formData, severity: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="assigned_tester">Assigned Tester</Label>
                <Select 
                  value={formData.assigned_tester_id} 
                  onValueChange={(value) => setFormData({ ...formData, assigned_tester_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {teamMembers
                      .filter(member => member.role === 'QA')
                      .map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="gradient-primary text-white flex-1">
                  {selectedIssue ? 'Update' : 'Create'} Issue
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {qaIssues.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No QA issues found for this project.</p>
            <p className="text-sm text-muted-foreground mt-2">Create your first QA issue to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {qaIssues.map((issue) => (
            <Card key={issue.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{issue.title}</CardTitle>
                    {issue.description && (
                      <p className="text-sm text-muted-foreground">{issue.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getSeverityColor(issue.severity)}>
                      {issue.severity}
                    </Badge>
                    <Badge variant="outline" className={getStatusColor(issue.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(issue.status)}
                        {issue.status.replace('_', ' ')}
                      </span>
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Assigned to:</span>
                    <span className="font-medium">
                      {issue.assigned_tester?.name || 'Unassigned'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(issue)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteIssue(issue.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      Delete
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