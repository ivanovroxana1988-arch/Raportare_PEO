-- Seed Experts from PEO_Experti.csv
-- Clear existing data first
DELETE FROM public.experts WHERE name != 'Expert 1';

INSERT INTO public.experts (name, role, email, category, norma, sa_codes, is_active) VALUES
-- Roxana Ivanov - ap, bh, com - 8h - SA1.1;SA1.2;SA1.3;SA2.1;SA2.2;SA3.1;SA3.2;SA3.3;SA4.1
('Roxana Ivanov', 'Manager proiect', 'roxana.ivanov@asociatiainspire.ro', 'ap', 8, ARRAY['SA1.1','SA1.2','SA1.3','SA2.1','SA2.2','SA3.1','SA3.2','SA3.3','SA4.1'], true),

-- Carmen Costea - ap, bh - 4h - SA1.1;SA1.2;SA1.3;SA2.1;SA2.2;SA3.1;SA3.2;SA3.3;SA4.1
('Carmen Costea', 'Coordonator echipa implementare', 'carmen.costea@asociatiainspire.ro', 'ap', 4, ARRAY['SA1.1','SA1.2','SA1.3','SA2.1','SA2.2','SA3.1','SA3.2','SA3.3','SA4.1'], true),

-- Andreea Patrascu - ap, bh, cr - 8h
('Andreea Patrascu', 'Responsabil monitorizare', 'andreea.patrascu@asociatiainspire.ro', 'ap', 8, ARRAY['SA1.1','SA1.2','SA1.3','SA2.1','SA2.2','SA3.1','SA3.2','SA3.3','SA4.1'], true),

-- Daniela Mares - ap, bh - 4h
('Daniela Mares', 'Expert financiar', 'daniela.mares@asociatiainspire.ro', 'ap', 4, ARRAY['SA1.1','SA1.2','SA1.3','SA2.1','SA2.2','SA3.1','SA3.2','SA3.3','SA4.1'], true),

-- Mihaela Gavrilescu - ap - 4h
('Mihaela Gavrilescu', 'Asistent manager', 'mihaela.gavrilescu@asociatiainspire.ro', 'ap', 4, ARRAY['SA1.1','SA1.2','SA1.3','SA2.1','SA2.2','SA3.1','SA3.2','SA3.3','SA4.1'], true),

-- Ana-Maria Dobre - cr - 6h
('Ana-Maria Dobre', 'Coordonator activitati curriculum', 'ana.dobre@asociatiainspire.ro', 'cr', 6, ARRAY['SA1.1','SA1.2','SA1.3','SA2.1','SA2.2'], true),

-- Andreea Miron - cr - 6h
('Andreea Miron', 'Expert curriculum STEAM', 'andreea.miron@asociatiainspire.ro', 'cr', 6, ARRAY['SA1.1','SA1.2','SA1.3'], true),

-- Cristina Herghelegiu - cr - 6h
('Cristina Herghelegiu', 'Expert curriculum STEAM', 'cristina.herghelegiu@asociatiainspire.ro', 'cr', 6, ARRAY['SA1.1','SA1.2','SA1.3'], true),

-- Raluca Enache - cr - 6h
('Raluca Enache', 'Expert curriculum STEAM', 'raluca.enache@asociatiainspire.ro', 'cr', 6, ARRAY['SA1.1','SA1.2','SA1.3'], true),

-- Marius Enache - cr - 6h
('Marius Enache', 'Expert curriculum si inovare', 'marius.enache@asociatiainspire.ro', 'cr', 6, ARRAY['SA1.1','SA1.2','SA1.3','SA2.1','SA2.2'], true),

-- Florin Gheorghe - cr - 6h
('Florin Gheorghe', 'Expert curriculum si inovare', 'florin.gheorghe@asociatiainspire.ro', 'cr', 6, ARRAY['SA1.1','SA1.2','SA1.3'], true),

-- Liliana Todea - cercetare - 6h
('Liliana Todea', 'Expert cercetare', 'liliana.todea@asociatiainspire.ro', 'cercetare', 6, ARRAY['SA2.1','SA2.2'], true),

-- Stefania Matei - gt - 8h
('Stefania Matei', 'Coordonator GT', 'stefania.matei@asociatiainspire.ro', 'gt', 8, ARRAY['SA3.1','SA3.2','SA3.3'], true),

-- Anamaria Neagu - gt - 8h
('Anamaria Neagu', 'Expert GT', 'anamaria.neagu@asociatiainspire.ro', 'gt', 8, ARRAY['SA3.1','SA3.2','SA3.3'], true),

-- Georgiana Ilie - gt - 8h
('Georgiana Ilie', 'Expert GT', 'georgiana.ilie@asociatiainspire.ro', 'gt', 8, ARRAY['SA3.1','SA3.2','SA3.3'], true),

-- Oana Bica - gt - 8h
('Oana Bica', 'Expert GT', 'oana.bica@asociatiainspire.ro', 'gt', 8, ARRAY['SA3.1','SA3.2','SA3.3'], true),

-- Alexandra Dinu - gt - 6h
('Alexandra Dinu', 'Expert GT', 'alexandra.dinu@asociatiainspire.ro', 'gt', 6, ARRAY['SA3.1','SA3.2','SA3.3'], true),

-- Catalina Stanescu - com - 4h
('Catalina Stanescu', 'Expert comunicare', 'catalina.stanescu@asociatiainspire.ro', 'com', 4, ARRAY['SA4.1'], true),

-- Ion Popescu - gdpr - 4h
('Ion Popescu', 'Responsabil GDPR', 'ion.popescu@asociatiainspire.ro', 'gdpr', 4, ARRAY['SA1.1','SA1.2','SA1.3','SA2.1','SA2.2','SA3.1','SA3.2','SA3.3','SA4.1'], true)

ON CONFLICT DO NOTHING;
