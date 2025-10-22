-- Abilita RLS sulla tabella profiles se non è già abilitato
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Crea policy per permettere agli utenti di inserire il proprio profilo
CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Crea policy per permettere agli utenti di leggere il proprio profilo
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Crea policy per permettere agli utenti di aggiornare il proprio profilo
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Crea policy per permettere agli utenti di eliminare il proprio profilo
CREATE POLICY "Users can delete their own profile" ON profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Opzionale: Crea policy per permettere a tutti di leggere i profili (per la visualizzazione pubblica)
CREATE POLICY "Anyone can view profiles" ON profiles
    FOR SELECT USING (true);
