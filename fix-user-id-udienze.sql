-- Script per verificare e correggere il problema user_id nelle udienze
-- Esegui questo script nel SQL Editor di Supabase

-- 1. Verifica tutti gli user_id nelle udienze
SELECT user_id, COUNT(*) as count
FROM udienze 
GROUP BY user_id
ORDER BY count DESC;

-- 2. Verifica tutti i profili utenti
SELECT id, name, email, created_at
FROM profiles 
ORDER BY created_at DESC;

-- 3. Mostra le udienze con i dettagli degli utenti
SELECT 
  u.id as udienza_id,
  u.title,
  u.date,
  u.status,
  u.user_id,
  p.name as user_name,
  p.email as user_email
FROM udienze u
LEFT JOIN profiles p ON u.user_id = p.id
ORDER BY u.created_at DESC;

-- 4. Se necessario, aggiorna le udienze con l'ID corretto
-- ATTENZIONE: Sostituisci 'OLD_USER_ID' e 'NEW_USER_ID' con gli ID reali
-- UPDATE udienze 
-- SET user_id = 'NEW_USER_ID' 
-- WHERE user_id = 'OLD_USER_ID';

-- 5. Verifica le RLS policies per udienze
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'udienze';

-- 6. Test: Conta udienze per un user_id specifico
-- SELECT COUNT(*) as udienze_count
-- FROM udienze 
-- WHERE user_id = '78777e36-c097-4ede-a2ba-19df75b56cca';

-- 7. Se le udienze appartengono a un altro utente, crea una copia per l'utente corrente
-- INSERT INTO udienze (user_id, title, date, status, aula_id, description)
-- SELECT 
--   '78777e36-c097-4ede-a2ba-19df75b56cca' as user_id,
--   title,
--   date,
--   status,
--   aula_id,
--   description
-- FROM udienze 
-- WHERE user_id = '84ba1be4-e66b-41ec-9164-5b3a0be4dea7';
