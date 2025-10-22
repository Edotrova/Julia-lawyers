const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variabili d\'ambiente mancanti');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createProfilesTable() {
  console.log('🔧 Creazione tabella profiles...');
  
  try {
    // Crea la tabella profiles
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS profiles (
          id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          first_name TEXT NOT NULL DEFAULT 'Utente',
          last_name TEXT NOT NULL DEFAULT '',
          bar_number TEXT NOT NULL DEFAULT '',
          specialization TEXT[] DEFAULT '{}',
          bio TEXT,
          phone TEXT,
          avatar_url TEXT,
          is_verified BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (createError) {
      console.error('❌ Errore nella creazione della tabella:', createError);
      return;
    }
    
    console.log('✅ Tabella profiles creata con successo');
    
    // Abilita RLS
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;`
    });
    
    if (rlsError) {
      console.error('❌ Errore nell\'abilitazione RLS:', rlsError);
    } else {
      console.log('✅ RLS abilitato');
    }
    
    // Crea le policy
    const policies = [
      `DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;`,
      `CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);`,
      `DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;`,
      `CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);`,
      `DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;`,
      `CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id);`
    ];
    
    for (const policy of policies) {
      const { error: policyError } = await supabase.rpc('exec_sql', { sql: policy });
      if (policyError) {
        console.error('❌ Errore nella creazione della policy:', policyError);
      }
    }
    
    console.log('✅ Policy create con successo');
    
    // Crea gli indici
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);`
    });
    
    if (indexError) {
      console.error('❌ Errore nella creazione dell\'indice:', indexError);
    } else {
      console.log('✅ Indici creati con successo');
    }
    
    // Inserisci alcuni dati di test
    const { error: insertError } = await supabase
      .from('profiles')
      .insert([
        {
          user_id: '00000000-0000-0000-0000-000000000001',
          first_name: 'Mario',
          last_name: 'Rossi',
          bar_number: '12345',
          specialization: ['Penale', 'Civile']
        },
        {
          user_id: '00000000-0000-0000-0000-000000000002',
          first_name: 'Giulia',
          last_name: 'Bianchi',
          bar_number: '67890',
          specialization: ['Amministrativo']
        }
      ]);
    
    if (insertError) {
      console.log('⚠️  Errore nell\'inserimento dati di test (normale se gli user_id non esistono):', insertError.message);
    } else {
      console.log('✅ Dati di test inseriti con successo');
    }
    
    console.log('🎉 Setup completato!');
    
  } catch (error) {
    console.error('❌ Errore generale:', error);
  }
}

createProfilesTable();
