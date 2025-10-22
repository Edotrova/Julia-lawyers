-- Script per aggiornare la tabella profiles con la struttura corretta
-- Esegui questo script in Supabase SQL Editor

-- Prima verifichiamo se la tabella esiste e ha la struttura corretta
DO $$
BEGIN
    -- Controlla se la colonna full_name esiste e la rimuovi se presente
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'full_name'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles DROP COLUMN full_name;
    END IF;
    
    -- Aggiungi le colonne mancanti se non esistono
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'first_name'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN first_name TEXT NOT NULL DEFAULT 'Utente';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'last_name'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN last_name TEXT NOT NULL DEFAULT '';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'bar_number'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN bar_number TEXT NOT NULL DEFAULT '';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'specialization'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN specialization TEXT[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'bio'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN bio TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'phone'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN phone TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'is_verified'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN is_verified BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'updated_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Aggiorna i profili esistenti che potrebbero avere dati nei metadati
UPDATE public.profiles 
SET 
    first_name = COALESCE(
        (SELECT raw_user_meta_data->>'first_name' FROM auth.users WHERE auth.users.id = profiles.user_id),
        'Utente'
    ),
    last_name = COALESCE(
        (SELECT raw_user_meta_data->>'last_name' FROM auth.users WHERE auth.users.id = profiles.user_id),
        ''
    ),
    bar_number = COALESCE(
        (SELECT raw_user_meta_data->>'bar_number' FROM auth.users WHERE auth.users.id = profiles.user_id),
        ''
    ),
    specialization = COALESCE(
        string_to_array(
            (SELECT raw_user_meta_data->>'specializations' FROM auth.users WHERE auth.users.id = profiles.user_id),
            ','
        ),
        '{}'
    ),
    phone = (
        SELECT raw_user_meta_data->>'phone_number' FROM auth.users WHERE auth.users.id = profiles.user_id
    )
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data IS NOT NULL 
    AND (
        raw_user_meta_data->>'first_name' IS NOT NULL 
        OR raw_user_meta_data->>'last_name' IS NOT NULL
        OR raw_user_meta_data->>'bar_number' IS NOT NULL
    )
);

-- Assicurati che la tabella abbia RLS abilitato
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Rimuovi le policy esistenti se esistono
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation during registration" ON profiles;

-- Crea le policy corrette
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id);

-- Policy permette la creazione del profilo durante la registrazione
CREATE POLICY "Allow profile creation during registration" ON profiles
    FOR INSERT TO authenticated WITH CHECK (true);

-- Crea gli indici se non esistono
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_bar_number ON profiles(bar_number);

-- Crea il trigger per updated_at se non esiste
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
