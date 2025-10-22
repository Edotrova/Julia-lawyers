# Aggiornamento Tribunali Italiani - Avvocati Network

## Panoramica
Questo aggiornamento espande la webapp per includere tutti i principali tribunali italiani con ricerca gerarchica per città, tipo e aula.

## Modifiche Implementate

### 1. Schema Database Aggiornato
- **Nuovo campo `type`** nella tabella `tribunali` con valori: `penale`, `civile`, `amministrativo`
- **Indici ottimizzati** per performance di ricerca per città e tipo
- **Compatibilità** con dati esistenti mantenuta

### 2. Componente di Ricerca Migliorato
- **Ricerca gerarchica**: Città → Tipo → Tribunale → Aula
- **Filtri dinamici** che si aggiornano in base alle selezioni precedenti
- **Interfaccia intuitiva** con dropdown collegati

### 3. Dati Importati
- **50+ tribunali** delle principali città italiane
- **3 tipi** per ogni città: penale, civile, amministrativo
- **Aule standard** per ogni tribunale (4-6 aule per tipo)
- **Indirizzi completi** per ogni tribunale

## File Creati

### Script di Migrazione
1. **`update-tribunali-schema.sql`** - Aggiorna lo schema del database
2. **`migrazione-completa.sql`** - Script completo per l'aggiornamento
3. **`import-tribunali-italiani.sql`** - Dati dei tribunali italiani
4. **`add-aule-tribunali.sql`** - Aule per ogni tribunale

### Componenti Aggiornati
- **`aula-calendar-search.tsx`** - Nuova interfaccia di ricerca gerarchica

## Come Utilizzare

### Opzione 1: Migrazione Completa (Raccomandato)
```sql
-- Esegui questo script nel tuo database Supabase
\i migrazione-completa.sql
```

### Opzione 2: Migrazione Step-by-Step
```sql
-- 1. Aggiorna lo schema
\i update-tribunali-schema.sql

-- 2. Importa i tribunali
\i import-tribunali-italiani.sql

-- 3. Aggiungi le aule
\i add-aule-tribunali.sql
```

## Funzionalità della Nuova Ricerca

### 1. Selezione Città
- Dropdown con tutte le città italiane disponibili
- Ordinamento alfabetico per facilità di ricerca

### 2. Selezione Tipo Tribunale
- **Penale**: Per processi penali
- **Civile**: Per controversie civili
- **Amministrativo**: Per ricorsi amministrativi

### 3. Selezione Tribunale
- Lista filtrata per città e tipo selezionati
- Nome completo del tribunale con indirizzo

### 4. Selezione Aula
- Aule specifiche del tribunale selezionato
- Capacità e nome dell'aula

## Città Incluse

### Città Principali
- **Roma** (3 tribunali)
- **Milano** (3 tribunali)
- **Napoli** (3 tribunali)
- **Torino** (3 tribunali)
- **Firenze** (3 tribunali)
- **Bologna** (3 tribunali)

### Città Regionali
- **Genova, Venezia, Bari, Palermo, Catania**
- **Cagliari, Ancona, Perugia, L'Aquila**
- **Campobasso, Potenza, Reggio Calabria**
- **Trento, Bolzano, Trieste, Aosta**

## Struttura Aule per Tipo

### Tribunali Penali
- 5 aule standard (capacità 20-40 persone)
- Nome: "Aula X - Penale"

### Tribunali Civili
- 6 aule standard (capacità 20-45 persone)
- Nome: "Aula X - Civile"

### Tribunali Amministrativi
- 4 aule standard (capacità 20-35 persone)
- Nome: "Aula X - Amministrativo"

## Verifica Post-Migrazione

Dopo l'esecuzione della migrazione, puoi verificare i dati con:

```sql
-- Conta tribunali per tipo
SELECT type, COUNT(*) as count 
FROM tribunali 
GROUP BY type;

-- Conta aule per tribunale
SELECT t.name, t.type, COUNT(a.id) as aule_count
FROM tribunali t
LEFT JOIN aule a ON t.id = a.tribunale_id
GROUP BY t.id, t.name, t.type
ORDER BY t.city, t.type;

-- Verifica città disponibili
SELECT DISTINCT city 
FROM tribunali 
ORDER BY city;
```

## Note Tecniche

### Performance
- Indici ottimizzati per query per città e tipo
- Query gerarchiche efficienti
- Caching delle selezioni per migliorare UX

### Compatibilità
- Mantiene tutti i dati esistenti
- Non rompe funzionalità attuali
- Aggiornamento graduale possibile

### Sicurezza
- RLS (Row Level Security) mantenuto
- Policy esistenti preservate
- Nuovi dati seguono le stesse regole di accesso

## Prossimi Passi

1. **Esegui la migrazione** usando `migrazione-completa.sql`
2. **Testa la nuova interfaccia** di ricerca
3. **Aggiungi tribunali specifici** se necessario
4. **Personalizza le aule** per tribunali particolari

## Supporto

Per problemi o domande:
- Controlla i log di migrazione
- Verifica la connessione al database
- Testa le query di esempio fornite
