-- Update the tasks table status constraint to include 'hold' status
ALTER TABLE public.tasks 
DROP CONSTRAINT IF EXISTS tasks_status_check;

ALTER TABLE public.tasks 
ADD CONSTRAINT tasks_status_check 
CHECK (status IN ('todo', 'progress', 'testing', 'hold', 'completed'));