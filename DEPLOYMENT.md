# 🚀 Guida al Deployment - Avvocati Network

## 📋 Prerequisiti

1. **Account Supabase** - [supabase.com](https://supabase.com)
2. **Account Vercel** - [vercel.com](https://vercel.com)
3. **GitHub Repository** (opzionale ma raccomandato)

## 🗄️ Setup Database (Supabase)

### 1. Crea un nuovo progetto Supabase
1. Vai su [supabase.com](https://supabase.com)
2. Clicca "New Project"
3. Scegli un nome: `avvocati-network`
4. Scegli una password sicura per il database
5. Seleziona una regione (preferibilmente Europa)

### 2. Configura il database
1. Vai nella sezione **SQL Editor**
2. Copia e incolla il contenuto del file `supabase-schema.sql`
3. Esegui lo script per creare tutte le tabelle e policy

### 3. Configura l'autenticazione
1. Vai in **Authentication > Settings**
2. Abilita **Email confirmations**
3. Configura **Site URL**: `https://your-domain.vercel.app`
4. Aggiungi **Redirect URLs**: `https://your-domain.vercel.app/auth/callback`

### 4. Ottieni le credenziali
1. Vai in **Settings > API**
2. Copia:
   - **Project URL**
   - **anon public key**
   - **service_role key** (se necessario)

## 🌐 Setup Frontend (Vercel)

### 1. Connetti il repository
1. Vai su [vercel.com](https://vercel.com)
2. Clicca "New Project"
3. Connetti il tuo repository GitHub
4. Seleziona la cartella `avvocati-network`

### 2. Configura le variabili d'ambiente
In Vercel, vai in **Settings > Environment Variables** e aggiungi:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Configura il build
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 4. Deploy
1. Clicca "Deploy"
2. Aspetta che il build sia completato
3. Il tuo sito sarà disponibile su `https://your-project.vercel.app`

## 🔧 Configurazione Avanzata

### 1. Dominio personalizzato (opzionale)
1. In Vercel, vai in **Settings > Domains**
2. Aggiungi il tuo dominio
3. Configura i DNS records come indicato

### 2. Configurazione Supabase per produzione
1. In **Settings > API**, aggiorna le **Site URL**
2. Aggiungi il tuo dominio nelle **Redirect URLs**
3. Configura **CORS** se necessario

### 3. Monitoraggio e Analytics
1. **Vercel Analytics**: Abilita in **Settings > Analytics**
2. **Supabase Dashboard**: Monitora l'uso del database
3. **Error Tracking**: Considera Sentry per il monitoraggio errori

## 🧪 Test del Deployment

### 1. Test di registrazione
1. Vai sul tuo sito
2. Clicca "Registrati"
3. Inserisci i dati di un avvocato
4. Verifica che ricevi l'email di conferma

### 2. Test delle funzionalità
1. **Login/Logout**: Verifica l'autenticazione
2. **Calendario**: Crea una nuova udienza
3. **Presenze**: Segna la presenza in un'aula
4. **Chat**: Invia un messaggio
5. **Sostituzioni**: Crea una richiesta di sostituzione

### 3. Test di sicurezza
1. Verifica che le pagine protette richiedano login
2. Testa che i dati siano isolati per utente
3. Verifica che le policy RLS funzionino

## 🔒 Sicurezza e Privacy

### 1. Configurazione HTTPS
- Vercel fornisce HTTPS automaticamente
- Verifica che il certificato sia valido

### 2. Configurazione CORS
```sql
-- In Supabase SQL Editor
UPDATE auth.config 
SET site_url = 'https://your-domain.vercel.app',
    additional_redirect_urls = '["https://your-domain.vercel.app/auth/callback"]';
```

### 3. Backup del database
1. In Supabase, vai in **Settings > Database**
2. Configura backup automatici
3. Testa il restore in caso di necessità

## 📊 Monitoraggio e Manutenzione

### 1. Metriche da monitorare
- **Utenti attivi** giornalieri
- **Udienze create** per settimana
- **Messaggi inviati** per giorno
- **Richieste sostituzione** pendenti

### 2. Logs e debugging
- **Vercel Logs**: Per errori frontend
- **Supabase Logs**: Per errori database
- **Browser Console**: Per errori client-side

### 3. Aggiornamenti
- **Dependencies**: Aggiorna regolarmente
- **Security patches**: Applica immediatamente
- **Feature updates**: Testa in staging prima della produzione

## 🆘 Troubleshooting

### Problemi comuni

#### 1. Errori di autenticazione
```bash
# Verifica le variabili d'ambiente
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

#### 2. Errori di database
```sql
-- Verifica le policy RLS
SELECT * FROM pg_policies WHERE tablename = 'udienze';
```

#### 3. Errori di build
```bash
# Pulisci la cache
rm -rf .next
npm run build
```

### Supporto
- **Documentazione Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Documentazione Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **GitHub Issues**: Per bug e feature requests

## 🎉 Completamento

Una volta completato il deployment:

1. ✅ **Database configurato** con tutte le tabelle
2. ✅ **Autenticazione funzionante** con email verification
3. ✅ **Frontend deployato** su Vercel
4. ✅ **Variabili d'ambiente** configurate
5. ✅ **Test completati** su tutte le funzionalità

La tua piattaforma **Avvocati Network** è ora live e pronta per essere utilizzata! 🚀
