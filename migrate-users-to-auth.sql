-- Script per migrare utenti dalla tabella users a auth.users
-- ATTENZIONE: Questo script richiede privilegi di amministratore

-- Prima, verifica che la tabella users esista e abbia dati
SELECT COUNT(*) as total_users FROM users;

-- Per ogni utente nella tabella users, crea un utente in auth.users
-- NOTA: Questo richiede l'uso dell'API di Supabase o del dashboard
-- Non possiamo inserire direttamente in auth.users per motivi di sicurezza

-- Alternativa: Crea un trigger che sincronizza le tabelle
CREATE OR REPLACE FUNCTION sync_user_to_auth()
RETURNS TRIGGER AS $$
BEGIN
  -- Questo trigger dovrebbe essere implementato con l'API di Supabase
  -- Non possiamo modificare direttamente auth.users
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crea il trigger
CREATE TRIGGER sync_users_trigger
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_to_auth();
