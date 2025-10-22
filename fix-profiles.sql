-- Fix per la tabella profiles mancante
-- Esegui questo script in Supabase SQL Editor

-- Crea la tabella profiles se non esiste
CREATE TABLE IF NOT EXISTS profiles (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    bar_number TEXT NOT NULL,
    specialization TEXT[] DEFAULT '{}',
    bio TEXT,
    phone TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Abilita RLS per profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy per profiles
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id);

-- Indici per profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_bar_number ON profiles(bar_number);

-- Trigger per updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
