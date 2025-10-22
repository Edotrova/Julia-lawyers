-- Script per verificare chi ha creato le udienze
-- Esegui questo script nel SQL Editor di Supabase

-- 1. Mostra tutte le udienze con i dettagli degli utenti
SELECT 
  u.id as udienza_id,
  u.title,
  u.date,
  u.status,
  u.user_id,
  u.created_at as udienza_created_at,
  p.name as user_name,
  p.email as user_email,
  p.created_at as user_created_at
FROM udienze u
LEFT JOIN profiles p ON u.user_id = p.id
ORDER BY u.created_at DESC;

-- 2. Conta udienze per ogni utente
SELECT 
  u.user_id,
  p.name as user_name,
  p.email as user_email,
  COUNT(*) as udienze_count
FROM udienze u
LEFT JOIN profiles p ON u.user_id = p.id
GROUP BY u.user_id, p.name, p.email
ORDER BY udienze_count DESC;

-- 3. Verifica se ci sono udienze senza profilo associato
SELECT 
  u.id as udienza_id,
  u.title,
  u.user_id,
  u.created_at
FROM udienze u
LEFT JOIN profiles p ON u.user_id = p.id
WHERE p.id IS NULL;

-- 4. Mostra tutti i profili utenti
SELECT id, name, email, created_at
FROM profiles 
ORDER BY created_at DESC;

-- 5. Test: Cerca udienze per un ID specifico (sostituisci con l'ID reale)
-- SELECT * FROM udienze WHERE user_id = '78777e36-c097-4ede-a2ba-19df75b56cca';

-- 6. Se necessario, aggiorna le udienze con l'ID corretto
-- ATTENZIONE: Sostituisci gli ID con quelli reali
-- UPDATE udienze 
-- SET user_id = '78777e36-c097-4ede-a2ba-19df75b56cca' 
-- WHERE user_id = '84ba1be4-e66b-41ec-9164-5b3a0be4dea7';
