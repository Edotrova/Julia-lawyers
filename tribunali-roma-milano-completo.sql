-- DATABASE COMPLETO TRIBUNALI ROMA E MILANO
-- Questo script include tribunali, sezioni e aule specifiche per Roma e Milano

-- STEP 1: Aggiorna lo schema se necessario
ALTER TABLE tribunali 
ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'civile' 
CHECK (type IN ('penale', 'civile', 'amministrativo'));

-- STEP 2: Inserisci i tribunali di Roma e Milano
INSERT INTO tribunali (name, city, address, type) VALUES 
-- ROMA - TRIBUNALI PENALI
('Tribunale di Roma - Sezione 1ª Penale', 'Roma', 'Via Cavour, 1, 00184 Roma RM', 'penale'),
('Tribunale di Roma - Sezione 2ª Penale', 'Roma', 'Via Cavour, 1, 00184 Roma RM', 'penale'),
('Tribunale di Roma - Sezione 3ª Penale', 'Roma', 'Via Cavour, 1, 00184 Roma RM', 'penale'),
('Tribunale di Roma - Sezione 4ª Penale', 'Roma', 'Via Cavour, 1, 00184 Roma RM', 'penale'),
('Tribunale di Roma - Sezione 5ª Penale', 'Roma', 'Via Cavour, 1, 00184 Roma RM', 'penale'),
('Tribunale di Roma - Sezione 6ª Penale', 'Roma', 'Via Cavour, 1, 00184 Roma RM', 'penale'),
('Tribunale di Roma - Sezione 7ª Penale', 'Roma', 'Via Cavour, 1, 00184 Roma RM', 'penale'),
('Tribunale di Roma - Sezione 8ª Penale', 'Roma', 'Via Cavour, 1, 00184 Roma RM', 'penale'),
('Tribunale di Roma - Sezione 9ª Penale', 'Roma', 'Via Cavour, 1, 00184 Roma RM', 'penale'),
('Tribunale di Roma - Sezione 10ª Penale', 'Roma', 'Via Cavour, 1, 00184 Roma RM', 'penale'),

-- ROMA - TRIBUNALI CIVILI
('Tribunale di Roma - Sezione 1ª Civile', 'Roma', 'Via Cavour, 1, 00184 Roma RM', 'civile'),
('Tribunale di Roma - Sezione 2ª Civile', 'Roma', 'Via Cavour, 1, 00184 Roma RM', 'civile'),
('Tribunale di Roma - Sezione 3ª Civile', 'Roma', 'Via Cavour, 1, 00184 Roma RM', 'civile'),
('Tribunale di Roma - Sezione 4ª Civile', 'Roma', 'Via Cavour, 1, 00184 Roma RM', 'civile'),
('Tribunale di Roma - Sezione 5ª Civile', 'Roma', 'Via Cavour, 1, 00184 Roma RM', 'civile'),
('Tribunale di Roma - Sezione 6ª Civile', 'Roma', 'Via Cavour, 1, 00184 Roma RM', 'civile'),
('Tribunale di Roma - Sezione 7ª Civile', 'Roma', 'Via Cavour, 1, 00184 Roma RM', 'civile'),
('Tribunale di Roma - Sezione 8ª Civile', 'Roma', 'Via Cavour, 1, 00184 Roma RM', 'civile'),
('Tribunale di Roma - Sezione 9ª Civile', 'Roma', 'Via Cavour, 1, 00184 Roma RM', 'civile'),
('Tribunale di Roma - Sezione 10ª Civile', 'Roma', 'Via Cavour, 1, 00184 Roma RM', 'civile'),

-- ROMA - TRIBUNALI AMMINISTRATIVI
('Tribunale Amministrativo Regionale del Lazio', 'Roma', 'Piazza Cavour, 1, 00193 Roma RM', 'amministrativo'),

-- MILANO - TRIBUNALI PENALI
('Tribunale di Milano - Sezione 1ª Penale', 'Milano', 'Corso di Porta Vittoria, 15, 20122 Milano MI', 'penale'),
('Tribunale di Milano - Sezione 2ª Penale', 'Milano', 'Corso di Porta Vittoria, 15, 20122 Milano MI', 'penale'),
('Tribunale di Milano - Sezione 3ª Penale', 'Milano', 'Corso di Porta Vittoria, 15, 20122 Milano MI', 'penale'),
('Tribunale di Milano - Sezione 4ª Penale', 'Milano', 'Corso di Porta Vittoria, 15, 20122 Milano MI', 'penale'),
('Tribunale di Milano - Sezione 5ª Penale', 'Milano', 'Corso di Porta Vittoria, 15, 20122 Milano MI', 'penale'),
('Tribunale di Milano - Sezione 6ª Penale', 'Milano', 'Corso di Porta Vittoria, 15, 20122 Milano MI', 'penale'),
('Tribunale di Milano - Sezione 7ª Penale', 'Milano', 'Corso di Porta Vittoria, 15, 20122 Milano MI', 'penale'),
('Tribunale di Milano - Sezione 8ª Penale', 'Milano', 'Corso di Porta Vittoria, 15, 20122 Milano MI', 'penale'),
('Tribunale di Milano - Sezione 9ª Penale', 'Milano', 'Corso di Porta Vittoria, 15, 20122 Milano MI', 'penale'),

-- MILANO - TRIBUNALI CIVILI
('Tribunale di Milano - Sezione 1ª Civile', 'Milano', 'Corso di Porta Vittoria, 15, 20122 Milano MI', 'civile'),
('Tribunale di Milano - Sezione 2ª Civile', 'Milano', 'Corso di Porta Vittoria, 15, 20122 Milano MI', 'civile'),
('Tribunale di Milano - Sezione 3ª Civile', 'Milano', 'Corso di Porta Vittoria, 15, 20122 Milano MI', 'civile'),
('Tribunale di Milano - Sezione 4ª Civile', 'Milano', 'Corso di Porta Vittoria, 15, 20122 Milano MI', 'civile'),
('Tribunale di Milano - Sezione 5ª Civile', 'Milano', 'Corso di Porta Vittoria, 15, 20122 Milano MI', 'civile'),
('Tribunale di Milano - Sezione 6ª Civile', 'Milano', 'Corso di Porta Vittoria, 15, 20122 Milano MI', 'civile'),
('Tribunale di Milano - Sezione 7ª Civile', 'Milano', 'Corso di Porta Vittoria, 15, 20122 Milano MI', 'civile'),
('Tribunale di Milano - Sezione 8ª Civile', 'Milano', 'Corso di Porta Vittoria, 15, 20122 Milano MI', 'civile'),
('Tribunale di Milano - Sezione 9ª Civile', 'Milano', 'Corso di Porta Vittoria, 15, 20122 Milano MI', 'civile'),
('Tribunale di Milano - Sezione 10ª Civile', 'Milano', 'Corso di Porta Vittoria, 15, 20122 Milano MI', 'civile'),
('Tribunale di Milano - Sezione 11ª Civile', 'Milano', 'Corso di Porta Vittoria, 15, 20122 Milano MI', 'civile'),
('Tribunale di Milano - Sezione 12ª Civile', 'Milano', 'Corso di Porta Vittoria, 15, 20122 Milano MI', 'civile'),

-- MILANO - TRIBUNALI AMMINISTRATIVI
('Tribunale Amministrativo Regionale della Lombardia', 'Milano', 'Via San Barnaba, 50, 20122 Milano MI', 'amministrativo')

ON CONFLICT (name, city, type) DO NOTHING;

-- STEP 3: Aggiungi aule specifiche per ogni tribunale
DO $$
DECLARE
    tribunale_record RECORD;
BEGIN
    -- AULE PER TRIBUNALI PENALI DI ROMA
    FOR tribunale_record IN 
        SELECT id, name FROM tribunali 
        WHERE city = 'Roma' AND type = 'penale'
    LOOP
        INSERT INTO aule (tribunale_id, name, capacity) VALUES
        (tribunale_record.id, 'Aula Collegiale - Palazzina A', 50),
        (tribunale_record.id, 'Aula Monocratica 1 - Palazzina B', 30),
        (tribunale_record.id, 'Aula Monocratica 2 - Palazzina B', 30),
        (tribunale_record.id, 'Aula Monocratica 3 - Palazzina B', 30),
        (tribunale_record.id, 'Aula Dibattimento', 40),
        (tribunale_record.id, 'Aula Post-Dibattimento', 25);
    END LOOP;

    -- AULE PER TRIBUNALI CIVILI DI ROMA
    FOR tribunale_record IN 
        SELECT id, name FROM tribunali 
        WHERE city = 'Roma' AND type = 'civile'
    LOOP
        INSERT INTO aule (tribunale_id, name, capacity) VALUES
        (tribunale_record.id, 'Aula 1 - Civile', 40),
        (tribunale_record.id, 'Aula 2 - Civile', 35),
        (tribunale_record.id, 'Aula 3 - Civile', 30),
        (tribunale_record.id, 'Aula 4 - Civile', 25),
        (tribunale_record.id, 'Aula 5 - Civile', 45),
        (tribunale_record.id, 'Aula 6 - Civile', 20);
    END LOOP;

    -- AULE PER TRIBUNALE AMMINISTRATIVO DI ROMA
    FOR tribunale_record IN 
        SELECT id, name FROM tribunali 
        WHERE city = 'Roma' AND type = 'amministrativo'
    LOOP
        INSERT INTO aule (tribunale_id, name, capacity) VALUES
        (tribunale_record.id, 'Aula 1 - Amministrativo', 25),
        (tribunale_record.id, 'Aula 2 - Amministrativo', 30),
        (tribunale_record.id, 'Aula 3 - Amministrativo', 20),
        (tribunale_record.id, 'Aula 4 - Amministrativo', 35);
    END LOOP;

    -- AULE PER TRIBUNALI PENALI DI MILANO
    FOR tribunale_record IN 
        SELECT id, name FROM tribunali 
        WHERE city = 'Milano' AND type = 'penale'
    LOOP
        INSERT INTO aule (tribunale_id, name, capacity) VALUES
        (tribunale_record.id, 'Aula Penale 1', 40),
        (tribunale_record.id, 'Aula Penale 2', 35),
        (tribunale_record.id, 'Aula Penale 3', 30),
        (tribunale_record.id, 'Aula Penale 4', 25),
        (tribunale_record.id, 'Aula Penale 5', 45);
    END LOOP;

    -- AULE PER TRIBUNALI CIVILI DI MILANO
    FOR tribunale_record IN 
        SELECT id, name FROM tribunali 
        WHERE city = 'Milano' AND type = 'civile'
    LOOP
        INSERT INTO aule (tribunale_id, name, capacity) VALUES
        (tribunale_record.id, 'Aula Civile 1', 40),
        (tribunale_record.id, 'Aula Civile 2', 35),
        (tribunale_record.id, 'Aula Civile 3', 30),
        (tribunale_record.id, 'Aula Civile 4', 25),
        (tribunale_record.id, 'Aula Civile 5', 45),
        (tribunale_record.id, 'Aula Civile 6', 20);
    END LOOP;

    -- AULE PER TRIBUNALE AMMINISTRATIVO DI MILANO
    FOR tribunale_record IN 
        SELECT id, name FROM tribunali 
        WHERE city = 'Milano' AND type = 'amministrativo'
    LOOP
        INSERT INTO aule (tribunale_id, name, capacity) VALUES
        (tribunale_record.id, 'Aula 1 - Amministrativo', 25),
        (tribunale_record.id, 'Aula 2 - Amministrativo', 30),
        (tribunale_record.id, 'Aula 3 - Amministrativo', 20),
        (tribunale_record.id, 'Aula 4 - Amministrativo', 35);
    END LOOP;
END $$;

-- STEP 4: Crea chat rooms per tutte le aule
INSERT INTO chat_rooms (aula_id, name)
SELECT a.id, 'Chat ' || a.name 
FROM aule a
WHERE a.id NOT IN (SELECT aula_id FROM chat_rooms)
ON CONFLICT DO NOTHING;

-- STEP 5: Verifica finale
SELECT 
    'Database Roma e Milano completato!' as status,
    COUNT(DISTINCT t.city) as citta_totali,
    COUNT(DISTINCT t.id) as tribunali_totali,
    COUNT(DISTINCT a.id) as aule_totali
FROM tribunali t
LEFT JOIN aule a ON t.id = a.tribunale_id
WHERE t.city IN ('Roma', 'Milano');

-- Mostra riepilogo per città
SELECT 
    t.city,
    t.type,
    COUNT(DISTINCT t.id) as tribunali_count,
    COUNT(DISTINCT a.id) as aule_count
FROM tribunali t
LEFT JOIN aule a ON t.id = a.tribunale_id
WHERE t.city IN ('Roma', 'Milano')
GROUP BY t.city, t.type
ORDER BY t.city, t.type;
