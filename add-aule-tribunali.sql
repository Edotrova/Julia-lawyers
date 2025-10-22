-- Script per aggiungere aule di esempio per ogni tribunale
-- Questo script crea aule standard per ogni tribunale importato

-- Funzione per aggiungere aule standard a un tribunale
DO $$
DECLARE
    tribunale_record RECORD;
    aula_count INTEGER;
BEGIN
    -- Per ogni tribunale, aggiungi aule standard
    FOR tribunale_record IN 
        SELECT id, name, type FROM tribunali 
        WHERE name NOT LIKE '%Roma%' OR name = 'Tribunale di Roma - Sezione Civile'
    LOOP
        -- Conta le aule esistenti per questo tribunale
        SELECT COUNT(*) INTO aula_count FROM aule WHERE tribunale_id = tribunale_record.id;
        
        -- Se non ci sono aule, aggiungi aule standard
        IF aula_count = 0 THEN
            -- Aule standard per tribunali penali
            IF tribunale_record.type = 'penale' THEN
                INSERT INTO aule (tribunale_id, name, capacity) VALUES
                (tribunale_record.id, 'Aula 1 - Penale', 30),
                (tribunale_record.id, 'Aula 2 - Penale', 25),
                (tribunale_record.id, 'Aula 3 - Penale', 35),
                (tribunale_record.id, 'Aula 4 - Penale', 20),
                (tribunale_record.id, 'Aula 5 - Penale', 40);
            END IF;
            
            -- Aule standard per tribunali civili
            IF tribunale_record.type = 'civile' THEN
                INSERT INTO aule (tribunale_id, name, capacity) VALUES
                (tribunale_record.id, 'Aula 1 - Civile', 40),
                (tribunale_record.id, 'Aula 2 - Civile', 35),
                (tribunale_record.id, 'Aula 3 - Civile', 30),
                (tribunale_record.id, 'Aula 4 - Civile', 25),
                (tribunale_record.id, 'Aula 5 - Civile', 45),
                (tribunale_record.id, 'Aula 6 - Civile', 20);
            END IF;
            
            -- Aule standard per tribunali amministrativi
            IF tribunale_record.type = 'amministrativo' THEN
                INSERT INTO aule (tribunale_id, name, capacity) VALUES
                (tribunale_record.id, 'Aula 1 - Amministrativo', 25),
                (tribunale_record.id, 'Aula 2 - Amministrativo', 30),
                (tribunale_record.id, 'Aula 3 - Amministrativo', 20),
                (tribunale_record.id, 'Aula 4 - Amministrativo', 35);
            END IF;
        END IF;
    END LOOP;
END $$;

-- Crea chat rooms per tutte le aule
INSERT INTO chat_rooms (aula_id, name)
SELECT a.id, 'Chat ' || a.name 
FROM aule a
WHERE a.id NOT IN (SELECT aula_id FROM chat_rooms)
ON CONFLICT DO NOTHING;
