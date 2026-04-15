-- Create activities table
-- Stores daily activity entries for experts (pontaj)

CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id UUID NOT NULL REFERENCES public.experts(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hours NUMERIC(4,2) NOT NULL CHECK (hours > 0 AND hours <= 24),
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Ensure unique activity per expert per date per type
  UNIQUE(expert_id, date, activity_type)
);

-- Enable RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view activities
CREATE POLICY "activities_select_authenticated" ON public.activities 
  FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to insert activities
CREATE POLICY "activities_insert_authenticated" ON public.activities 
  FOR INSERT TO authenticated WITH CHECK (true);

-- Allow authenticated users to update activities
CREATE POLICY "activities_update_authenticated" ON public.activities 
  FOR UPDATE TO authenticated USING (true);

-- Allow authenticated users to delete activities
CREATE POLICY "activities_delete_authenticated" ON public.activities 
  FOR DELETE TO authenticated USING (true);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS activities_updated_at ON public.activities;
CREATE TRIGGER activities_updated_at
  BEFORE UPDATE ON public.activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_activities_expert_id ON public.activities(expert_id);
CREATE INDEX IF NOT EXISTS idx_activities_date ON public.activities(date);
CREATE INDEX IF NOT EXISTS idx_activities_activity_type ON public.activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_expert_date ON public.activities(expert_id, date);
CREATE INDEX IF NOT EXISTS idx_activities_month_year ON public.activities(EXTRACT(MONTH FROM date), EXTRACT(YEAR FROM date));
