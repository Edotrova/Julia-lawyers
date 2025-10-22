-- Trigger per creare automaticamente un profilo quando viene creato un utente
-- Questo script deve essere eseguito nel SQL Editor di Supabase

-- Prima, rimuovi il trigger esistente se c'è
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Crea la funzione per gestire la creazione del profilo
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    first_name, 
    last_name, 
    bar_number, 
    specialization, 
    bio, 
    phone, 
    is_verified,
    avatar_url,
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
    COALESCE(NEW.raw_user_meta_data->>'bio', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone_number', ''),
    false,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', null),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crea il trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Test: verifica che il trigger funzioni
-- (Questo dovrebbe creare un profilo quando registri un nuovo utente)
