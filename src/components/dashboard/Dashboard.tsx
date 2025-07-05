import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Calendar, File, Folder, Bell as BellIcon } from 'lucide-react';

import { KanbanBoard } from './KanbanBoard';
import { ProjectTracker } from './ProjectTracker';
import { QATracker } from './QATracker';
import { TeamRoleView } from './TeamRoleView';
import { CalendarIntegration } from './CalendarIntegration';
import { FileRepository } from './FileRepository';
import { MeetingNotes } from './MeetingNotes';
import { DesignNotes } from './DesignNotes';
import { MarketingCalendar } from './MarketingCalendar';

export function Dashboard() {
  const [activeView, setActiveView] = useState('overview');

  const quickStats = [
    { label: 'Active Projects', value: '8', change: '+12%', color: 'text-primary' },
    { label: 'Tasks Completed', value: '142', change: '+8%', color: 'text-success' },
    { label: 'Team Members', value: '24', change: '+2', color: 'text-accent-foreground' },
    { label: 'Open Issues', value: '7', change: '-23%', color: 'text-warning' }
  ];

  const upcomingDeadlines = [
    { project: 'ThinkOwn Teams v2.0', deadline: '2024-02-15', priority: 'high' },
    { project: 'API Documentation Portal', deadline: '2024-01-30', priority: 'medium' },
    { project: 'Mobile App MVP', deadline: '2024-03-01', priority: 'high' }
  ];

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
                  <span className="text-white font-bold text-lg">T</span>
                </div>
                <div>
                  <h1 className="font-bold text-xl">ThinkOwn Teams</h1>
                  <p className="text-sm text-muted-foreground">Project Management Dashboard</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
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

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Task Board */}
              <div className="lg:col-span-2">
                <KanbanBoard />
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
                    {upcomingDeadlines.map((item, index) => (
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
                    ))}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start gradient-primary text-white">
                      <File className="w-4 h-4 mr-2" />
                      Create New Task
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Folder className="w-4 h-4 mr-2" />
                      Upload Files
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Meeting
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
    </div>
  );
}