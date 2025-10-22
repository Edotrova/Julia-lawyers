-- Script per importare tutti i tribunali italiani
-- Questo script contiene i principali tribunali italiani con città, tipo e indirizzo

-- Prima pulisci i dati esistenti (opzionale)
-- DELETE FROM aule WHERE tribunale_id IN (SELECT id FROM tribunali WHERE name != 'Tribunale di Roma');
-- DELETE FROM tribunali WHERE name != 'Tribunale di Roma';

-- Inserimento tribunali principali italiani
INSERT INTO tribunali (name, city, address, type) VALUES 
-- ROMA
('Tribunale di Roma - Sezione Penale', 'Roma', 'Via Cavour, 1, 00184 Roma RM', 'penale'),
('Tribunale di Roma - Sezione Civile', 'Roma', 'Via Cavour, 1, 00184 Roma RM', 'civile'),
('Tribunale Amministrativo Regionale del Lazio', 'Roma', 'Piazza Cavour, 1, 00193 Roma RM', 'amministrativo'),

-- MILANO
('Tribunale di Milano - Sezione Penale', 'Milano', 'Corso di Porta Vittoria, 15, 20122 Milano MI', 'penale'),
('Tribunale di Milano - Sezione Civile', 'Milano', 'Corso di Porta Vittoria, 15, 20122 Milano MI', 'civile'),
('Tribunale Amministrativo Regionale della Lombardia', 'Milano', 'Via San Barnaba, 50, 20122 Milano MI', 'amministrativo'),

-- NAPOLI
('Tribunale di Napoli - Sezione Penale', 'Napoli', 'Via Tribunali, 1, 80138 Napoli NA', 'penale'),
('Tribunale di Napoli - Sezione Civile', 'Napoli', 'Via Tribunali, 1, 80138 Napoli NA', 'civile'),
('Tribunale Amministrativo Regionale della Campania', 'Napoli', 'Via San Carlo, 1, 80132 Napoli NA', 'amministrativo'),

-- TORINO
('Tribunale di Torino - Sezione Penale', 'Torino', 'Via Corte d''Appello, 1, 10122 Torino TO', 'penale'),
('Tribunale di Torino - Sezione Civile', 'Torino', 'Via Corte d''Appello, 1, 10122 Torino TO', 'civile'),
('Tribunale Amministrativo Regionale del Piemonte', 'Torino', 'Via Corte d''Appello, 1, 10122 Torino TO', 'amministrativo'),

-- FIRENZE
('Tribunale di Firenze - Sezione Penale', 'Firenze', 'Piazza San Firenze, 1, 50122 Firenze FI', 'penale'),
('Tribunale di Firenze - Sezione Civile', 'Firenze', 'Piazza San Firenze, 1, 50122 Firenze FI', 'civile'),
('Tribunale Amministrativo Regionale della Toscana', 'Firenze', 'Piazza San Firenze, 1, 50122 Firenze FI', 'amministrativo'),

-- BOLOGNA
('Tribunale di Bologna - Sezione Penale', 'Bologna', 'Via Farini, 1, 40124 Bologna BO', 'penale'),
('Tribunale di Bologna - Sezione Civile', 'Bologna', 'Via Farini, 1, 40124 Bologna BO', 'civile'),
('Tribunale Amministrativo Regionale dell''Emilia-Romagna', 'Bologna', 'Via Farini, 1, 40124 Bologna BO', 'amministrativo'),

-- GENOVA
('Tribunale di Genova - Sezione Penale', 'Genova', 'Via San Lorenzo, 1, 16123 Genova GE', 'penale'),
('Tribunale di Genova - Sezione Civile', 'Genova', 'Via San Lorenzo, 1, 16123 Genova GE', 'civile'),
('Tribunale Amministrativo Regionale della Liguria', 'Genova', 'Via San Lorenzo, 1, 16123 Genova GE', 'amministrativo'),

-- VENEZIA
('Tribunale di Venezia - Sezione Penale', 'Venezia', 'Calle del Magistrato, 1, 30124 Venezia VE', 'penale'),
('Tribunale di Venezia - Sezione Civile', 'Venezia', 'Calle del Magistrato, 1, 30124 Venezia VE', 'civile'),
('Tribunale Amministrativo Regionale del Veneto', 'Venezia', 'Calle del Magistrato, 1, 30124 Venezia VE', 'amministrativo'),

-- BARI
('Tribunale di Bari - Sezione Penale', 'Bari', 'Via Sparano, 1, 70121 Bari BA', 'penale'),
('Tribunale di Bari - Sezione Civile', 'Bari', 'Via Sparano, 1, 70121 Bari BA', 'civile'),
('Tribunale Amministrativo Regionale della Puglia', 'Bari', 'Via Sparano, 1, 70121 Bari BA', 'amministrativo'),

-- PALERMO
('Tribunale di Palermo - Sezione Penale', 'Palermo', 'Via Maqueda, 1, 90133 Palermo PA', 'penale'),
('Tribunale di Palermo - Sezione Civile', 'Palermo', 'Via Maqueda, 1, 90133 Palermo PA', 'civile'),
('Tribunale Amministrativo Regionale della Sicilia', 'Palermo', 'Via Maqueda, 1, 90133 Palermo PA', 'amministrativo'),

-- CATANIA
('Tribunale di Catania - Sezione Penale', 'Catania', 'Via Vittorio Emanuele, 1, 95124 Catania CT', 'penale'),
('Tribunale di Catania - Sezione Civile', 'Catania', 'Via Vittorio Emanuele, 1, 95124 Catania CT', 'civile'),

-- CAGLIARI
('Tribunale di Cagliari - Sezione Penale', 'Cagliari', 'Via Roma, 1, 09124 Cagliari CA', 'penale'),
('Tribunale di Cagliari - Sezione Civile', 'Cagliari', 'Via Roma, 1, 09124 Cagliari CA', 'civile'),
('Tribunale Amministrativo Regionale della Sardegna', 'Cagliari', 'Via Roma, 1, 09124 Cagliari CA', 'amministrativo'),

-- ANCONA
('Tribunale di Ancona - Sezione Penale', 'Ancona', 'Via XXIV Maggio, 1, 60121 Ancona AN', 'penale'),
('Tribunale di Ancona - Sezione Civile', 'Ancona', 'Via XXIV Maggio, 1, 60121 Ancona AN', 'civile'),
('Tribunale Amministrativo Regionale delle Marche', 'Ancona', 'Via XXIV Maggio, 1, 60121 Ancona AN', 'amministrativo'),

-- PERUGIA
('Tribunale di Perugia - Sezione Penale', 'Perugia', 'Piazza Italia, 1, 06121 Perugia PG', 'penale'),
('Tribunale di Perugia - Sezione Civile', 'Perugia', 'Piazza Italia, 1, 06121 Perugia PG', 'civile'),
('Tribunale Amministrativo Regionale dell''Umbria', 'Perugia', 'Piazza Italia, 1, 06121 Perugia PG', 'amministrativo'),

-- L'AQUILA
('Tribunale di L''Aquila - Sezione Penale', 'L''Aquila', 'Via XX Settembre, 1, 67100 L''Aquila AQ', 'penale'),
('Tribunale di L''Aquila - Sezione Civile', 'L''Aquila', 'Via XX Settembre, 1, 67100 L''Aquila AQ', 'civile'),
('Tribunale Amministrativo Regionale dell''Abruzzo', 'L''Aquila', 'Via XX Settembre, 1, 67100 L''Aquila AQ', 'amministrativo'),

-- CAMPOBASSO
('Tribunale di Campobasso - Sezione Penale', 'Campobasso', 'Via Roma, 1, 86100 Campobasso CB', 'penale'),
('Tribunale di Campobasso - Sezione Civile', 'Campobasso', 'Via Roma, 1, 86100 Campobasso CB', 'civile'),
('Tribunale Amministrativo Regionale del Molise', 'Campobasso', 'Via Roma, 1, 86100 Campobasso CB', 'amministrativo'),

-- POTENZA
('Tribunale di Potenza - Sezione Penale', 'Potenza', 'Via Pretoria, 1, 85100 Potenza PZ', 'penale'),
('Tribunale di Potenza - Sezione Civile', 'Potenza', 'Via Pretoria, 1, 85100 Potenza PZ', 'civile'),
('Tribunale Amministrativo Regionale della Basilicata', 'Potenza', 'Via Pretoria, 1, 85100 Potenza PZ', 'amministrativo'),

-- REGGIO CALABRIA
('Tribunale di Reggio Calabria - Sezione Penale', 'Reggio Calabria', 'Via Demetrio Tripepi, 1, 89125 Reggio Calabria RC', 'penale'),
('Tribunale di Reggio Calabria - Sezione Civile', 'Reggio Calabria', 'Via Demetrio Tripepi, 1, 89125 Reggio Calabria RC', 'civile'),
('Tribunale Amministrativo Regionale della Calabria', 'Reggio Calabria', 'Via Demetrio Tripepi, 1, 89125 Reggio Calabria RC', 'amministrativo'),

-- TRENTO
('Tribunale di Trento - Sezione Penale', 'Trento', 'Via Manci, 1, 38122 Trento TN', 'penale'),
('Tribunale di Trento - Sezione Civile', 'Trento', 'Via Manci, 1, 38122 Trento TN', 'civile'),
('Tribunale Amministrativo Regionale del Trentino-Alto Adige', 'Trento', 'Via Manci, 1, 38122 Trento TN', 'amministrativo'),

-- BOLZANO
('Tribunale di Bolzano - Sezione Penale', 'Bolzano', 'Via Portici, 1, 39100 Bolzano BZ', 'penale'),
('Tribunale di Bolzano - Sezione Civile', 'Bolzano', 'Via Portici, 1, 39100 Bolzano BZ', 'civile'),

-- TRIESTE
('Tribunale di Trieste - Sezione Penale', 'Trieste', 'Piazza Unità d''Italia, 1, 34121 Trieste TS', 'penale'),
('Tribunale di Trieste - Sezione Civile', 'Trieste', 'Piazza Unità d''Italia, 1, 34121 Trieste TS', 'civile'),
('Tribunale Amministrativo Regionale del Friuli-Venezia Giulia', 'Trieste', 'Piazza Unità d''Italia, 1, 34121 Trieste TS', 'amministrativo'),

-- AOSTA
('Tribunale di Aosta - Sezione Penale', 'Aosta', 'Via Xavier de Maistre, 1, 11100 Aosta AO', 'penale'),
('Tribunale di Aosta - Sezione Civile', 'Aosta', 'Via Xavier de Maistre, 1, 11100 Aosta AO', 'civile'),
('Tribunale Amministrativo Regionale della Valle d''Aosta', 'Aosta', 'Via Xavier de Maistre, 1, 11100 Aosta AO', 'amministrativo')

ON CONFLICT (name, city, type) DO NOTHING;
