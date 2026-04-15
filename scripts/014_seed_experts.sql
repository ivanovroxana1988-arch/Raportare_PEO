-- Seed default experts
-- These are placeholder experts that can be updated later

INSERT INTO public.experts (id, name, role, is_active) VALUES
  (gen_random_uuid(), 'Expert 1', 'Expert metodologic', true),
  (gen_random_uuid(), 'Expert 2', 'Expert formare', true),
  (gen_random_uuid(), 'Expert 3', 'Expert curriculum', true),
  (gen_random_uuid(), 'Expert 4', 'Expert evaluare', true),
  (gen_random_uuid(), 'Expert 5', 'Expert diseminare', true)
ON CONFLICT DO NOTHING;
