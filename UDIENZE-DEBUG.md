# Debug delle Udienze Settimanali - Istruzioni

## 🔍 Problema Attuale
Le udienze settimanali non vengono conteggiate dopo la creazione.

## 🛠️ Soluzioni Implementate

### **1. Debug Dettagliato**
- **Log del calcolo settimana**: Mostra inizio e fine settimana
- **Log delle udienze trovate**: Mostra quante udienze sono state trovate
- **Log di tutte le udienze**: Mostra tutte le udienze dell'utente

### **2. Subscription Real-time**
- **Aggiornamento automatico**: Quando viene creata una nuova udienza
- **Log degli aggiornamenti**: Mostra quando viene rilevato un cambiamento

## 📋 Passi per Verificare

### **Passo 1: Controlla Console**
Apri la **Console del Browser** (F12) e cerca:

1. **Utente corrente**:
   ```
   👤 Utente corrente: { id: "...", name: "...", email: "..." }
   ```

2. **Calcolo settimana**:
   ```
   📅 Calcolo settimana: { startOfWeek: "2025-10-13", endOfWeek: "2025-10-19", userId: "..." }
   ```

3. **Udienze trovate**:
   ```
   📊 Udienze settimana trovate: 0
   ```

4. **Tutte le udienze dell'utente**:
   ```
   📋 Tutte le udienze dell'utente: Array(0)
   ```

5. **Tutte le udienze (senza filtro)**:
   ```
   📋 Tutte le udienze (senza filtro): [{ id: "...", date: "...", status: "...", title: "...", user_id: "..." }]
   ```

6. **Test RLS policies**:
   ```
   ✅ RLS policies OK, query base funziona: [{ ... }]
   ```
   oppure
   ```
   ❌ Errore RLS policies: { ... }
   ```

### **Passo 2: Verifica Date**
Controlla se le date delle udienze sono:
- **Nella settimana corrente**: Tra `startOfWeek` e `endOfWeek`
- **Con status "scheduled"**: Non "completed" o "cancelled"
- **Dell'utente corretto**: `user_id` corrisponde

### **Passo 3: Test Calcolo Settimana**
Esegui nella console del browser:
```javascript
// Copia e incolla il contenuto di test-week-calculation.js
testWeekCalculation();
```

## 🚨 Possibili Problemi

### **Problema 1: Calcolo Settimana Sbagliato**
- **Sintomo**: `startOfWeek` e `endOfWeek` non includono le date delle udienze
- **Causa**: Il calcolo della settimana potrebbe essere sbagliato
- **Soluzione**: Verifica con `test-week-calculation.js`

### **Problema 2: Status delle Udienze**
- **Sintomo**: Udienze esistono ma non vengono conteggiate
- **Causa**: Status diverso da "scheduled"
- **Soluzione**: Verifica il campo `status` nelle udienze

### **Problema 3: Date Formato**
- **Sintomo**: Date in formato diverso da "YYYY-MM-DD"
- **Causa**: Formato date inconsistente
- **Soluzione**: Verifica il formato delle date nel database

### **Problema 4: User ID**
- **Sintomo**: Udienze di altri utenti vengono mostrate
- **Causa**: Filtro `user_id` non funziona
- **Soluzione**: Verifica che `user.id` sia corretto

## 🔧 Debug Avanzato

### **Verifica Database Diretto**
Esegui nel **SQL Editor** di Supabase:
```sql
-- Sostituisci 'USER_ID' con l'ID reale dell'utente
SELECT id, date, status, title, user_id
FROM udienze 
WHERE user_id = 'USER_ID'
ORDER BY date ASC;
```

### **Verifica Range Settimana**
```sql
-- Sostituisci le date con quelle della settimana corrente
SELECT COUNT(*) as udienze_settimana
FROM udienze 
WHERE user_id = 'USER_ID'
  AND date >= '2024-01-15'  -- startOfWeek
  AND date <= '2024-01-21'  -- endOfWeek
  AND status = 'scheduled';
```

### **Verifica Status**
```sql
-- Conta udienze per status
SELECT status, COUNT(*) as count
FROM udienze 
WHERE user_id = 'USER_ID'
GROUP BY status;
```

## ✅ Risultato Atteso

Dopo aver seguito questi passi:
- ✅ **Console**: Mostra il calcolo corretto della settimana
- ✅ **Udienze**: Vengono trovate e conteggiate correttamente
- ✅ **Real-time**: Il conteggio si aggiorna quando si crea una nuova udienza
- ✅ **Dashboard**: Mostra il numero corretto di udienze settimanali

## 🆘 Se il Problema Persiste

1. **Controlla la console** per errori specifici
2. **Verifica il database** con gli script SQL
3. **Testa con date diverse** per isolare il problema
4. **Controlla le RLS policies** per la tabella `udienze`
