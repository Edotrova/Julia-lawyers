-- Script per aggiungere il campo 'read' alla tabella messages
-- Questo campo traccia se un messaggio è stato letto dal destinatario

-- Aggiungi il campo 'read' alla tabella messages
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT FALSE;

-- Crea un indice per migliorare le performance delle query sui messaggi non letti
CREATE INDEX IF NOT EXISTS idx_messages_receiver_read 
ON messages(receiver_id, read) 
WHERE read = FALSE;

-- Aggiorna tutti i messaggi esistenti come non letti (opzionale)
-- UPDATE messages SET read = FALSE WHERE read IS NULL;

-- Mostra la struttura aggiornata della tabella
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'messages' 
ORDER BY ordinal_position;
