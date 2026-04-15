-- ============================================
-- PEO 302141 Reporting System - Full Migration
-- ============================================
-- Run this script in Supabase SQL Editor to create all tables
-- ============================================

-- 1. Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. EXPERTS TABLE
-- ============================================
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

ALTER TABLE public.experts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "experts_select_authenticated" ON public.experts 
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "experts_insert_authenticated" ON public.experts 
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "experts_update_authenticated" ON public.experts 
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "experts_delete_authenticated" ON public.experts 
  FOR DELETE TO authenticated USING (true);

DROP TRIGGER IF EXISTS experts_updated_at ON public.experts;
CREATE TRIGGER experts_updated_at
  BEFORE UPDATE ON public.experts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_experts_user_id ON public.experts(user_id);
CREATE INDEX IF NOT EXISTS idx_experts_is_active ON public.experts(is_active);

-- ============================================
-- 3. ACTIVITIES TABLE (Pontaj)
-- ============================================
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
  UNIQUE(expert_id, date, activity_type)
);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activities_select_authenticated" ON public.activities 
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "activities_insert_authenticated" ON public.activities 
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "activities_update_authenticated" ON public.activities 
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "activities_delete_authenticated" ON public.activities 
  FOR DELETE TO authenticated USING (true);

DROP TRIGGER IF EXISTS activities_updated_at ON public.activities;
CREATE TRIGGER activities_updated_at
  BEFORE UPDATE ON public.activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_activities_expert_id ON public.activities(expert_id);
CREATE INDEX IF NOT EXISTS idx_activities_date ON public.activities(date);
CREATE INDEX IF NOT EXISTS idx_activities_activity_type ON public.activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_expert_date ON public.activities(expert_id, date);

-- ============================================
-- 4. DELIVERABLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deliverables_select_authenticated" ON public.deliverables 
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "deliverables_insert_authenticated" ON public.deliverables 
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "deliverables_update_authenticated" ON public.deliverables 
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "deliverables_delete_authenticated" ON public.deliverables 
  FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_deliverables_activity_id ON public.deliverables(activity_id);

-- ============================================
-- 5. GRUP TINTA TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.grup_tinta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cnp TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.grup_tinta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "grup_tinta_select_authenticated" ON public.grup_tinta 
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "grup_tinta_insert_authenticated" ON public.grup_tinta 
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "grup_tinta_update_authenticated" ON public.grup_tinta 
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "grup_tinta_delete_authenticated" ON public.grup_tinta 
  FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_grup_tinta_activity_id ON public.grup_tinta(activity_id);
CREATE INDEX IF NOT EXISTS idx_grup_tinta_date ON public.grup_tinta(date);

-- ============================================
-- 6. VERIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id UUID NOT NULL REFERENCES public.experts(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2100),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'issues')),
  verified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(expert_id, month, year)
);

ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "verifications_select_authenticated" ON public.verifications 
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "verifications_insert_authenticated" ON public.verifications 
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "verifications_update_authenticated" ON public.verifications 
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "verifications_delete_authenticated" ON public.verifications 
  FOR DELETE TO authenticated USING (true);

DROP TRIGGER IF EXISTS verifications_updated_at ON public.verifications;
CREATE TRIGGER verifications_updated_at
  BEFORE UPDATE ON public.verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_verifications_expert_id ON public.verifications(expert_id);
CREATE INDEX IF NOT EXISTS idx_verifications_month_year ON public.verifications(month, year);
CREATE INDEX IF NOT EXISTS idx_verifications_status ON public.verifications(status);

-- ============================================
-- 7. PONTAJ ROWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.pontaj_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id UUID NOT NULL REFERENCES public.verifications(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hours NUMERIC(4,2) NOT NULL,
  activity_code TEXT NOT NULL,
  description TEXT,
  verified BOOLEAN DEFAULT false,
  issues JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.pontaj_rows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pontaj_rows_select_authenticated" ON public.pontaj_rows 
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "pontaj_rows_insert_authenticated" ON public.pontaj_rows 
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "pontaj_rows_update_authenticated" ON public.pontaj_rows 
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "pontaj_rows_delete_authenticated" ON public.pontaj_rows 
  FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_pontaj_rows_verification_id ON public.pontaj_rows(verification_id);

-- ============================================
-- 8. RAPORT ROWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.raport_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id UUID NOT NULL REFERENCES public.verifications(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  activity_title TEXT NOT NULL,
  description TEXT,
  deliverables JSONB DEFAULT '[]'::jsonb,
  verified BOOLEAN DEFAULT false,
  matches_pontaj BOOLEAN DEFAULT false,
  issues JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.raport_rows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "raport_rows_select_authenticated" ON public.raport_rows 
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "raport_rows_insert_authenticated" ON public.raport_rows 
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "raport_rows_update_authenticated" ON public.raport_rows 
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "raport_rows_delete_authenticated" ON public.raport_rows 
  FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_raport_rows_verification_id ON public.raport_rows(verification_id);

-- ============================================
-- 9. LIVRABIL ROWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.livrabil_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id UUID NOT NULL REFERENCES public.verifications(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  activity_date DATE,
  activity_title TEXT,
  file_exists BOOLEAN DEFAULT false,
  title_match BOOLEAN DEFAULT false,
  issues JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.livrabil_rows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "livrabil_rows_select_authenticated" ON public.livrabil_rows 
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "livrabil_rows_insert_authenticated" ON public.livrabil_rows 
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "livrabil_rows_update_authenticated" ON public.livrabil_rows 
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "livrabil_rows_delete_authenticated" ON public.livrabil_rows 
  FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_livrabil_rows_verification_id ON public.livrabil_rows(verification_id);

-- ============================================
-- 10. CROSS EXPERT ROWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.cross_expert_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id UUID NOT NULL REFERENCES public.verifications(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  expert1_id UUID REFERENCES public.experts(id),
  expert1_name TEXT NOT NULL,
  expert2_id UUID REFERENCES public.experts(id),
  expert2_name TEXT NOT NULL,
  activity1 TEXT NOT NULL,
  activity2 TEXT NOT NULL,
  similarity NUMERIC(5,2) NOT NULL CHECK (similarity >= 0 AND similarity <= 100),
  is_potential_issue BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.cross_expert_rows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cross_expert_rows_select_authenticated" ON public.cross_expert_rows 
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "cross_expert_rows_insert_authenticated" ON public.cross_expert_rows 
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "cross_expert_rows_update_authenticated" ON public.cross_expert_rows 
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "cross_expert_rows_delete_authenticated" ON public.cross_expert_rows 
  FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_cross_expert_rows_verification_id ON public.cross_expert_rows(verification_id);
CREATE INDEX IF NOT EXISTS idx_cross_expert_rows_potential_issue ON public.cross_expert_rows(is_potential_issue);

-- ============================================
-- 11. NECONFORMITATI TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.neconformitati (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id UUID NOT NULL REFERENCES public.verifications(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('pontaj', 'raport', 'livrabil', 'cross-expert', 'other')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  description TEXT NOT NULL,
  affected_date DATE,
  affected_expert_id UUID REFERENCES public.experts(id),
  resolved BOOLEAN DEFAULT false,
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.neconformitati ENABLE ROW LEVEL SECURITY;

CREATE POLICY "neconformitati_select_authenticated" ON public.neconformitati 
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "neconformitati_insert_authenticated" ON public.neconformitati 
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "neconformitati_update_authenticated" ON public.neconformitati 
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "neconformitati_delete_authenticated" ON public.neconformitati 
  FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_neconformitati_verification_id ON public.neconformitati(verification_id);
CREATE INDEX IF NOT EXISTS idx_neconformitati_type ON public.neconformitati(type);
CREATE INDEX IF NOT EXISTS idx_neconformitati_severity ON public.neconformitati(severity);
CREATE INDEX IF NOT EXISTS idx_neconformitati_resolved ON public.neconformitati(resolved);

-- ============================================
-- 12. VERIFICATION NOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.verification_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id UUID NOT NULL REFERENCES public.verifications(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id),
  author_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.verification_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "verification_notes_select_authenticated" ON public.verification_notes 
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "verification_notes_insert_authenticated" ON public.verification_notes 
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "verification_notes_update_authenticated" ON public.verification_notes 
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "verification_notes_delete_authenticated" ON public.verification_notes 
  FOR DELETE TO authenticated USING (true);

DROP TRIGGER IF EXISTS verification_notes_updated_at ON public.verification_notes;
CREATE TRIGGER verification_notes_updated_at
  BEFORE UPDATE ON public.verification_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_verification_notes_verification_id ON public.verification_notes(verification_id);

-- ============================================
-- 13. APP SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "app_settings_select_authenticated" ON public.app_settings 
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "app_settings_insert_authenticated" ON public.app_settings 
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "app_settings_update_authenticated" ON public.app_settings 
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "app_settings_delete_authenticated" ON public.app_settings 
  FOR DELETE TO authenticated USING (true);

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

-- ============================================
-- 14. SEED DEFAULT EXPERTS
-- ============================================
INSERT INTO public.experts (name, role, is_active) VALUES
  ('Expert 1', 'Expert metodologic', true),
  ('Expert 2', 'Expert formare', true),
  ('Expert 3', 'Expert curriculum', true),
  ('Expert 4', 'Expert evaluare', true),
  ('Expert 5', 'Expert diseminare', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 15. STORAGE BUCKET FOR DELIVERABLES
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'deliverables',
  'deliverables',
  false,
  52428800,
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/jpeg', 'image/png', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "deliverables_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'deliverables');

CREATE POLICY "deliverables_view" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'deliverables');

CREATE POLICY "deliverables_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'deliverables');

CREATE POLICY "deliverables_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'deliverables');

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
