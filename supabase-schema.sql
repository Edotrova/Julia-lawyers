-- Avvocati Network Database Schema
-- Questo file contiene lo schema completo del database per la piattaforma Avvocati Network

-- Abilita le estensioni necessarie nel schema extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- Tabella tribunali
CREATE TABLE IF NOT EXISTS tribunali (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella aule
CREATE TABLE IF NOT EXISTS aule (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    tribunale_id UUID NOT NULL REFERENCES tribunali(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    capacity INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella chat_rooms (una per ogni aula)
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    aula_id UUID NOT NULL REFERENCES aule(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella presenze
CREATE TABLE IF NOT EXISTS presenze (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    aula_id UUID NOT NULL REFERENCES aule(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time_in TIME NOT NULL,
    time_out TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, aula_id, date)
);

-- Tabella udienze
CREATE TABLE IF NOT EXISTS udienze (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    aula_id UUID NOT NULL REFERENCES aule(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    duration INTEGER DEFAULT 60, -- in minuti
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    chat_room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT NOT NULL CHECK (message_type IN ('room', 'private')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella substitution_requests
CREATE TABLE IF NOT EXISTS substitution_requests (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    substitute_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    udienza_id UUID NOT NULL REFERENCES udienze(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici per migliorare le performance
CREATE INDEX IF NOT EXISTS idx_udienze_user_id ON udienze(user_id);
CREATE INDEX IF NOT EXISTS idx_udienze_date ON udienze(date);
CREATE INDEX IF NOT EXISTS idx_udienze_aula_id ON udienze(aula_id);
CREATE INDEX IF NOT EXISTS idx_presenze_user_id ON presenze(user_id);
CREATE INDEX IF NOT EXISTS idx_presenze_aula_id ON presenze(aula_id);
CREATE INDEX IF NOT EXISTS idx_presenze_date ON presenze(date);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_room_id ON messages(chat_room_id);
CREATE INDEX IF NOT EXISTS idx_substitution_requests_requester_id ON substitution_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_substitution_requests_substitute_id ON substitution_requests(substitute_id);

-- Indici per Foreign Keys (best practice)
CREATE INDEX IF NOT EXISTS idx_aule_tribunale_id ON aule(tribunale_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_aula_id ON chat_rooms(aula_id);

-- Funzione per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    SET search_path = '';
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger per aggiornare updated_at
CREATE TRIGGER update_udienze_updated_at BEFORE UPDATE ON udienze
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_substitution_requests_updated_at BEFORE UPDATE ON substitution_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE tribunali ENABLE ROW LEVEL SECURITY;
ALTER TABLE aule ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE udienze ENABLE ROW LEVEL SECURITY;
ALTER TABLE presenze ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE substitution_requests ENABLE ROW LEVEL SECURITY;

-- Policy per tribunali (pubblici, tutti possono leggere)
CREATE POLICY "Anyone can view tribunali" ON tribunali
    FOR SELECT TO authenticated USING (true);

-- Policy per aule (pubbliche, tutti possono leggere)
CREATE POLICY "Anyone can view aule" ON aule
    FOR SELECT TO authenticated USING (true);

-- Policy per chat_rooms (pubbliche, tutti possono leggere)
CREATE POLICY "Anyone can view chat_rooms" ON chat_rooms
    FOR SELECT TO authenticated USING (true);

-- Policy per udienze
CREATE POLICY "Users can view their own udienze" ON udienze
    FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own udienze" ON udienze
    FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own udienze" ON udienze
    FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own udienze" ON udienze
    FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

-- Policy per presenze
CREATE POLICY "Users can view all presenze" ON presenze
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own presenze" ON presenze
    FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own presenze" ON presenze
    FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id);

-- Policy per messages
CREATE POLICY "Users can view messages they sent or received" ON messages
    FOR SELECT TO authenticated USING ((SELECT auth.uid()) = sender_id OR (SELECT auth.uid()) = receiver_id);

CREATE POLICY "Users can insert messages" ON messages
    FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = sender_id);

-- Policy per substitution_requests
CREATE POLICY "Users can view substitution requests they made or received" ON substitution_requests
    FOR SELECT TO authenticated USING ((SELECT auth.uid()) = requester_id OR (SELECT auth.uid()) = substitute_id);

CREATE POLICY "Users can insert substitution requests" ON substitution_requests
    FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = requester_id);

CREATE POLICY "Users can update substitution requests they received" ON substitution_requests
    FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = substitute_id);

-- Inserimento dati di esempio per Roma
INSERT INTO tribunali (id, name, city, address) VALUES 
    (extensions.uuid_generate_v4(), 'Tribunale di Roma', 'Roma', 'Via Cavour, 1, 00184 Roma RM')
ON CONFLICT DO NOTHING;

-- Inserimento aule di esempio
INSERT INTO aule (tribunale_id, name, capacity) 
SELECT t.id, 'Aula 1 - Penale', 30 FROM tribunali t WHERE t.name = 'Tribunale di Roma'
UNION ALL
SELECT t.id, 'Aula 2 - Penale', 25 FROM tribunali t WHERE t.name = 'Tribunale di Roma'
UNION ALL
SELECT t.id, 'Aula 3 - Civile', 40 FROM tribunali t WHERE t.name = 'Tribunale di Roma'
UNION ALL
SELECT t.id, 'Aula 4 - Civile', 35 FROM tribunali t WHERE t.name = 'Tribunale di Roma'
UNION ALL
SELECT t.id, 'Aula 5 - Commerciale', 20 FROM tribunali t WHERE t.name = 'Tribunale di Roma'
ON CONFLICT DO NOTHING;

-- Creazione chat rooms per ogni aula
INSERT INTO chat_rooms (aula_id, name)
SELECT a.id, 'Chat ' || a.name FROM aule a
ON CONFLICT DO NOTHING;
