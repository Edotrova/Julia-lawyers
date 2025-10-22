const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Carica le variabili d'ambiente
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Credenziali Supabase non trovate nel file .env.local');
    process.exit(1);
}

// Crea il client Supabase con service role
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function executeSQLScript() {
    try {
        console.log('🚀 Avvio esecuzione script SQL...');
        
        // Leggi il file SQL
        const sqlScript = fs.readFileSync(path.join(__dirname, 'update-tribunali-penali.sql'), 'utf8');
        
        // Dividi lo script in comandi separati (semplificato)
        const commands = sqlScript
            .split(';')
            .map(cmd => cmd.trim())
            .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
        
        console.log(`📝 Trovati ${commands.length} comandi SQL da eseguire`);
        
        // Esegui ogni comando
        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];
            if (command.trim()) {
                console.log(`⚡ Esecuzione comando ${i + 1}/${commands.length}...`);
                
                try {
                    const { data, error } = await supabase.rpc('exec_sql', { sql: command });
                    
                    if (error) {
                        console.error(`❌ Errore nel comando ${i + 1}:`, error.message);
                        // Continua con il prossimo comando
                    } else {
                        console.log(`✅ Comando ${i + 1} eseguito con successo`);
                    }
                } catch (err) {
                    console.error(`❌ Errore nell'esecuzione del comando ${i + 1}:`, err.message);
                }
            }
        }
        
        console.log('🎉 Script completato!');
        
        // Verifica i risultati
        console.log('\n📊 Verifica risultati...');
        const { data: tribunali, error: tribunaliError } = await supabase
            .from('tribunali')
            .select('name, city, type')
            .order('city, name');
            
        if (tribunaliError) {
            console.error('❌ Errore nel recupero dei tribunali:', tribunaliError.message);
        } else {
            console.log(`✅ Trovati ${tribunali.length} tribunali:`);
            tribunali.forEach(t => {
                console.log(`  - ${t.name} (${t.city}) - ${t.type}`);
            });
        }
        
        const { data: aule, error: auleError } = await supabase
            .from('aule')
            .select('name, tribunale_id')
            .limit(10);
            
        if (auleError) {
            console.error('❌ Errore nel recupero delle aule:', auleError.message);
        } else {
            console.log(`✅ Trovate ${aule.length} aule (prime 10):`);
            aule.forEach(a => {
                console.log(`  - ${a.name}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Errore generale:', error.message);
        process.exit(1);
    }
}

// Esegui lo script
executeSQLScript();
