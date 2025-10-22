-- Seed data for Avvocati Network
-- This file contains initial data for the application

-- Insert sample tribunali
INSERT INTO tribunali (id, name, city, address) VALUES 
    (uuid_generate_v4(), 'Tribunale di Roma', 'Roma', 'Via Cavour, 1, 00184 Roma RM'),
    (uuid_generate_v4(), 'Tribunale di Milano', 'Milano', 'Piazza della Scala, 2, 20121 Milano MI'),
    (uuid_generate_v4(), 'Tribunale di Napoli', 'Napoli', 'Via San Carlo, 1, 80132 Napoli NA')
ON CONFLICT DO NOTHING;

-- Insert sample aule for Roma
INSERT INTO aule (tribunale_id, name, capacity) 
SELECT t.id, 'Aula 1 - Penale', 30 FROM tribunali t WHERE t.name = 'Tribunale di Roma'
UNION ALL
SELECT t.id, 'Aula 2 - Penale', 25 FROM tribunali t WHERE t.name = 'Tribunale di Roma'
UNION ALL
SELECT t.id, 'Aula 3 - Civile', 40 FROM tribunali t WHERE t.name = 'Tribunale di Roma'
UNION ALL
SELECT t.id, 'Aula 4 - Civile', 35 FROM tribunali t WHERE t.name = 'Tribunale di Roma'
UNION ALL
SELECT t.id, 'Aula 5 - Commerciale', 20 FROM tribunali t WHERE t.name = 'Tribunale di Roma'
ON CONFLICT DO NOTHING;

-- Insert sample aule for Milano
INSERT INTO aule (tribunale_id, name, capacity) 
SELECT t.id, 'Aula 1 - Penale', 30 FROM tribunali t WHERE t.name = 'Tribunale di Milano'
UNION ALL
SELECT t.id, 'Aula 2 - Penale', 25 FROM tribunali t WHERE t.name = 'Tribunale di Milano'
UNION ALL
SELECT t.id, 'Aula 3 - Civile', 40 FROM tribunali t WHERE t.name = 'Tribunale di Milano'
UNION ALL
SELECT t.id, 'Aula 4 - Civile', 35 FROM tribunali t WHERE t.name = 'Tribunale di Milano'
UNION ALL
SELECT t.id, 'Aula 5 - Commerciale', 20 FROM tribunali t WHERE t.name = 'Tribunale di Milano'
ON CONFLICT DO NOTHING;

-- Insert sample aule for Napoli
INSERT INTO aule (tribunale_id, name, capacity) 
SELECT t.id, 'Aula 1 - Penale', 30 FROM tribunali t WHERE t.name = 'Tribunale di Napoli'
UNION ALL
SELECT t.id, 'Aula 2 - Penale', 25 FROM tribunali t WHERE t.name = 'Tribunale di Napoli'
UNION ALL
SELECT t.id, 'Aula 3 - Civile', 40 FROM tribunali t WHERE t.name = 'Tribunale di Napoli'
UNION ALL
SELECT t.id, 'Aula 4 - Civile', 35 FROM tribunali t WHERE t.name = 'Tribunale di Napoli'
UNION ALL
SELECT t.id, 'Aula 5 - Commerciale', 20 FROM tribunali t WHERE t.name = 'Tribunale di Napoli'
ON CONFLICT DO NOTHING;

-- Create chat rooms for each aula
INSERT INTO chat_rooms (aula_id, name)
SELECT a.id, 'Chat ' || a.name FROM aule a
ON CONFLICT DO NOTHING;
