const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variabili d\'ambiente mancanti');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addAutoreColumn() {
  console.log('🔧 Aggiunta colonna autore alla tabella udienze...');
  
  try {
    // Prima prova a verificare se la colonna autore esiste già
    const { data: testData, error: testError } = await supabase
      .from('udienze')
      .select('autore')
      .limit(1);
    
    if (testError && testError.code === 'PGRST204') {
      console.log('⚠️  Colonna autore non esiste, deve essere aggiunta manualmente nel database');
      console.log('📝 Esegui questo SQL nel Supabase SQL Editor:');
      console.log('ALTER TABLE udienze ADD COLUMN IF NOT EXISTS autore TEXT;');
      return;
    }
    
    console.log('✅ Colonna autore esiste già');
    
    // Ora aggiorna le udienze esistenti con il nome dell'autore
    console.log('🔄 Aggiornamento udienze esistenti...');
    
    // Carica tutte le udienze
    const { data: udienze, error: fetchError } = await supabase
      .from('udienze')
      .select('id, user_id');
    
    if (fetchError) {
      console.error('❌ Errore nel caricamento delle udienze:', fetchError);
      return;
    }
    
    console.log(`📋 Trovate ${udienze?.length || 0} udienze da aggiornare`);
    
    if (udienze && udienze.length > 0) {
      // Per ogni udienza, carica il profilo dell'autore
      for (const udienza of udienze) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', udienza.user_id)
          .single();
        
        if (profile) {
          const autore = `${profile.first_name} ${profile.last_name}`;
          
          // Aggiorna l'udienza con il nome dell'autore
          const { error: updateError } = await supabase
            .from('udienze')
            .update({ autore: autore })
            .eq('id', udienza.id);
          
          if (updateError) {
            console.error(`❌ Errore nell'aggiornamento udienza ${udienza.id}:`, updateError);
          } else {
            console.log(`✅ Aggiornata udienza ${udienza.id} con autore: ${autore}`);
          }
        } else {
          console.log(`⚠️  Profilo non trovato per user_id: ${udienza.user_id}`);
        }
      }
    }
    
    console.log('🎉 Aggiornamento completato!');
    
  } catch (error) {
    console.error('❌ Errore generale:', error);
  }
}

addAutoreColumn();
