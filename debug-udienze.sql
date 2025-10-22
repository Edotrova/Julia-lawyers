-- Script per verificare le udienze nel database
-- Esegui questo script nel SQL Editor di Supabase

-- 1. Verifica che la tabella udienze esista e abbia dati
SELECT COUNT(*) as totale_udienze FROM udienze;

-- 2. Mostra alcune udienze di esempio
SELECT id, date, status, title, user_id, created_at
FROM udienze 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Conta udienze per user_id
SELECT user_id, COUNT(*) as count
FROM udienze 
GROUP BY user_id
ORDER BY count DESC;

-- 4. Verifica le RLS policies per udienze
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'udienze';

-- 5. Conta udienze per status
SELECT status, COUNT(*) as count
FROM udienze 
GROUP BY status;

-- 6. Verifica il formato delle date
SELECT date, COUNT(*) as count
FROM udienze 
GROUP BY date
ORDER BY date DESC
LIMIT 10;

-- 7. Test con un user_id specifico (sostituisci con l'ID reale)
-- SELECT * FROM udienze WHERE user_id = '78777e36-c097-4ede-a2ba-19df75b56cca';

-- 8. Test range settimana (sostituisci le date con quelle correnti)
-- SELECT * FROM udienze 
-- WHERE date >= '2025-10-13' 
--   AND date <= '2025-10-19' 
--   AND status = 'scheduled';
