// Script per creare utenti di test con Supabase
// Esegui questo script nel browser console su localhost:3002

const { createClient } = window.supabase;

const supabase = createClient(
  'https://pbofoowsxessadmxztlz.supabase.co',
  'sb_publishable_Ll3qsdZN9FKJEx2YGoskrw_yv7ndI6g'
);

// Funzione per creare utenti di test
async function createTestUsers() {
  const testUsers = [
    {
      email: 'mario.rossi@test.com',
      password: 'password123',
      first_name: 'Mario',
      last_name: 'Rossi',
      bar_number: '12345',
      specialization: ['Diritto Penale'],
      phone: '3201234567'
    },
    {
      email: 'giulia.verdi@test.com', 
      password: 'password123',
      first_name: 'Giulia',
      last_name: 'Verdi',
      bar_number: '67890',
      specialization: ['Diritto Civile'],
      phone: '3207654321'
    }
  ];

  for (const user of testUsers) {
    try {
      // Crea utente con Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            first_name: user.first_name,
            last_name: user.last_name,
            bar_number: user.bar_number,
            specializations: user.specialization,
            phone_number: user.phone
          }
        }
      });

      if (error) {
        console.error('Errore creazione utente:', user.email, error);
      } else {
        console.log('Utente creato:', user.email, data);
      }
    } catch (err) {
      console.error('Errore generale:', err);
    }
  }
}

// Esegui la funzione
createTestUsers();
