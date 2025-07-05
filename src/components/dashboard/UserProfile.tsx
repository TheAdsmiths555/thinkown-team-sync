import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Settings, LogOut, User, Bell, Moon, Sun, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserProfileProps {
  user?: {
    name: string;
    email: string;
    avatar: string;
    role: string;
    initials: string;
  };
}

export function UserProfile({ 
  user = {
    name: 'John Doe',
    email: 'john.doe@thinkown.com',
    avatar: '',
    role: 'Product Manager',
    initials: 'JD'
  }
}: UserProfileProps) {
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(true);

  const handleSettingsClick = () => {
    toast({
      title: "Settings",
      description: "Settings panel would open here in a full implementation."
    });
  };

  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
      variant: "default"
    });
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    toast({
      title: isDarkMode ? "Light Mode" : "Dark Mode",
      description: `Switched to ${isDarkMode ? 'light' : 'dark'} mode.`
    });
  };

  const handleNotifications = () => {
    toast({
      title: "Notifications",
      description: "Notification settings would open here."
    });
  };

  const handleHelp = () => {
    toast({
      title: "Help Center",
      description: "Help documentation would open here."
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-primary/20 text-primary font-semibold">
              {user.initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64 glass-card border-border" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-primary/20 text-primary text-sm">
                  {user.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground mt-1">
                  {user.email}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="w-fit text-xs">
              {user.role}
            </Badge>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleSettingsClick}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleNotifications}>
          <Bell className="mr-2 h-4 w-4" />
          <span>Notifications</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={toggleTheme}>
          {isDarkMode ? (
            <Sun className="mr-2 h-4 w-4" />
          ) : (
            <Moon className="mr-2 h-4 w-4" />
          )}
          <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleSettingsClick}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleHelp}>
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>Help & Support</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}