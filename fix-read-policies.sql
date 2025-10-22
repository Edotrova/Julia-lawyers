-- Script per correggere le RLS policies per il campo 'read' nella tabella messages
-- Esegui questo script nel SQL Editor di Supabase

-- 1. Verifica se il campo read esiste
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'messages' AND column_name = 'read';

-- 2. Se il campo non esiste, aggiungilo
-- ALTER TABLE public.messages ADD COLUMN read BOOLEAN DEFAULT FALSE;

-- 3. Verifica le policies esistenti per messages
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'messages';

-- 4. Crea/aggiorna la policy per UPDATE (marcare come letto)
DROP POLICY IF EXISTS "Authenticated users can update their messages" ON public.messages;
CREATE POLICY "Authenticated users can update their messages"
ON public.messages FOR UPDATE TO authenticated 
USING (
  (sender_id = auth.uid()) OR (receiver_id = auth.uid())
) 
WITH CHECK (
  (sender_id = auth.uid()) OR (receiver_id = auth.uid())
);

-- 5. Crea/aggiorna la policy per SELECT (leggere i propri messaggi)
DROP POLICY IF EXISTS "Authenticated users can view their messages" ON public.messages;
CREATE POLICY "Authenticated users can view their messages"
ON public.messages FOR SELECT TO authenticated 
USING (
  (sender_id = auth.uid()) OR (receiver_id = auth.uid()) OR (chat_room_id IN (SELECT id FROM public.chat_rooms))
);

-- 6. Crea/aggiorna la policy per INSERT (inviare messaggi)
DROP POLICY IF EXISTS "Authenticated users can insert messages" ON public.messages;
CREATE POLICY "Authenticated users can insert messages"
ON public.messages FOR INSERT TO authenticated 
WITH CHECK (true);

-- 7. Test: Prova a aggiornare un messaggio come letto
-- Sostituisci 'MESSAGE_ID' con un ID reale di messaggio
-- UPDATE public.messages SET read = true WHERE id = 'MESSAGE_ID' AND receiver_id = auth.uid();

-- 8. Verifica che l'aggiornamento sia andato a buon fine
-- SELECT id, read, content FROM public.messages WHERE id = 'MESSAGE_ID';
