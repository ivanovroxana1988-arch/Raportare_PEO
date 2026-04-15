-- Create experts table
-- Stores information about project experts

CREATE TABLE IF NOT EXISTS public.experts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.experts ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view experts
CREATE POLICY "experts_select_authenticated" ON public.experts 
  FOR SELECT TO authenticated USING (true);

-- Allow admins to insert experts (we'll use service role for now)
CREATE POLICY "experts_insert_authenticated" ON public.experts 
  FOR INSERT TO authenticated WITH CHECK (true);

-- Allow admins to update experts
CREATE POLICY "experts_update_authenticated" ON public.experts 
  FOR UPDATE TO authenticated USING (true);

-- Allow admins to delete experts
CREATE POLICY "experts_delete_authenticated" ON public.experts 
  FOR DELETE TO authenticated USING (true);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS experts_updated_at ON public.experts;
CREATE TRIGGER experts_updated_at
  BEFORE UPDATE ON public.experts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_experts_user_id ON public.experts(user_id);
CREATE INDEX IF NOT EXISTS idx_experts_is_active ON public.experts(is_active);
