-- Initial schema migration for Avvocati Network
-- This file contains the complete database schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tribunali table
CREATE TABLE IF NOT EXISTS tribunali (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create aule table
CREATE TABLE IF NOT EXISTS aule (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tribunale_id UUID NOT NULL REFERENCES tribunali(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    capacity INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    aula_id UUID NOT NULL REFERENCES aule(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create presenze table
CREATE TABLE IF NOT EXISTS presenze (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    aula_id UUID NOT NULL REFERENCES aule(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time_in TIME NOT NULL,
    time_out TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, aula_id, date)
);

-- Create udienze table
CREATE TABLE IF NOT EXISTS udienze (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    aula_id UUID NOT NULL REFERENCES aule(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    duration INTEGER DEFAULT 60,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chat_room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(10) NOT NULL CHECK (message_type IN ('room', 'private')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create substitution_requests table
CREATE TABLE IF NOT EXISTS substitution_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    substitute_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    udienza_id UUID NOT NULL REFERENCES udienze(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
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

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_udienze_updated_at BEFORE UPDATE ON udienze
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_substitution_requests_updated_at BEFORE UPDATE ON substitution_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE udienze ENABLE ROW LEVEL SECURITY;
ALTER TABLE presenze ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE substitution_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own udienze" ON udienze
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own udienze" ON udienze
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own udienze" ON udienze
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own udienze" ON udienze
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view all presenze" ON presenze
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own presenze" ON presenze
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own presenze" ON presenze
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view messages they sent or received" ON messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can view substitution requests they made or received" ON substitution_requests
    FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = substitute_id);

CREATE POLICY "Users can insert substitution requests" ON substitution_requests
    FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update substitution requests they received" ON substitution_requests
    FOR UPDATE USING (auth.uid() = substitute_id);
