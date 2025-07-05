-- Add missing fields to qa_issues table to match the reference design
ALTER TABLE public.qa_issues 
ADD COLUMN expected_result TEXT,
ADD COLUMN actual_result TEXT,
ADD COLUMN steps_to_reproduce TEXT,
ADD COLUMN issue_type TEXT DEFAULT 'bug',
ADD COLUMN screenshot_url TEXT;