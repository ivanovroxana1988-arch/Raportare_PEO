-- Create app_settings table
-- Stores application-wide settings

CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "app_settings_select_authenticated" ON public.app_settings 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "app_settings_insert_authenticated" ON public.app_settings 
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "app_settings_update_authenticated" ON public.app_settings 
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "app_settings_delete_authenticated" ON public.app_settings 
  FOR DELETE TO authenticated USING (true);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS app_settings_updated_at ON public.app_settings;
CREATE TRIGGER app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.app_settings (key, value, description) VALUES
  ('project_code', '"302141"', 'Project code'),
  ('project_title', '"Proiect PEO 302141"', 'Project title'),
  ('contract_number', '"POCU/..."', 'Contract number')
ON CONFLICT (key) DO NOTHING;
