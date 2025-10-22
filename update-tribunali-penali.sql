-- Script per aggiornare i tribunali con i nuovi dati penali
-- Elimina tutti i tribunali esistenti e inserisce i nuovi dati

-- STEP 1: Elimina tutte le aule associate ai tribunali
DELETE FROM aule WHERE tribunale_id IN (SELECT id FROM tribunali);

-- STEP 2: Elimina tutti i tribunali esistenti
DELETE FROM tribunali;

-- STEP 3: Inserisci i nuovi tribunali penali
INSERT INTO tribunali (name, city, address, type) VALUES 

-- TRIBUNALE DI ROMA SEZIONE PENALE
('TRIBUNALE DI ROMA SEZIONE PENALE', 'Roma', 'Via Cavour, 1, 00184 Roma RM', 'penale'),

-- CORTE D'APPELLO DI ROMA SEZIONE PENALE  
('CORTE D''APPELLO DI ROMA SEZIONE PENALE', 'Roma', 'Via Cavour, 1, 00184 Roma RM', 'penale'),

-- GIUDICE DI PACE PENALE
('GIUDICE DI PACE PENALE', 'Roma', 'Via Cavour, 1, 00184 Roma RM', 'penale'),

-- SUPREMA CORTE DI CASSAZIONE
('SUPREMA CORTE DI CASSAZIONE', 'Roma', 'Piazza Cavour, 00193 Roma RM', 'penale'),

-- CIVITAVECCHIA
('TRIBUNALE DI CIVITAVECCHIA', 'Civitavecchia', 'Via Roma, 00053 Civitavecchia RM', 'penale'),

-- RIETI
('TRIBUNALE DI RIETI', 'Rieti', 'Via Salaria, 02100 Rieti RI', 'penale'),

-- TIVOLI
('TRIBUNALE DI TIVOLI', 'Tivoli', 'Via Roma, 00019 Tivoli RM', 'penale'),

-- VELLETRI
('TRIBUNALE DI VELLETRI', 'Velletri', 'Via Roma, 00049 Velletri RM', 'penale'),

-- FROSINONE
('TRIBUNALE DI FROSINONE', 'Frosinone', 'Via Roma, 03100 Frosinone FR', 'penale'),

-- LATINA
('TRIBUNALE DI LATINA', 'Latina', 'Via Roma, 04100 Latina LT', 'penale'),

-- CASSINO
('TRIBUNALE DI CASSINO', 'Cassino', 'Via Roma, 03043 Cassino FR', 'penale'),

-- GIUDICE DI PACE DI CIVITAVECCHIA
('GIUDICE DI PACE DI CIVITAVECCHIA', 'Civitavecchia', 'Via Roma, 00053 Civitavecchia RM', 'penale'),

-- GIUDICE DI PACE DI RIETI
('GIUDICE DI PACE DI RIETI', 'Rieti', 'Via Salaria, 02100 Rieti RI', 'penale');

-- STEP 4: Inserisci le aule per ogni tribunale
-- TRIBUNALE DI ROMA SEZIONE PENALE - Aule
INSERT INTO aule (tribunale_id, name, capacity) 
SELECT t.id, aula_name, 50
FROM tribunali t
CROSS JOIN (
    VALUES 
    -- TRIBUNALE MONOCRATICO AULE DA N. 1 A N. 27
    ('TRIBUNALE MONOCRATICO AULA N. 1'),
    ('TRIBUNALE MONOCRATICO AULA N. 2'),
    ('TRIBUNALE MONOCRATICO AULA N. 3'),
    ('TRIBUNALE MONOCRATICO AULA N. 4'),
    ('TRIBUNALE MONOCRATICO AULA N. 5'),
    ('TRIBUNALE MONOCRATICO AULA N. 6'),
    ('TRIBUNALE MONOCRATICO AULA N. 7'),
    ('TRIBUNALE MONOCRATICO AULA N. 8'),
    ('TRIBUNALE MONOCRATICO AULA N. 9'),
    ('TRIBUNALE MONOCRATICO AULA N. 10'),
    ('TRIBUNALE MONOCRATICO AULA N. 11'),
    ('TRIBUNALE MONOCRATICO AULA N. 12'),
    ('TRIBUNALE MONOCRATICO AULA N. 13'),
    ('TRIBUNALE MONOCRATICO AULA N. 14'),
    ('TRIBUNALE MONOCRATICO AULA N. 15'),
    ('TRIBUNALE MONOCRATICO AULA N. 16'),
    ('TRIBUNALE MONOCRATICO AULA N. 17'),
    ('TRIBUNALE MONOCRATICO AULA N. 18'),
    ('TRIBUNALE MONOCRATICO AULA N. 19'),
    ('TRIBUNALE MONOCRATICO AULA N. 20'),
    ('TRIBUNALE MONOCRATICO AULA N. 21'),
    ('TRIBUNALE MONOCRATICO AULA N. 22'),
    ('TRIBUNALE MONOCRATICO AULA N. 23'),
    ('TRIBUNALE MONOCRATICO AULA N. 24'),
    ('TRIBUNALE MONOCRATICO AULA N. 25'),
    ('TRIBUNALE MONOCRATICO AULA N. 26'),
    ('TRIBUNALE MONOCRATICO AULA N. 27'),
    -- TRIBUNALE COLLEGIALE AULA DA N. 1 A N. 10 SENZA LA N. 3
    ('TRIBUNALE COLLEGIALE AULA N. 1'),
    ('TRIBUNALE COLLEGIALE AULA N. 2'),
    ('TRIBUNALE COLLEGIALE AULA N. 4'),
    ('TRIBUNALE COLLEGIALE AULA N. 5'),
    ('TRIBUNALE COLLEGIALE AULA N. 6'),
    ('TRIBUNALE COLLEGIALE AULA N. 7'),
    ('TRIBUNALE COLLEGIALE AULA N. 8'),
    ('TRIBUNALE COLLEGIALE AULA N. 9'),
    ('TRIBUNALE COLLEGIALE AULA N. 10'),
    -- TRIBUNALE PER IL RIESAME AULA 3 COLLEGIALE
    ('TRIBUNALE PER IL RIESAME AULA 3 COLLEGIALE'),
    -- AULA OCCORSIO
    ('AULA OCCORSIO'),
    -- AULE GIP/GUP DA N. 1 A N. 11
    ('AULA GIP/GUP N. 1'),
    ('AULA GIP/GUP N. 2'),
    ('AULA GIP/GUP N. 3'),
    ('AULA GIP/GUP N. 4'),
    ('AULA GIP/GUP N. 5'),
    ('AULA GIP/GUP N. 6'),
    ('AULA GIP/GUP N. 7'),
    ('AULA GIP/GUP N. 8'),
    ('AULA GIP/GUP N. 9'),
    ('AULA GIP/GUP N. 10'),
    ('AULA GIP/GUP N. 11'),
    -- TRIBUNALE PER LE MISURE DI PREVENZIONE AULA 11 GIP/GUP
    ('TRIBUNALE PER LE MISURE DI PREVENZIONE AULA 11 GIP/GUP'),
    -- AULA CORTE D'ASSISE
    ('AULA CORTE D''ASSISE')
) AS aulas(aula_name)
WHERE t.name = 'TRIBUNALE DI ROMA SEZIONE PENALE';

-- CORTE D'APPELLO DI ROMA SEZIONE PENALE - Aule
INSERT INTO aule (tribunale_id, name, capacity) 
SELECT t.id, aula_name, 50
FROM tribunali t
CROSS JOIN (
    VALUES 
    -- AULE DA N. 1,2,3,4
    ('AULA N. 1'),
    ('AULA N. 2'),
    ('AULA N. 3'),
    ('AULA N. 4'),
    -- AULA CORTE D'ASSISE D'APPELLO
    ('AULA CORTE D''ASSISE D''APPELLO'),
    -- AULA EUROPA
    ('AULA EUROPA')
) AS aulas(aula_name)
WHERE t.name = 'CORTE D''APPELLO DI ROMA SEZIONE PENALE';

-- GIUDICE DI PACE PENALE - Aule
INSERT INTO aule (tribunale_id, name, capacity) 
SELECT t.id, aula_name, 30
FROM tribunali t
CROSS JOIN (
    VALUES 
    -- AULE DA AULA A AD AULA F
    ('AULA A'),
    ('AULA B'),
    ('AULA C'),
    ('AULA D'),
    ('AULA E'),
    ('AULA F')
) AS aulas(aula_name)
WHERE t.name = 'GIUDICE DI PACE PENALE';

-- SUPREMA CORTE DI CASSAZIONE - Aule
INSERT INTO aule (tribunale_id, name, capacity) 
SELECT t.id, aula_name, 100
FROM tribunali t
CROSS JOIN (
    VALUES 
    -- 6 AULE DA SEZIONE PRIMA A SEZIONE SESTA
    ('SEZIONE PRIMA'),
    ('SEZIONE SECONDA'),
    ('SEZIONE TERZA'),
    ('SEZIONE QUARTA'),
    ('SEZIONE QUINTA'),
    ('SEZIONE SESTA'),
    -- 1 AULA SEZIONI UNITE
    ('SEZIONI UNITE')
) AS aulas(aula_name)
WHERE t.name = 'SUPREMA CORTE DI CASSAZIONE';

-- CIVITAVECCHIA - Aule
INSERT INTO aule (tribunale_id, name, capacity) 
SELECT t.id, aula_name, 30
FROM tribunali t
CROSS JOIN (
    VALUES 
    ('AULA A'),
    ('AULA B'),
    ('AULA C'),
    ('AULA D')
) AS aulas(aula_name)
WHERE t.name = 'TRIBUNALE DI CIVITAVECCHIA';

-- RIETI - Aule
INSERT INTO aule (tribunale_id, name, capacity) 
SELECT t.id, aula_name, 30
FROM tribunali t
CROSS JOIN (
    VALUES 
    ('AULA CAPERNA'),
    ('AULA RECCHIA'),
    ('AULA N. 2')
) AS aulas(aula_name)
WHERE t.name = 'TRIBUNALE DI RIETI';

-- TIVOLI - Aule
INSERT INTO aule (tribunale_id, name, capacity) 
SELECT t.id, aula_name, 30
FROM tribunali t
CROSS JOIN (
    VALUES 
    ('AULA 1'),
    ('AULA 2'),
    ('AULA 3'),
    ('AULA 4'),
    ('AULA GIP/GUP')
) AS aulas(aula_name)
WHERE t.name = 'TRIBUNALE DI TIVOLI';

-- VELLETRI - Aule
INSERT INTO aule (tribunale_id, name, capacity) 
SELECT t.id, aula_name, 30
FROM tribunali t
CROSS JOIN (
    VALUES 
    ('AULA PIANO TERRA MONOCRATICA'),
    ('AULA COLLEGIALE PRIMO PIANO'),
    ('AULA 1 GIP TERZO PIANO'),
    ('AULA 2 GIP TERZO PIANO'),
    ('AULA 1 MONOCRATICO QUARTO PIANO'),
    ('AULA 2 MONOCRATICO QUARTO PIANO')
) AS aulas(aula_name)
WHERE t.name = 'TRIBUNALE DI VELLETRI';

-- FROSINONE - Aule
INSERT INTO aule (tribunale_id, name, capacity) 
SELECT t.id, aula_name, 30
FROM tribunali t
CROSS JOIN (
    VALUES 
    ('AULA A'),
    ('AULA B'),
    ('AULA C'),
    ('AULA D'),
    ('AULA GIP/GUP')
) AS aulas(aula_name)
WHERE t.name = 'TRIBUNALE DI FROSINONE';

-- LATINA - Aule
INSERT INTO aule (tribunale_id, name, capacity) 
SELECT t.id, aula_name, 30
FROM tribunali t
CROSS JOIN (
    VALUES 
    ('AULA 1'),
    ('AULA 2'),
    ('AULA 3'),
    ('AULA C'),
    ('AULA CORTE D''ASSISE'),
    ('AULA D')
) AS aulas(aula_name)
WHERE t.name = 'TRIBUNALE DI LATINA';

-- CASSINO - Aule (attendere)
INSERT INTO aule (tribunale_id, name, capacity) 
SELECT t.id, 'AULA ATTENDERE', 30
FROM tribunali t
WHERE t.name = 'TRIBUNALE DI CASSINO';

-- GIUDICE DI PACE DI CIVITAVECCHIA - Aule
INSERT INTO aule (tribunale_id, name, capacity) 
SELECT t.id, 'AULA UNICA', 20
FROM tribunali t
WHERE t.name = 'GIUDICE DI PACE DI CIVITAVECCHIA';

-- GIUDICE DI PACE DI RIETI - Aule
INSERT INTO aule (tribunale_id, name, capacity) 
SELECT t.id, 'AULA UNICA', 20
FROM tribunali t
WHERE t.name = 'GIUDICE DI PACE DI RIETI';

-- Aggiorna gli indici per migliorare le performance
CREATE INDEX IF NOT EXISTS idx_tribunali_type ON tribunali(type);
CREATE INDEX IF NOT EXISTS idx_tribunali_city ON tribunali(city);
CREATE INDEX IF NOT EXISTS idx_tribunali_city_type ON tribunali(city, type);
CREATE INDEX IF NOT EXISTS idx_aule_tribunale_id ON aule(tribunale_id);

-- Mostra il risultato
SELECT 
    t.name as tribunale,
    t.city,
    t.type,
    COUNT(a.id) as numero_aule
FROM tribunali t
LEFT JOIN aule a ON t.id = a.tribunale_id
GROUP BY t.id, t.name, t.city, t.type
ORDER BY t.city, t.name;
