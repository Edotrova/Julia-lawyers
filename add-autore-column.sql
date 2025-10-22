-- Aggiungi la colonna autore alla tabella udienze
ALTER TABLE udienze ADD COLUMN IF NOT EXISTS autore TEXT;

-- Aggiorna le udienze esistenti con il nome dell'autore
UPDATE udienze 
SET autore = (
  SELECT CONCAT(p.first_name, ' ', p.last_name)
  FROM profiles p 
  WHERE p.user_id = udienze.user_id
)
WHERE autore IS NULL;

-- Se non ci sono profili, usa un nome generico
UPDATE udienze 
SET autore = 'Avvocato Sconosciuto'
WHERE autore IS NULL;
