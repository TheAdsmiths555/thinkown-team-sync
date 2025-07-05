import { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar_url?: string | null;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onMentionsChange: (mentions: string[]) => void;
  teamMembers: TeamMember[];
  placeholder?: string;
  rows?: number;
}

export function MentionInput({ 
  value, 
  onChange, 
  onMentionsChange, 
  teamMembers, 
  placeholder = "Type @ to mention someone...",
  rows = 3
}: MentionInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<TeamMember[]>([]);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentions, setMentions] = useState<TeamMember[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    
    // Check for @ mentions
    const cursorPos = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      const query = mentionMatch[1].toLowerCase();
      setMentionQuery(query);
      
      const filteredMembers = teamMembers.filter(member =>
        member.name.toLowerCase().includes(query)
      );
      
      setSuggestions(filteredMembers);
      setShowSuggestions(true);
      setCursorPosition(cursorPos);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
      setMentionQuery('');
    }
  };

  const selectMention = (member: TeamMember) => {
    const cursorPos = cursorPosition;
    const textBeforeMention = value.slice(0, cursorPos - mentionQuery.length - 1);
    const textAfterCursor = value.slice(cursorPos);
    const newValue = `${textBeforeMention}@${member.name} ${textAfterCursor}`;
    
    onChange(newValue);
    
    // Add to mentions if not already included
    const newMentions = [...mentions];
    if (!newMentions.find(m => m.id === member.id)) {
      newMentions.push(member);
      setMentions(newMentions);
      onMentionsChange(newMentions.map(m => m.id));
    }
    
    setShowSuggestions(false);
    setSuggestions([]);
    setMentionQuery('');
    
    // Focus back to textarea
    setTimeout(() => {
      textareaRef.current?.focus();
      const newCursorPos = textBeforeMention.length + member.name.length + 2;
      textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const removeMention = (memberId: string) => {
    const updatedMentions = mentions.filter(m => m.id !== memberId);
    setMentions(updatedMentions);
    onMentionsChange(updatedMentions.map(m => m.id));
    
    // Remove from text as well
    const memberToRemove = mentions.find(m => m.id === memberId);
    if (memberToRemove) {
      const newValue = value.replace(new RegExp(`@${memberToRemove.name}\\s?`, 'g'), '');
      onChange(newValue);
    }
  };

  // Update mentions when text changes externally
  useEffect(() => {
    const currentMentions: TeamMember[] = [];
    teamMembers.forEach(member => {
      if (value.includes(`@${member.name}`)) {
        currentMentions.push(member);
      }
    });
    setMentions(currentMentions);
    onMentionsChange(currentMentions.map(m => m.id));
  }, [value, teamMembers, onMentionsChange]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowSuggestions(false);
            }
          }}
        />
        
        {showSuggestions && suggestions.length > 0 && (
          <Card className="absolute z-10 mt-1 w-full max-h-40 overflow-y-auto">
            <CardContent className="p-2">
              {suggestions.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                  onClick={() => selectMention(member)}
                >
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={member.avatar_url || ''} />
                    <AvatarFallback className="text-xs">
                      {member.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium">{member.name}</div>
                    <div className="text-xs text-muted-foreground">{member.role}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
      
      {mentions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {mentions.map((member) => (
            <Badge key={member.id} variant="secondary" className="flex items-center gap-1">
              <Avatar className="w-4 h-4">
                <AvatarImage src={member.avatar_url || ''} />
                <AvatarFallback className="text-xs">
                  {member.name.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {member.name}
              <button
                type="button"
                onClick={() => removeMention(member.id)}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}