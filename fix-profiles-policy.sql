-- Fix per le policy RLS della tabella profiles
-- Esegui questo script in Supabase SQL Editor

-- Rimuovi le policy esistenti se esistono
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Crea policy più permissive per la registrazione
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id);

-- Policy aggiuntiva per permettere la creazione del profilo durante la registrazione
CREATE POLICY "Allow profile creation during registration" ON profiles
    FOR INSERT TO authenticated WITH CHECK (true);
