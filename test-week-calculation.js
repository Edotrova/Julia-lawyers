// Test script per verificare il calcolo della settimana
// Esegui questo script nella console del browser per testare

function testWeekCalculation() {
  const today = new Date();
  console.log('📅 Data odierna:', today.toISOString().split('T')[0]);
  
  // Calcolo attuale (Lunedì a Domenica)
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Lunedì
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6); // Domenica
  
  console.log('📊 Calcolo attuale:');
  console.log('  Inizio settimana (Lunedì):', startOfWeek.toISOString().split('T')[0]);
  console.log('  Fine settimana (Domenica):', endOfWeek.toISOString().split('T')[0]);
  
  // Calcolo alternativo (Domenica a Sabato)
  const startOfWeekAlt = new Date();
  startOfWeekAlt.setDate(startOfWeekAlt.getDate() - startOfWeekAlt.getDay()); // Domenica
  const endOfWeekAlt = new Date(startOfWeekAlt);
  endOfWeekAlt.setDate(endOfWeekAlt.getDate() + 6); // Sabato
  
  console.log('📊 Calcolo alternativo:');
  console.log('  Inizio settimana (Domenica):', startOfWeekAlt.toISOString().split('T')[0]);
  console.log('  Fine settimana (Sabato):', endOfWeekAlt.toISOString().split('T')[0]);
  
  // Calcolo con date-fns (se disponibile)
  if (typeof format !== 'undefined') {
    console.log('📊 Con date-fns:');
    console.log('  Inizio settimana:', format(startOfWeek, 'yyyy-MM-dd'));
    console.log('  Fine settimana:', format(endOfWeek, 'yyyy-MM-dd'));
  }
  
  return {
    current: {
      start: startOfWeek.toISOString().split('T')[0],
      end: endOfWeek.toISOString().split('T')[0]
    },
    alternative: {
      start: startOfWeekAlt.toISOString().split('T')[0],
      end: endOfWeekAlt.toISOString().split('T')[0]
    }
  };
}

// Esegui il test
testWeekCalculation();
