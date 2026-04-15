-- Seed Working Groups from PEO_Grupuri_Lucru.csv

INSERT INTO public.working_groups (name, type, email, sa_code, is_active) VALUES
('Task Force Acord Parteneriat', 'Task Force', 'taskforce.ap@asociatiainspire.ro', 'SA1.1', true),
('Task Force Curriculum', 'Task Force', 'taskforce.curriculum@asociatiainspire.ro', 'SA1.2', true),
('Task Force Formare', 'Task Force', 'taskforce.formare@asociatiainspire.ro', 'SA1.3', true),
('Task Force Cercetare', 'Task Force', 'taskforce.cercetare@asociatiainspire.ro', 'SA2.1', true),
('Task Force Inovare', 'Task Force', 'taskforce.inovare@asociatiainspire.ro', 'SA2.2', true),
('Task Force GT Selectie', 'Task Force', 'taskforce.gt.selectie@asociatiainspire.ro', 'SA3.1', true),
('Task Force GT Formare', 'Task Force', 'taskforce.gt.formare@asociatiainspire.ro', 'SA3.2', true),
('Task Force GT Mentorat', 'Task Force', 'taskforce.gt.mentorat@asociatiainspire.ro', 'SA3.3', true),
('Task Force Comunicare', 'Task Force', 'taskforce.comunicare@asociatiainspire.ro', 'SA4.1', true),
('Club STEAM Educatori', 'Club', 'club.educatori@asociatiainspire.ro', 'SA3.2', true),
('Club STEAM Tineri', 'Club', 'club.tineri@asociatiainspire.ro', 'SA3.3', true),
('Club Inovare Didactica', 'Club', 'club.inovare@asociatiainspire.ro', 'SA2.2', true),
('Structura Parteneriat Scoli', 'Structura', 'parteneriat.scoli@asociatiainspire.ro', 'SA1.1', true),
('Structura Parteneriat Universitati', 'Structura', 'parteneriat.universitati@asociatiainspire.ro', 'SA1.1', true),
('Structura Parteneriat Companii', 'Structura', 'parteneriat.companii@asociatiainspire.ro', 'SA1.1', true),
('Structura Parteneriat ONG', 'Structura', 'parteneriat.ong@asociatiainspire.ro', 'SA1.1', true),
('Comitet Director Proiect', 'Structura', 'comitet.director@asociatiainspire.ro', NULL, true)

ON CONFLICT DO NOTHING;
