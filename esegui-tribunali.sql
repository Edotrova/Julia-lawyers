-- SCRIPT SICURO: Aggiunge solo i tribunali di Roma e Milano
-- Non tocca lo schema esistente

-- STEP 1: Aggiungi la colonna 'type' se non esiste
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
