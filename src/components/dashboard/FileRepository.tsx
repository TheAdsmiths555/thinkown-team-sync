import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Folder, File, Bell } from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  category: 'Assets' | 'Docs' | 'Releases' | 'Designs';
  size?: string;
  lastModified: string;
  modifiedBy: string;
  project?: string;
  isShared?: boolean;
}

const fileItems: FileItem[] = [
  {
    id: '1',
    name: 'ThinkOwn Teams Assets',
    type: 'folder',
    category: 'Assets',
    lastModified: '2024-01-14',
    modifiedBy: 'Sarah Kim',
    project: 'ThinkOwn Teams v2.0',
    isShared: true
  },
  {
    id: '2',
    name: 'API_Documentation_v2.pdf',
    type: 'file',
    category: 'Docs',
    size: '2.4 MB',
    lastModified: '2024-01-13',
    modifiedBy: 'Rachel Green',
    project: 'API Documentation',
    isShared: true
  },
  {
    id: '3',
    name: 'Mobile_App_Wireframes.fig',
    type: 'file',
    category: 'Designs',
    size: '15.7 MB',
    lastModified: '2024-01-12',
    modifiedBy: 'Sarah Kim',
    project: 'Mobile App MVP',
    isShared: false
  },
  {
    id: '4',
    name: 'Sprint_Planning_Notes.docx',
    type: 'file',
    category: 'Docs',
    size: '456 KB',
    lastModified: '2024-01-11',
    modifiedBy: 'Alex Chen',
    project: 'ThinkOwn Teams v2.0',
    isShared: true
  },
  {
    id: '5',
    name: 'Release_v1.2.0',
    type: 'folder',
    category: 'Releases',
    lastModified: '2024-01-10',
    modifiedBy: 'Mike Rodriguez',
    project: 'ThinkOwn Teams v2.0',
    isShared: true
  },
  {
    id: '6',
    name: 'Brand_Guidelines.pdf',
    type: 'file',
    category: 'Assets',
    size: '8.9 MB',
    lastModified: '2024-01-09',
    modifiedBy: 'Sarah Kim',
    isShared: true
  }
];

export function FileRepository() {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Assets': return 'bg-accent/20 text-accent-foreground border border-accent/30';
      case 'Docs': return 'bg-primary/20 text-primary border border-primary/30';
      case 'Releases': return 'bg-success/20 text-success border border-success/30';
      case 'Designs': return 'bg-warning/20 text-warning border border-warning/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const categoryStats = {
    Assets: fileItems.filter(item => item.category === 'Assets').length,
    Docs: fileItems.filter(item => item.category === 'Docs').length,
    Releases: fileItems.filter(item => item.category === 'Releases').length,
    Designs: fileItems.filter(item => item.category === 'Designs').length
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="w-5 h-5" />
            File Repository
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              Upload
            </Button>
            <Button variant="ghost" size="sm">
              <Bell className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Category Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(categoryStats).map(([category, count]) => (
              <div key={category} className="text-center p-3 rounded-lg bg-muted/10">
                <div className="text-lg font-bold">{count}</div>
                <Badge className={`text-xs ${getCategoryColor(category)}`}>
                  {category}
                </Badge>
              </div>
            ))}
          </div>

          {/* Recent Files */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Recent Files</h4>
            <div className="space-y-2">
              {fileItems
                .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
                .slice(0, 8)
                .map((item) => (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-primary/30 transition-all duration-200 group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted/20 flex items-center justify-center">
                        {item.type === 'folder' ? (
                          <Folder className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <File className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-medium group-hover:text-primary transition-colors">
                            {item.name}
                          </h5>
                          {item.isShared && (
                            <Badge variant="outline" className="text-xs">
                              Shared
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Modified by {item.modifiedBy}</span>
                          {item.size && (
                            <>
                              <span>•</span>
                              <span>{item.size}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(item.lastModified)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="justify-start">
              <Folder className="w-4 h-4 mr-2" />
              Browse Google Drive
            </Button>
            <Button variant="outline" className="justify-start">
              <File className="w-4 h-4 mr-2" />
              Upload Files
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}