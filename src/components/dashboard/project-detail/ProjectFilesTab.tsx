import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, File, Image, FileText, Download, Trash2, FolderOpen, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ProjectFilesTabProps {
  projectId: string;
}

interface ProjectFile {
  id: string;
  name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  folder: string;
  project_id: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

const FOLDERS = [
  { id: 'assets', name: 'Assets', icon: '🎨' },
  { id: 'docs', name: 'Documents', icon: '📄' },
  { id: 'designs', name: 'Designs', icon: '🎯' },
  { id: 'releases', name: 'Releases', icon: '🚀' },
  { id: 'contracts', name: 'Contracts', icon: '📋' }
];

export function ProjectFilesTab({ projectId }: ProjectFilesTabProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFolder, setUploadFolder] = useState('assets');

  // For demo purposes, we'll simulate files since storage setup requires migration
  const demoFiles: ProjectFile[] = [
    {
      id: '1',
      name: 'project-mockup.figma',
      file_path: '/designs/project-mockup.figma',
      file_type: 'design',
      file_size: 2048000,
      folder: 'designs',
      project_id: projectId,
      uploaded_by: user?.id || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'requirements.pdf',
      file_path: '/docs/requirements.pdf',
      file_type: 'document',
      file_size: 1024000,
      folder: 'docs',
      project_id: projectId,
      uploaded_by: user?.id || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      name: 'logo-assets.zip',
      file_path: '/assets/logo-assets.zip',
      file_type: 'archive',
      file_size: 5120000,
      folder: 'assets',
      project_id: projectId,
      uploaded_by: user?.id || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  useEffect(() => {
    // For demo purposes, we'll use the demo files
    // In a real implementation, you would fetch from your project_files table
    setFiles(demoFiles);
    setLoading(false);
  }, [projectId]);

  const getFileIcon = (fileType: string, fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension || '')) {
      return <Image className="w-5 h-5" />;
    }
    if (['pdf', 'doc', 'docx', 'txt'].includes(extension || '')) {
      return <FileText className="w-5 h-5" />;
    }
    return <File className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !user) return;

    // This is a demo implementation
    // In a real app, you would upload to Supabase Storage and save metadata to database
    const newFile: ProjectFile = {
      id: Date.now().toString(),
      name: uploadFile.name,
      file_path: `/${uploadFolder}/${uploadFile.name}`,
      file_type: uploadFile.type,
      file_size: uploadFile.size,
      folder: uploadFolder,
      project_id: projectId,
      uploaded_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setFiles(prev => [newFile, ...prev]);
    setIsUploadModalOpen(false);
    setUploadFile(null);
    setUploadFolder('assets');

    toast({
      title: "File Uploaded",
      description: `${uploadFile.name} has been uploaded successfully.`
    });
  };

  const deleteFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    toast({
      title: "File Deleted",
      description: "File has been deleted successfully."
    });
  };

  const filteredFiles = files.filter(file => {
    const matchesFolder = selectedFolder === 'all' || file.folder === selectedFolder;
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">Loading files...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="text-lg font-semibold">Project Files</h3>
        <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-white">
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload File</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <Label htmlFor="file">Select File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="folder">Folder</Label>
                <Select value={uploadFolder} onValueChange={setUploadFolder}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FOLDERS.map(folder => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.icon} {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="gradient-primary text-white flex-1">
                  Upload File
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsUploadModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedFolder} onValueChange={setSelectedFolder}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <span className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                All Folders
              </span>
            </SelectItem>
            {FOLDERS.map(folder => (
              <SelectItem key={folder.id} value={folder.id}>
                <span className="flex items-center gap-2">
                  <span>{folder.icon}</span>
                  {folder.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Files Grid */}
      {filteredFiles.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              {searchTerm || selectedFolder !== 'all' 
                ? 'No files match your filters.' 
                : 'No files uploaded yet.'}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Upload your first file to get started!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredFiles.map((file) => (
            <Card key={file.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.file_type, file.name)}
                    <div>
                      <h4 className="font-medium">{file.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.file_size)} • {new Date(file.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {FOLDERS.find(f => f.id === file.folder)?.icon} {FOLDERS.find(f => f.id === file.folder)?.name}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteFile(file.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
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