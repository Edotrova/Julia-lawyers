-- Aggiornamento schema tribunali per includere il tipo
-- Questo script aggiunge il campo 'type' alla tabella tribunali

-- Aggiungi la colonna 'type' alla tabella tribunali
ALTER TABLE tribunali 
ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'civile' 
CHECK (type IN ('penale', 'civile', 'amministrativo'));

-- Aggiorna il tribunale esistente di Roma per specificare che è civile
UPDATE tribunali 
SET type = 'civile' 
WHERE name = 'Tribunale di Roma';

-- Aggiungi un indice per migliorare le performance delle query per tipo
CREATE INDEX IF NOT EXISTS idx_tribunali_type ON tribunali(type);
CREATE INDEX IF NOT EXISTS idx_tribunali_city ON tribunali(city);
CREATE INDEX IF NOT EXISTS idx_tribunali_city_type ON tribunali(city, type);

-- Aggiungi commenti per documentare i tipi
COMMENT ON COLUMN tribunali.type IS 'Tipo di tribunale: penale, civile, amministrativo';
COMMENT ON COLUMN tribunali.city IS 'Città del tribunale';
COMMENT ON COLUMN tribunali.address IS 'Indirizzo completo del tribunale';
