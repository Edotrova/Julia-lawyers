-- Test script per verificare se il campo 'read' esiste nella tabella messages
-- Esegui questo script nel SQL Editor di Supabase per verificare

-- 1. Verifica la struttura della tabella messages
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'messages' 
ORDER BY ordinal_position;

-- 2. Conta i messaggi con read = false
SELECT COUNT(*) as messaggi_non_letti
FROM messages 
WHERE read = false;

-- 3. Conta i messaggi con read = true
SELECT COUNT(*) as messaggi_letti
FROM messages 
WHERE read = true;

-- 4. Conta i messaggi con read = null (se il campo non esiste)
SELECT COUNT(*) as messaggi_senza_read
FROM messages 
WHERE read IS NULL;

-- 5. Mostra alcuni messaggi di esempio
SELECT id, sender_id, receiver_id, content, read, created_at
FROM messages 
ORDER BY created_at DESC 
LIMIT 5;
