import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, X, File, Image, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FileUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  maxSizeInMB?: number;
}

export interface UploadedFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export function FileUpload({ 
  onFilesUploaded, 
  maxFiles = 5, 
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.txt'], 
  maxSizeInMB = 10 
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (fileType.includes('pdf')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;
    
    if (uploadedFiles.length + files.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive"
      });
      return;
    }

    for (const file of files) {
      if (file.size > maxSizeInMB * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds ${maxSizeInMB}MB limit`,
          variant: "destructive"
        });
        continue;
      }

      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to upload files",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('bug-attachments')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('bug-attachments')
        .getPublicUrl(fileName);

      const uploadedFile: UploadedFile = {
        id: data.path,
        name: file.name,
        url: publicUrl,
        type: file.type,
        size: file.size
      };

      setUploadedFiles(prev => [...prev, uploadedFile]);
      onFilesUploaded([...uploadedFiles, uploadedFile]);

      toast({
        title: "Success",
        description: `${file.name} uploaded successfully`
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: `Failed to upload ${file.name}`,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = async (fileId: string) => {
    try {
      const { error } = await supabase.storage
        .from('bug-attachments')
        .remove([fileId]);

      if (error) throw error;

      const updatedFiles = uploadedFiles.filter(f => f.id !== fileId);
      setUploadedFiles(updatedFiles);
      onFilesUploaded(updatedFiles);

      toast({
        title: "Success",
        description: "File removed successfully"
      });

    } catch (error) {
      console.error('Remove error:', error);
      toast({
        title: "Error",
        description: "Failed to remove file",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || uploadedFiles.length >= maxFiles}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Files
        </Button>
        <span className="text-sm text-muted-foreground">
          {uploadedFiles.length}/{maxFiles} files
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {uploading && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="text-sm">Uploading...</div>
              <Progress value={uploadProgress} />
            </div>
          </CardContent>
        </Card>
      )}

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((file) => (
            <Card key={file.id}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getFileIcon(file.type)}
                    <div>
                      <div className="text-sm font-medium">{file.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}