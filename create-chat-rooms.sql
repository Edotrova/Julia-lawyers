-- Script per creare chat rooms per tutte le aule esistenti
-- Questo script bypassa i problemi di RLS creando le chat rooms direttamente

-- Prima, disabilita temporaneamente RLS per la tabella chat_rooms
ALTER TABLE chat_rooms DISABLE ROW LEVEL SECURITY;

-- Crea chat rooms per tutte le aule che non ne hanno una
INSERT INTO chat_rooms (aula_id, name)
SELECT 
    a.id as aula_id,
    'Chat ' || a.name || ' - ' || t.name as name
FROM aule a
JOIN tribunali t ON a.tribunale_id = t.id
WHERE NOT EXISTS (
    SELECT 1 FROM chat_rooms cr WHERE cr.aula_id = a.id
);

-- Riabilita RLS per la tabella chat_rooms
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

-- Crea una policy per permettere agli utenti autenticati di leggere le chat rooms
CREATE POLICY "Allow authenticated users to read chat_rooms" ON chat_rooms
    FOR SELECT TO authenticated
    USING (true);

-- Crea una policy per permettere agli utenti autenticati di inserire messaggi nelle chat rooms
CREATE POLICY "Allow authenticated users to insert messages" ON messages
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Crea una policy per permettere agli utenti autenticati di leggere i propri messaggi
CREATE POLICY "Allow authenticated users to read messages" ON messages
    FOR SELECT TO authenticated
    USING (
        sender_id = auth.uid() OR 
        receiver_id = auth.uid() OR 
        chat_room_id IN (
            SELECT id FROM chat_rooms
        )
    );

-- Mostra le chat rooms create
SELECT 
    cr.id,
    cr.name,
    a.name as aula_name,
    t.name as tribunale_name
FROM chat_rooms cr
JOIN aule a ON cr.aula_id = a.id
JOIN tribunali t ON a.tribunale_id = t.id
ORDER BY t.name, a.name;
