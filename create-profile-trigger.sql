-- Trigger per creare automaticamente il profilo quando un utente si registra
-- Esegui questo script in Supabase SQL Editor

-- Funzione per creare automaticamente il profilo
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, bar_number, specialization, is_verified)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Utente'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'bar_number', ''),
    COALESCE(string_to_array(NEW.raw_user_meta_data->>'specializations', ','), '{}'),
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger per eseguire la funzione quando viene creato un nuovo utente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Policy per permettere la creazione del profilo durante la registrazione
DROP POLICY IF EXISTS "Allow profile creation during registration" ON profiles;
CREATE POLICY "Allow profile creation during registration" ON profiles
    FOR INSERT TO authenticated WITH CHECK (true);
