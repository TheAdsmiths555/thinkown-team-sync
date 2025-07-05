-- Create storage bucket for bug report attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('bug-attachments', 'bug-attachments', true);

-- Create policies for bug attachment uploads
CREATE POLICY "Anyone can view bug attachments" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'bug-attachments');

CREATE POLICY "Authenticated users can upload bug attachments" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'bug-attachments' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own attachments" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'bug-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own attachments" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'bug-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create attachments table for multiple file support
CREATE TABLE public.qa_issue_attachments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    qa_issue_id UUID REFERENCES public.qa_issues(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER,
    uploaded_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for attachments
ALTER TABLE public.qa_issue_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies for attachments
CREATE POLICY "Users can view all qa issue attachments" 
ON public.qa_issue_attachments 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create qa issue attachments" 
ON public.qa_issue_attachments 
FOR INSERT 
WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete own qa issue attachments" 
ON public.qa_issue_attachments 
FOR DELETE 
USING (auth.uid() = uploaded_by);

-- Create mentions table for tagging team members
CREATE TABLE public.qa_issue_mentions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    qa_issue_id UUID REFERENCES public.qa_issues(id) ON DELETE CASCADE,
    mentioned_user_id UUID REFERENCES public.team_members(id) ON DELETE CASCADE,
    mentioned_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(qa_issue_id, mentioned_user_id)
);

-- Enable RLS for mentions
ALTER TABLE public.qa_issue_mentions ENABLE ROW LEVEL SECURITY;

-- Create policies for mentions
CREATE POLICY "Users can view all qa issue mentions" 
ON public.qa_issue_mentions 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create qa issue mentions" 
ON public.qa_issue_mentions 
FOR INSERT 
WITH CHECK (auth.uid() = mentioned_by);

CREATE POLICY "Users can delete own qa issue mentions" 
ON public.qa_issue_mentions 
FOR DELETE 
USING (auth.uid() = mentioned_by);

-- Add indexes for better performance
CREATE INDEX idx_qa_issue_attachments_issue_id ON public.qa_issue_attachments(qa_issue_id);
CREATE INDEX idx_qa_issue_mentions_issue_id ON public.qa_issue_mentions(qa_issue_id);
CREATE INDEX idx_qa_issue_mentions_user_id ON public.qa_issue_mentions(mentioned_user_id);