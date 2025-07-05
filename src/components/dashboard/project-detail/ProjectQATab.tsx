import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Plus, Bug, CheckCircle, AlertTriangle, XCircle, User, Calendar, FileText, Target, AlertCircle, Paperclip, AtSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FileUpload, UploadedFile } from '@/components/ui/file-upload';
import { MentionInput } from '@/components/ui/mention-input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  expected_result: string | null;
  actual_result: string | null;
  steps_to_reproduce: string | null;
  issue_type: string | null;
  screenshot_url: string | null;
  assigned_tester?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  attachments?: Array<{
    id: string;
    file_name: string;
    file_url: string;
    file_type: string;
    file_size: number;
  }>;
  mentions?: Array<{
    id: string;
    mentioned_user_id: string;
    team_member: {
      id: string;
      name: string;
      avatar_url: string | null;
    };
  }>;
}

export function ProjectQATab({ projectId }: ProjectQATabProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { teamMembers } = useTeamMembers();
  const [qaIssues, setQaIssues] = useState<QAIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<QAIssue | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [detailViewIssue, setDetailViewIssue] = useState<QAIssue | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'medium',
    status: 'open',
    assigned_tester_id: '',
    expected_result: '',
    actual_result: '',
    steps_to_reproduce: '',
    issue_type: 'bug',
    screenshot_url: ''
  });
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [mentionedUsers, setMentionedUsers] = useState<string[]>([]);

  const fetchQAIssues = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('qa_issues')
      .select(`
        *,
        assigned_tester:team_members(id, name, avatar_url),
        attachments:qa_issue_attachments(id, file_name, file_url, file_type, file_size),
        mentions:qa_issue_mentions(id, mentioned_user_id, team_member:team_members(id, name, avatar_url))
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

    try {
      let result;
      let issueId;

      if (selectedIssue) {
        // Update existing issue
        result = await supabase
          .from('qa_issues')
          .update(issueData)
          .eq('id', selectedIssue.id)
          .select();
        issueId = selectedIssue.id;
      } else {
        // Create new issue
        result = await supabase
          .from('qa_issues')
          .insert([issueData])
          .select();
        issueId = result.data?.[0]?.id;
      }

      if (result.error) throw result.error;

      // Handle file attachments
      if (uploadedFiles.length > 0 && issueId) {
        const attachmentPromises = uploadedFiles.map(file => 
          supabase.from('qa_issue_attachments').insert({
            qa_issue_id: issueId,
            file_name: file.name,
            file_url: file.url,
            file_type: file.type,
            file_size: file.size,
            uploaded_by: user.id
          })
        );
        await Promise.all(attachmentPromises);
      }

      // Handle mentions
      if (mentionedUsers.length > 0 && issueId) {
        const mentionPromises = mentionedUsers.map(userId =>
          supabase.from('qa_issue_mentions').insert({
            qa_issue_id: issueId,
            mentioned_user_id: userId,
            mentioned_by: user.id
          })
        );
        await Promise.all(mentionPromises);
      }

      toast({
        title: "Success",
        description: `QA issue ${selectedIssue ? 'updated' : 'created'} successfully`
      });
      setIsModalOpen(false);
      resetForm();
      fetchQAIssues();

    } catch (error) {
      console.error('Error saving QA issue:', error);
      toast({
        title: "Error",
        description: `Failed to ${selectedIssue ? 'update' : 'create'} QA issue`,
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      severity: 'medium',
      status: 'open',
      assigned_tester_id: '',
      expected_result: '',
      actual_result: '',
      steps_to_reproduce: '',
      issue_type: 'bug',
      screenshot_url: ''
    });
    setUploadedFiles([]);
    setMentionedUsers([]);
    setSelectedIssue(null);
  };

  const openEditModal = (issue: QAIssue) => {
    setSelectedIssue(issue);
    setFormData({
      title: issue.title,
      description: issue.description || '',
      severity: issue.severity,
      status: issue.status,
      assigned_tester_id: issue.assigned_tester_id || '',
      expected_result: issue.expected_result || '',
      actual_result: issue.actual_result || '',
      steps_to_reproduce: issue.steps_to_reproduce || '',
      issue_type: issue.issue_type || 'bug',
      screenshot_url: issue.screenshot_url || ''
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

  const openDetailSheet = (issue: QAIssue) => {
    setDetailViewIssue(issue);
    setIsDetailSheetOpen(true);
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
          <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
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
                <Label htmlFor="description">Description (use @ to mention team members)</Label>
                <MentionInput
                  value={formData.description}
                  onChange={(value) => setFormData({ ...formData, description: value })}
                  onMentionsChange={setMentionedUsers}
                  teamMembers={teamMembers}
                  placeholder="Describe the issue... Type @ to mention someone"
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

              <div>
                <Label htmlFor="issue_type">Issue Type</Label>
                <Select 
                  value={formData.issue_type} 
                  onValueChange={(value) => setFormData({ ...formData, issue_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="improvement">Improvement</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="expected_result">Expected Result</Label>
                <Textarea
                  id="expected_result"
                  value={formData.expected_result}
                  onChange={(e) => setFormData({ ...formData, expected_result: e.target.value })}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="actual_result">Actual Result</Label>
                <Textarea
                  id="actual_result"
                  value={formData.actual_result}
                  onChange={(e) => setFormData({ ...formData, actual_result: e.target.value })}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="steps_to_reproduce">Steps to Reproduce</Label>
                <Textarea
                  id="steps_to_reproduce"
                  value={formData.steps_to_reproduce}
                  onChange={(e) => setFormData({ ...formData, steps_to_reproduce: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label>File Attachments</Label>
                <FileUpload
                  onFilesUploaded={setUploadedFiles}
                  maxFiles={5}
                  acceptedTypes={['image/*', 'application/pdf', '.doc', '.docx', '.txt']}
                  maxSizeInMB={10}
                />
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {qaIssues.map((issue) => (
            <Card 
              key={issue.id} 
              className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-primary/20 hover:border-l-primary"
              onClick={() => openDetailSheet(issue)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(issue.status)}
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {issue.issue_type || 'Bug'}
                    </span>
                  </div>
                  <Badge className={getSeverityColor(issue.severity)} variant="secondary">
                    {issue.severity}
                  </Badge>
                </div>
                <CardTitle className="text-base leading-tight line-clamp-2">{issue.title}</CardTitle>
                {issue.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{issue.description}</p>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span className="text-muted-foreground">
                        {issue.assigned_tester?.name || 'Unassigned'}
                      </span>
                    </div>
                    <Badge variant="outline" className={getStatusColor(issue.status)}>
                      {issue.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detailed Bug Report Sheet */}
      <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
        <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
          {detailViewIssue && (
            <>
              <SheetHeader className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Bug className="w-5 h-5" />
                  <Badge variant="secondary" className={getSeverityColor(detailViewIssue.severity)}>
                    {detailViewIssue.severity}
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(detailViewIssue.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(detailViewIssue.status)}
                      In Progress
                    </span>
                  </Badge>
                </div>
                <SheetTitle className="text-lg leading-tight">{detailViewIssue.title}</SheetTitle>
              </SheetHeader>

              <div className="space-y-6">
                {/* Resolution Details */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Resolution Details
                  </h4>
                  <Badge className={getStatusColor(detailViewIssue.status)}>
                    {detailViewIssue.status.replace('_', ' ')}
                  </Badge>
                </div>

                <Separator />

                {/* Reporter & Assigned To */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Reporter
                    </h4>
                    <p className="text-sm text-muted-foreground">System User</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Assigned To
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {detailViewIssue.assigned_tester?.name || 'Unassigned'}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Description */}
                {detailViewIssue.description && (
                  <>
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Description
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {detailViewIssue.description}
                      </p>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Expected & Actual Results */}
                {(detailViewIssue.expected_result || detailViewIssue.actual_result) && (
                  <>
                    <div className="grid gap-4">
                      {detailViewIssue.expected_result && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Expected Result
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {detailViewIssue.expected_result}
                          </p>
                        </div>
                      )}
                      {detailViewIssue.actual_result && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <XCircle className="w-4 h-4" />
                            Actual Result
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {detailViewIssue.actual_result}
                          </p>
                        </div>
                      )}
                    </div>
                    <Separator />
                  </>
                )}

                {/* Severity & Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Severity Level</h4>
                    <Badge className={getSeverityColor(detailViewIssue.severity)}>
                      {detailViewIssue.severity}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Issue Type</h4>
                    <p className="text-sm text-muted-foreground">
                      {detailViewIssue.issue_type || 'Bug'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date Reported
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(detailViewIssue.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Last Updated
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(detailViewIssue.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Steps to Reproduce */}
                {detailViewIssue.steps_to_reproduce && (
                  <>
                    <div>
                      <h4 className="text-sm font-semibold mb-3">Steps to Reproduce</h4>
                      <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {detailViewIssue.steps_to_reproduce}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Screenshot */}
                {detailViewIssue.screenshot_url && (
                  <>
                    <div>
                      <h4 className="text-sm font-semibold mb-3">Attachments</h4>
                      <p className="text-sm text-muted-foreground mb-2">Screenshot of the issue:</p>
                      <img 
                        src={detailViewIssue.screenshot_url} 
                        alt="Bug screenshot" 
                        className="rounded-lg border max-w-full h-auto"
                      />
                    </div>
                    <Separator />
                  </>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDetailSheetOpen(false);
                      openEditModal(detailViewIssue);
                    }}
                  >
                    Edit Issue
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      deleteIssue(detailViewIssue.id);
                      setIsDetailSheetOpen(false);
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    Delete Issue
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}