# 🏛️ Avvocati Network

Una piattaforma web moderna per avvocati che semplifica la gestione delle udienze, la comunicazione tra colleghi e la richiesta di sostituzioni.

## 🚀 Funzionalità Principali

### 📅 Calendario Udienze
- **Gestione completa delle udienze** con date, orari e dettagli
- **Sincronizzazione** con le aule dei tribunali
- **Visualizzazione calendario** intuitiva e responsive
- **Stati delle udienze**: programmata, completata, annullata

### 👥 Presenze in Aula
- **Segnalazione presenza** in tempo reale nelle aule dei tribunali
- **Visualizzazione colleghi** presenti in ogni aula
- **Statistiche** delle presenze giornaliere
- **Integrazione** con il sistema di chat

### 💬 Sistema di Chat
- **Chatroom per aula** - conversazioni pubbliche per ogni aula
- **Messaggi privati** - comunicazione diretta tra avvocati
- **Notifiche real-time** - aggiornamenti istantanei
- **Storico messaggi** completo

### 🔄 Richieste di Sostituzione
- **Richiesta sostituzioni** per udienze programmate
- **Gestione richieste** ricevute e inviate
- **Stati delle richieste**: in attesa, accettata, rifiutata, annullata
- **Notifiche** per nuove richieste

### 👤 Profili Avvocati
- **Gestione profilo professionale** completo
- **Specializzazioni** e aree di competenza
- **Verifica identità** e iscrizione all'albo
- **Impostazioni privacy** granulari

## 🛠️ Stack Tecnologico

### Frontend
- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipizzazione statica
- **TailwindCSS** - Styling utility-first
- **shadcn/ui** - Componenti UI moderni
- **Lucide React** - Icone SVG

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Autenticazione integrata
  - Realtime subscriptions
  - Row Level Security (RLS)

### Infrastruttura
- **Vercel** - Hosting e deployment
- **Supabase Cloud** - Database e backend
- **TLS/SSL** - Connessioni sicure

## 📦 Installazione

### Prerequisiti
- Node.js 18+ 
- npm o yarn
- Account Supabase

### Setup Locale

1. **Clona il repository**
```bash
git clone <repository-url>
cd avvocati-network
```

2. **Installa le dipendenze**
```bash
npm install
```

3. **Configura le variabili d'ambiente**
```bash
cp .env.example .env.local
```

Modifica `.env.local` con le tue credenziali Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. **Configura il database**
- Crea un nuovo progetto su Supabase
- Esegui lo script SQL in `supabase-schema.sql`
- Configura le policy RLS

5. **Avvia il server di sviluppo**
```bash
npm run dev
```

L'applicazione sarà disponibile su `http://localhost:3000`

## 🗄️ Schema Database

### Tabelle Principali

- **`tribunali`** - Informazioni sui tribunali
- **`aule`** - Aule dei tribunali con capacità
- **`udienze`** - Udienze programmate dagli avvocati
- **`presenze`** - Presenze in aula in tempo reale
- **`chat_rooms`** - Chatroom per ogni aula
- **`messages`** - Messaggi pubblici e privati
- **`substitution_requests`** - Richieste di sostituzione
- **`profiles`** - Profili professionali degli avvocati

### Sicurezza
- **Row Level Security (RLS)** attivato su tutte le tabelle
- **Policy granulari** per controllo accessi
- **Autenticazione** tramite Supabase Auth
- **Conformità GDPR** per privacy e dati

## 🚀 Deployment

### Vercel (Raccomandato)

1. **Connetti il repository a Vercel**
2. **Configura le variabili d'ambiente** in Vercel
3. **Deploy automatico** ad ogni push

### Supabase

1. **Crea un progetto** su Supabase
2. **Esegui lo schema SQL** fornito
3. **Configura le policy RLS**
4. **Abilita Realtime** per le funzionalità chat

## 📱 Funzionalità Mobile

- **Design responsive** per tutti i dispositivi
- **PWA ready** per installazione su mobile
- **Touch-friendly** interface
- **Offline support** per funzionalità base

## 🔒 Sicurezza e Privacy

- **Connessioni cifrate** (TLS 1.3)
- **Password hashing** sicuro (bcrypt)
- **Accesso ai dati** tramite RLS
- **Impostazioni privacy** granulari
- **Conformità GDPR** completa

## 📊 KPI e Analytics

- **Utenti verificati** vs registrati
- **Udienze create** per settimana
- **Presenze segnate** nelle aule
- **Tempo medio risposta** richieste sostituzione
- **Attività chat** (messaggi/giorno)

## 🤝 Contributi

1. Fork del repository
2. Crea un branch per la feature (`git checkout -b feature/amazing-feature`)
3. Commit delle modifiche (`git commit -m 'Add amazing feature'`)
4. Push al branch (`git push origin feature/amazing-feature`)
5. Apri una Pull Request

## 📄 Licenza

Questo progetto è distribuito sotto licenza MIT. Vedi il file `LICENSE` per maggiori dettagli.

## 🆘 Supporto

Per supporto tecnico o domande:
- **Email**: support@avvocatinetwork.it
- **Documentazione**: [docs.avvocatinetwork.it](https://docs.avvocatinetwork.it)
- **Issues**: GitHub Issues

## 🗺️ Roadmap

### Versione 1.1
- [ ] Notifiche push
- [ ] Esportazione calendario
- [ ] Integrazione Google Calendar
- [ ] App mobile nativa

### Versione 1.2
- [ ] Videochiamate integrate
- [ ] Condivisione documenti
- [ ] Sistema di rating avvocati
- [ ] Analytics avanzate

### Versione 2.0
- [ ] AI per suggerimenti sostituzioni
- [ ] Integrazione sistemi giudiziari
- [ ] Blockchain per verifiche
- [ ] Marketplace servizi legali

---

**Sviluppato con ❤️ per la comunità forense italiana**