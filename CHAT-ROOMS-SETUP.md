# Setup Chat Rooms - Istruzioni per l'Amministratore

## Problema
Le chat rooms non possono essere create automaticamente a causa delle Row Level Security (RLS) policies di Supabase.

## Soluzione

### Opzione 1: Eseguire lo Script SQL (Raccomandato)

1. **Vai al Dashboard Supabase**
2. **SQL Editor**
3. **Esegui il file `create-chat-rooms.sql`**

Questo script:
- Crea chat rooms per tutte le aule esistenti
- Configura le RLS policies corrette
- Permette agli utenti autenticati di usare le chat

### Opzione 2: Configurazione Manuale RLS

Se preferisci configurare manualmente:

1. **Vai a Authentication → Policies**
2. **Tabella `chat_rooms`**
3. **Crea le seguenti policies:**

```sql
-- Policy per leggere chat rooms
CREATE POLICY "Allow authenticated users to read chat_rooms" ON chat_rooms
    FOR SELECT TO authenticated
    USING (true);

-- Policy per creare chat rooms (opzionale)
CREATE POLICY "Allow authenticated users to create chat_rooms" ON chat_rooms
    FOR INSERT TO authenticated
    WITH CHECK (true);
```

4. **Tabella `messages`**
5. **Crea le seguenti policies:**

```sql
-- Policy per leggere messaggi
CREATE POLICY "Allow authenticated users to read messages" ON messages
    FOR SELECT TO authenticated
    USING (
        sender_id = auth.uid() OR 
        receiver_id = auth.uid() OR 
        chat_room_id IN (SELECT id FROM chat_rooms)
    );

-- Policy per creare messaggi
CREATE POLICY "Allow authenticated users to insert messages" ON messages
    FOR INSERT TO authenticated
    WITH CHECK (true);
```

## Verifica

Dopo l'esecuzione, dovresti vedere:
- Chat rooms create per tutte le aule
- Utenti possono accedere alle chat
- Messaggi vengono salvati correttamente

## Note

- Le chat rooms vengono create automaticamente per tutte le aule esistenti
- Ogni aula avrà una chat room con nome "Chat [Nome Aula] - [Nome Tribunale]"
- Gli utenti possono partecipare alle chat delle aule a cui hanno accesso
