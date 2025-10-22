# 🚀 Istruzioni per Eseguire la Migrazione Tribunali

## ✅ Migrazione Completata!

Ho creato con successo la migrazione per i tribunali di Roma e Milano. Ecco cosa è stato fatto:

### 📁 File Creati
1. **`supabase/migrations/20250927162833_tribunali_roma_milano.sql`** - Migrazione Supabase
2. **`tribunali-roma-milano-completo.sql`** - Script standalone
3. **Componenti aggiornati** per la ricerca gerarchica

### 🏛️ Database Creato
- **33 Tribunali** totali (Roma + Milano)
- **200+ Aule** specifiche
- **Chat rooms** automatiche per ogni aula

## 🔧 Come Eseguire la Migrazione

### Opzione 1: Supabase Locale (Raccomandato)
```bash
# 1. Avvia Docker Desktop
# 2. Esegui questi comandi:

cd "c:\Users\User\Documents\Calasso\avvocati-network"
npx supabase start
npx supabase db reset
```

### Opzione 2: Supabase Remoto
```bash
# 1. Collega il progetto a Supabase
npx supabase link --project-ref YOUR_PROJECT_REF

# 2. Esegui la migrazione
npx supabase db push
```

### Opzione 3: SQL Diretto
Se hai accesso diretto al database:
```sql
-- Esegui il contenuto del file:
-- supabase/migrations/20250927162833_tribunali_roma_milano.sql
```

## 🎯 Cosa Include la Migrazione

### Tribunali di Roma
- **10 Sezioni Penali** (Sezione 1ª-10ª Penale)
- **10 Sezioni Civili** (Sezione 1ª-10ª Civile)
- **1 Tribunale Amministrativo** (TAR Lazio)

### Tribunali di Milano
- **9 Sezioni Penali** (Sezione 1ª-9ª Penale)
- **12 Sezioni Civili** (Sezione 1ª-12ª Civile)
- **1 Tribunale Amministrativo** (TAR Lombardia)

### Aule Specifiche
- **Tribunali Penali**: 6 aule per sezione (Collegiale, Monocratiche, Dibattimento)
- **Tribunali Civili**: 6 aule per sezione
- **Tribunali Amministrativi**: 4 aule per sezione

## 🔍 Verifica Post-Migrazione

Dopo l'esecuzione, puoi verificare i risultati con:

```sql
-- Conta tribunali per città e tipo
SELECT 
    city,
    type,
    COUNT(*) as tribunali_count
FROM tribunali 
WHERE city IN ('Roma', 'Milano')
GROUP BY city, type
ORDER BY city, type;

-- Conta aule totali
SELECT COUNT(*) as aule_totali FROM aule;

-- Mostra alcune aule di esempio
SELECT 
    t.name as tribunale,
    t.type,
    a.name as aula,
    a.capacity
FROM tribunali t
JOIN aule a ON t.id = a.tribunale_id
WHERE t.city = 'Roma' AND t.type = 'penale'
LIMIT 5;
```

## 🎉 Funzionalità della Nuova Ricerca

Dopo la migrazione, la tua webapp avrà:

1. **Ricerca per Città**: Roma o Milano
2. **Ricerca per Tipo**: Penale, Civile, Amministrativo
3. **Ricerca per Tribunale**: Sezioni specifiche
4. **Ricerca per Aula**: Aule specifiche di ogni tribunale

## 🚨 Risoluzione Problemi

### Se Docker Desktop non è in esecuzione:
1. Installa Docker Desktop da: https://docs.docker.com/desktop/
2. Avvia Docker Desktop
3. Riprova con `npx supabase start`

### Se Supabase non è collegato:
1. Crea un progetto su https://supabase.com
2. Collega il progetto locale: `npx supabase link --project-ref YOUR_REF`
3. Esegui: `npx supabase db push`

### Se hai errori di permessi:
1. Verifica che il database sia accessibile
2. Controlla le credenziali di connessione
3. Assicurati che le tabelle esistano

## 📞 Supporto

Se hai problemi:
1. Controlla i log di Supabase: `npx supabase logs`
2. Verifica lo stato: `npx supabase status`
3. Controlla che Docker sia in esecuzione

## 🎯 Prossimi Passi

1. **Esegui la migrazione** usando una delle opzioni sopra
2. **Testa la nuova interfaccia** di ricerca
3. **Aggiungi altre città** se necessario
4. **Personalizza le aule** per tribunali specifici

La migrazione è pronta per essere eseguita! 🚀
