-- Trigger semplificato per creare automaticamente un profilo
-- Esegui questo nel SQL Editor di Supabase

-- Rimuovi il trigger esistente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Crea una funzione semplificata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserisci solo i campi essenziali
  INSERT INTO public.profiles (
    user_id, 
    first_name, 
    last_name, 
    bar_number, 
    specialization, 
    is_verified,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Utente'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'bar_number', ''),
    COALESCE(
      CASE 
        WHEN NEW.raw_user_meta_data->>'specializations' IS NOT NULL 
        THEN string_to_array(NEW.raw_user_meta_data->>'specializations', ',')
        ELSE '{}'::text[]
      END, 
      '{}'::text[]
    ),
    false,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log l'errore ma non bloccare la registrazione
    RAISE WARNING 'Errore nella creazione del profilo per user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crea il trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
