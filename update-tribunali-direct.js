const { createClient } = require('@supabase/supabase-js');

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

async function updateTribunali() {
    try {
        console.log('🚀 Avvio aggiornamento tribunali...');
        
        // STEP 1: Elimina tutte le aule associate ai tribunali
        console.log('🗑️ Eliminazione aule esistenti...');
        const { error: deleteAuleError } = await supabase
            .from('aule')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
        
        if (deleteAuleError) {
            console.error('❌ Errore nell\'eliminazione delle aule:', deleteAuleError.message);
        } else {
            console.log('✅ Aule eliminate con successo');
        }
        
        // STEP 2: Elimina tutti i tribunali esistenti
        console.log('🗑️ Eliminazione tribunali esistenti...');
        const { error: deleteTribunaliError } = await supabase
            .from('tribunali')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
        
        if (deleteTribunaliError) {
            console.error('❌ Errore nell\'eliminazione dei tribunali:', deleteTribunaliError.message);
        } else {
            console.log('✅ Tribunali eliminati con successo');
        }
        
        // STEP 3: Inserisci i nuovi tribunali
        console.log('📝 Inserimento nuovi tribunali...');
        const tribunali = [
            { name: 'TRIBUNALE DI ROMA SEZIONE PENALE', city: 'Roma', address: 'Via Cavour, 1, 00184 Roma RM', type: 'penale' },
            { name: 'CORTE D\'APPELLO DI ROMA SEZIONE PENALE', city: 'Roma', address: 'Via Cavour, 1, 00184 Roma RM', type: 'penale' },
            { name: 'GIUDICE DI PACE PENALE', city: 'Roma', address: 'Via Cavour, 1, 00184 Roma RM', type: 'penale' },
            { name: 'SUPREMA CORTE DI CASSAZIONE', city: 'Roma', address: 'Piazza Cavour, 00193 Roma RM', type: 'penale' },
            { name: 'TRIBUNALE DI CIVITAVECCHIA', city: 'Civitavecchia', address: 'Via Roma, 00053 Civitavecchia RM', type: 'penale' },
            { name: 'TRIBUNALE DI RIETI', city: 'Rieti', address: 'Via Salaria, 02100 Rieti RI', type: 'penale' },
            { name: 'TRIBUNALE DI TIVOLI', city: 'Tivoli', address: 'Via Roma, 00019 Tivoli RM', type: 'penale' },
            { name: 'TRIBUNALE DI VELLETRI', city: 'Velletri', address: 'Via Roma, 00049 Velletri RM', type: 'penale' },
            { name: 'TRIBUNALE DI FROSINONE', city: 'Frosinone', address: 'Via Roma, 03100 Frosinone FR', type: 'penale' },
            { name: 'TRIBUNALE DI LATINA', city: 'Latina', address: 'Via Roma, 04100 Latina LT', type: 'penale' },
            { name: 'TRIBUNALE DI CASSINO', city: 'Cassino', address: 'Via Roma, 03043 Cassino FR', type: 'penale' },
            { name: 'GIUDICE DI PACE DI CIVITAVECCHIA', city: 'Civitavecchia', address: 'Via Roma, 00053 Civitavecchia RM', type: 'penale' },
            { name: 'GIUDICE DI PACE DI RIETI', city: 'Rieti', address: 'Via Salaria, 02100 Rieti RI', type: 'penale' }
        ];
        
        const { data: tribunaliData, error: tribunaliError } = await supabase
            .from('tribunali')
            .insert(tribunali)
            .select();
        
        if (tribunaliError) {
            console.error('❌ Errore nell\'inserimento dei tribunali:', tribunaliError.message);
            return;
        }
        
        console.log(`✅ Inseriti ${tribunaliData.length} tribunali`);
        
        // STEP 4: Inserisci le aule per ogni tribunale
        console.log('🏛️ Inserimento aule...');
        
        // Trova i tribunali inseriti
        const { data: tribunaliInseriti, error: tribunaliInseritiError } = await supabase
            .from('tribunali')
            .select('id, name');
        
        if (tribunaliInseritiError) {
            console.error('❌ Errore nel recupero dei tribunali inseriti:', tribunaliInseritiError.message);
            return;
        }
        
        const aule = [];
        
        // Aule per TRIBUNALE DI ROMA SEZIONE PENALE
        const romaTribunale = tribunaliInseriti.find(t => t.name === 'TRIBUNALE DI ROMA SEZIONE PENALE');
        if (romaTribunale) {
            const romaAule = [
                // Tribunale Monocratico Aule 1-27
                ...Array.from({length: 27}, (_, i) => ({ tribunale_id: romaTribunale.id, name: `TRIBUNALE MONOCRATICO AULA N. ${i + 1}`, capacity: 50 })),
                // Tribunale Collegiale Aule 1-10 (senza la 3)
                ...Array.from({length: 9}, (_, i) => ({ tribunale_id: romaTribunale.id, name: `TRIBUNALE COLLEGIALE AULA N. ${i < 2 ? i + 1 : i + 2}`, capacity: 50 })),
                // Altre aule speciali
                { tribunale_id: romaTribunale.id, name: 'TRIBUNALE PER IL RIESAME AULA 3 COLLEGIALE', capacity: 50 },
                { tribunale_id: romaTribunale.id, name: 'AULA OCCORSIO', capacity: 50 },
                // Aule GIP/GUP 1-11
                ...Array.from({length: 11}, (_, i) => ({ tribunale_id: romaTribunale.id, name: `AULA GIP/GUP N. ${i + 1}`, capacity: 50 })),
                { tribunale_id: romaTribunale.id, name: 'TRIBUNALE PER LE MISURE DI PREVENZIONE AULA 11 GIP/GUP', capacity: 50 },
                { tribunale_id: romaTribunale.id, name: 'AULA CORTE D\'ASSISE', capacity: 100 }
            ];
            aule.push(...romaAule);
        }
        
        // Aule per CORTE D'APPELLO DI ROMA SEZIONE PENALE
        const corteAppello = tribunaliInseriti.find(t => t.name === 'CORTE D\'APPELLO DI ROMA SEZIONE PENALE');
        if (corteAppello) {
            const corteAule = [
                { tribunale_id: corteAppello.id, name: 'AULA N. 1', capacity: 50 },
                { tribunale_id: corteAppello.id, name: 'AULA N. 2', capacity: 50 },
                { tribunale_id: corteAppello.id, name: 'AULA N. 3', capacity: 50 },
                { tribunale_id: corteAppello.id, name: 'AULA N. 4', capacity: 50 },
                { tribunale_id: corteAppello.id, name: 'AULA CORTE D\'ASSISE D\'APPELLO', capacity: 100 },
                { tribunale_id: corteAppello.id, name: 'AULA EUROPA', capacity: 50 }
            ];
            aule.push(...corteAule);
        }
        
        // Aule per GIUDICE DI PACE PENALE
        const gdp = tribunaliInseriti.find(t => t.name === 'GIUDICE DI PACE PENALE');
        if (gdp) {
            const gdpAule = [
                { tribunale_id: gdp.id, name: 'AULA A', capacity: 30 },
                { tribunale_id: gdp.id, name: 'AULA B', capacity: 30 },
                { tribunale_id: gdp.id, name: 'AULA C', capacity: 30 },
                { tribunale_id: gdp.id, name: 'AULA D', capacity: 30 },
                { tribunale_id: gdp.id, name: 'AULA E', capacity: 30 },
                { tribunale_id: gdp.id, name: 'AULA F', capacity: 30 }
            ];
            aule.push(...gdpAule);
        }
        
        // Aule per SUPREMA CORTE DI CASSAZIONE
        const cassazione = tribunaliInseriti.find(t => t.name === 'SUPREMA CORTE DI CASSAZIONE');
        if (cassazione) {
            const cassazioneAule = [
                { tribunale_id: cassazione.id, name: 'SEZIONE PRIMA', capacity: 100 },
                { tribunale_id: cassazione.id, name: 'SEZIONE SECONDA', capacity: 100 },
                { tribunale_id: cassazione.id, name: 'SEZIONE TERZA', capacity: 100 },
                { tribunale_id: cassazione.id, name: 'SEZIONE QUARTA', capacity: 100 },
                { tribunale_id: cassazione.id, name: 'SEZIONE QUINTA', capacity: 100 },
                { tribunale_id: cassazione.id, name: 'SEZIONE SESTA', capacity: 100 },
                { tribunale_id: cassazione.id, name: 'SEZIONI UNITE', capacity: 150 }
            ];
            aule.push(...cassazioneAule);
        }
        
        // Aule per CIVITAVECCHIA
        const civitavecchia = tribunaliInseriti.find(t => t.name === 'TRIBUNALE DI CIVITAVECCHIA');
        if (civitavecchia) {
            const civitavecchiaAule = [
                { tribunale_id: civitavecchia.id, name: 'AULA A', capacity: 30 },
                { tribunale_id: civitavecchia.id, name: 'AULA B', capacity: 30 },
                { tribunale_id: civitavecchia.id, name: 'AULA C', capacity: 30 },
                { tribunale_id: civitavecchia.id, name: 'AULA D', capacity: 30 }
            ];
            aule.push(...civitavecchiaAule);
        }
        
        // Aule per RIETI
        const rieti = tribunaliInseriti.find(t => t.name === 'TRIBUNALE DI RIETI');
        if (rieti) {
            const rietiAule = [
                { tribunale_id: rieti.id, name: 'AULA CAPERNA', capacity: 30 },
                { tribunale_id: rieti.id, name: 'AULA RECCHIA', capacity: 30 },
                { tribunale_id: rieti.id, name: 'AULA N. 2', capacity: 30 }
            ];
            aule.push(...rietiAule);
        }
        
        // Aule per TIVOLI
        const tivoli = tribunaliInseriti.find(t => t.name === 'TRIBUNALE DI TIVOLI');
        if (tivoli) {
            const tivoliAule = [
                { tribunale_id: tivoli.id, name: 'AULA 1', capacity: 30 },
                { tribunale_id: tivoli.id, name: 'AULA 2', capacity: 30 },
                { tribunale_id: tivoli.id, name: 'AULA 3', capacity: 30 },
                { tribunale_id: tivoli.id, name: 'AULA 4', capacity: 30 },
                { tribunale_id: tivoli.id, name: 'AULA GIP/GUP', capacity: 30 }
            ];
            aule.push(...tivoliAule);
        }
        
        // Aule per VELLETRI
        const velletri = tribunaliInseriti.find(t => t.name === 'TRIBUNALE DI VELLETRI');
        if (velletri) {
            const velletriAule = [
                { tribunale_id: velletri.id, name: 'AULA PIANO TERRA MONOCRATICA', capacity: 30 },
                { tribunale_id: velletri.id, name: 'AULA COLLEGIALE PRIMO PIANO', capacity: 30 },
                { tribunale_id: velletri.id, name: 'AULA 1 GIP TERZO PIANO', capacity: 30 },
                { tribunale_id: velletri.id, name: 'AULA 2 GIP TERZO PIANO', capacity: 30 },
                { tribunale_id: velletri.id, name: 'AULA 1 MONOCRATICO QUARTO PIANO', capacity: 30 },
                { tribunale_id: velletri.id, name: 'AULA 2 MONOCRATICO QUARTO PIANO', capacity: 30 }
            ];
            aule.push(...velletriAule);
        }
        
        // Aule per FROSINONE
        const frosinone = tribunaliInseriti.find(t => t.name === 'TRIBUNALE DI FROSINONE');
        if (frosinone) {
            const frosinoneAule = [
                { tribunale_id: frosinone.id, name: 'AULA A', capacity: 30 },
                { tribunale_id: frosinone.id, name: 'AULA B', capacity: 30 },
                { tribunale_id: frosinone.id, name: 'AULA C', capacity: 30 },
                { tribunale_id: frosinone.id, name: 'AULA D', capacity: 30 },
                { tribunale_id: frosinone.id, name: 'AULA GIP/GUP', capacity: 30 }
            ];
            aule.push(...frosinoneAule);
        }
        
        // Aule per LATINA
        const latina = tribunaliInseriti.find(t => t.name === 'TRIBUNALE DI LATINA');
        if (latina) {
            const latinaAule = [
                { tribunale_id: latina.id, name: 'AULA 1', capacity: 30 },
                { tribunale_id: latina.id, name: 'AULA 2', capacity: 30 },
                { tribunale_id: latina.id, name: 'AULA 3', capacity: 30 },
                { tribunale_id: latina.id, name: 'AULA C', capacity: 30 },
                { tribunale_id: latina.id, name: 'AULA CORTE D\'ASSISE', capacity: 100 },
                { tribunale_id: latina.id, name: 'AULA D', capacity: 30 }
            ];
            aule.push(...latinaAule);
        }
        
        // Aule per CASSINO
        const cassino = tribunaliInseriti.find(t => t.name === 'TRIBUNALE DI CASSINO');
        if (cassino) {
            aule.push({ tribunale_id: cassino.id, name: 'AULA ATTENDERE', capacity: 30 });
        }
        
        // Aule per GIUDICE DI PACE DI CIVITAVECCHIA
        const gdpCivitavecchia = tribunaliInseriti.find(t => t.name === 'GIUDICE DI PACE DI CIVITAVECCHIA');
        if (gdpCivitavecchia) {
            aule.push({ tribunale_id: gdpCivitavecchia.id, name: 'AULA UNICA', capacity: 20 });
        }
        
        // Aule per GIUDICE DI PACE DI RIETI
        const gdpRieti = tribunaliInseriti.find(t => t.name === 'GIUDICE DI PACE DI RIETI');
        if (gdpRieti) {
            aule.push({ tribunale_id: gdpRieti.id, name: 'AULA UNICA', capacity: 20 });
        }
        
        // Inserisci tutte le aule
        if (aule.length > 0) {
            const { data: auleData, error: auleError } = await supabase
                .from('aule')
                .insert(aule)
                .select();
            
            if (auleError) {
                console.error('❌ Errore nell\'inserimento delle aule:', auleError.message);
            } else {
                console.log(`✅ Inserite ${auleData.length} aule`);
            }
        }
        
        console.log('🎉 Aggiornamento completato con successo!');
        
        // Mostra un riepilogo
        console.log('\n📊 Riepilogo:');
        console.log(`- Tribunali inseriti: ${tribunaliData.length}`);
        console.log(`- Aule inserite: ${aule.length}`);
        
        // Mostra alcuni esempi
        console.log('\n🏛️ Esempi di tribunali inseriti:');
        tribunaliData.slice(0, 5).forEach(t => {
            console.log(`  - ${t.name} (${t.city})`);
        });
        
    } catch (error) {
        console.error('❌ Errore generale:', error.message);
        process.exit(1);
    }
}

// Esegui l'aggiornamento
updateTribunali();
