-- Create test_cases table for managing test cases
CREATE TABLE public.test_cases (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id),
    title TEXT NOT NULL,
    test_type TEXT NOT NULL DEFAULT 'functional', -- functional, ui, api, integration, etc.
    severity TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, critical
    status TEXT NOT NULL DEFAULT 'pending', -- pass, fail, pending, retest
    assigned_tester_id UUID REFERENCES public.team_members(id),
    notes TEXT,
    screenshot_url TEXT,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for test_cases
ALTER TABLE public.test_cases ENABLE ROW LEVEL SECURITY;

-- Create policies for test_cases
CREATE POLICY "Users can view all test cases" 
ON public.test_cases 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create test cases" 
ON public.test_cases 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own test cases" 
ON public.test_cases 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own test cases" 
ON public.test_cases 
FOR DELETE 
USING (auth.uid() = created_by);

-- Create trigger for automatic timestamp updates on test_cases
CREATE TRIGGER update_test_cases_updated_at
BEFORE UPDATE ON public.test_cases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add additional status options to qa_issues for better tracking
-- Update existing qa_issues to support more status types
-- The current statuses are: open, in-progress, resolved
-- Let's add: cant-reproduce, rejected, closed
-- Note: We'll handle this in the application logic to maintain backward compatibility

-- Create an index for better performance on test_cases
CREATE INDEX idx_test_cases_project_id ON public.test_cases(project_id);
CREATE INDEX idx_test_cases_assigned_tester_id ON public.test_cases(assigned_tester_id);
CREATE INDEX idx_test_cases_status ON public.test_cases(status);
CREATE INDEX idx_test_cases_severity ON public.test_cases(severity);