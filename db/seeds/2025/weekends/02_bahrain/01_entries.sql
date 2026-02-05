INSERT INTO race_entries (race_weekend_id, driver_season_id, constructor_id, car_number)
VALUES
/* ========= INVICTA RACING ========= */
(2, --- Leonardo Fornaroli ---
  (SELECT id FROM driver_seasons WHERE driver_id = 23 AND season = 2025),
  (SELECT id FROM constructors WHERE name='Invicta Racing'),
  1),
(2, --- Roman Staněk ---
  (SELECT id FROM driver_seasons WHERE driver_id = 24 AND season = 2025),
  (SELECT id FROM constructors WHERE name='Invicta Racing'),
  2),

/* ========= CAMPOS RACING ========= */
(2, --- Pepe Martí ---
  (SELECT id FROM driver_seasons WHERE driver_id = 25 AND season = 2025),
  (SELECT id FROM constructors WHERE name='Campos Racing'),
  5),
(2, --- Arvid Lindblad ---
  (SELECT id FROM driver_seasons WHERE driver_id = 26 AND season = 2025),
  (SELECT id FROM constructors WHERE name='Campos Racing'),
  6),

/* ========= MP MOTORSPORT ========= */
(2, --- Oliver Goethe ---
  (SELECT id FROM driver_seasons WHERE driver_id = 10 AND season = 2025),
  (SELECT id FROM constructors WHERE name='MP Motorsport'),
  9),
(2, --- Richard Verschoor ---
  (SELECT id FROM driver_seasons WHERE driver_id = 27 AND season = 2025),
  (SELECT id FROM constructors WHERE name='MP Motorsport'),
  10),

/* ========= HITECH TGR ========= */
(2, --- Luke Browning ---
  (SELECT id FROM driver_seasons WHERE driver_id = 28 AND season = 2025),
  (SELECT id FROM constructors WHERE name='Hitech TGR'),
  3),
(2, --- Dino Beganovic ---
  (SELECT id FROM driver_seasons WHERE driver_id = 7 AND season = 2025),
  (SELECT id FROM constructors WHERE name='Hitech TGR'),
  4),

/* ========= PREMA RACING ========= */
(2, --- Sebastián Montoya ---
  (SELECT id FROM driver_seasons WHERE driver_id = 11 AND season = 2025),
  (SELECT id FROM constructors WHERE name='PREMA Racing'),
  11),
(2, --- Gabriele Minì ---
  (SELECT id FROM driver_seasons WHERE driver_id = 9 AND season = 2025),
  (SELECT id FROM constructors WHERE name='PREMA Racing'),
  12),

/* ========= DAMS LUCAS OIL ========= */
(2, --- Jak Crawford ---
  (SELECT id FROM driver_seasons WHERE driver_id = 29 AND season = 2025),
  (SELECT id FROM constructors WHERE name='DAMS Lucas Oil'),
  7),
(2, --- Kush Maini ---
  (SELECT id FROM driver_seasons WHERE driver_id = 15 AND season = 2025),
  (SELECT id FROM constructors WHERE name='DAMS Lucas Oil'),
  8),

/* ========= ART GRAND PRIX ========= */
(2, --- Victor Martins ---
  (SELECT id FROM driver_seasons WHERE driver_id = 30 AND season = 2025),
  (SELECT id FROM constructors WHERE name='ART Grand Prix'),
  16),
(2, --- Ritomo Miyata ---
  (SELECT id FROM driver_seasons WHERE driver_id = 3 AND season = 2025),
  (SELECT id FROM constructors WHERE name='ART Grand Prix'),
  17),

/* ========= RODIN MOTORSPORT ========= */
(2, --- Amaury Cordeel ---
  (SELECT id FROM driver_seasons WHERE driver_id = 31 AND season = 2025),
  (SELECT id FROM constructors WHERE name='Rodin Motorsport'),
  14),
(2, --- Alexander Dunne ---
  (SELECT id FROM driver_seasons WHERE driver_id = 14 AND season = 2025),
  (SELECT id FROM constructors WHERE name='Rodin Motorsport'),
  15),

/* ========= AIX RACING ========= */
(2, --- Joshua Dürksen ---
  (SELECT id FROM driver_seasons WHERE driver_id = 2 AND season = 2025),
  (SELECT id FROM constructors WHERE name='AIX Racing'),
  20),
(2, --- Cian Shields ---
  (SELECT id FROM driver_seasons WHERE driver_id = 18 AND season = 2025),
  (SELECT id FROM constructors WHERE name='AIX Racing'),
  21),

/* ========= TRIDENT ========= */
(2, --- Sami Meguetounif ---
  (SELECT id FROM driver_seasons WHERE driver_id = 32 AND season = 2025),
  (SELECT id FROM constructors WHERE name='Trident'),
  24),
(2, --- Max Esterson ---
  (SELECT id FROM driver_seasons WHERE driver_id = 33 AND season = 2025),
  (SELECT id FROM constructors WHERE name='Trident'),
  25),

/* ========= VAN AMERSFOORT RACING ========= */
(2, --- John Bennett ---
  (SELECT id FROM driver_seasons WHERE driver_id = 22 AND season = 2025),
  (SELECT id FROM constructors WHERE name='Van Amersfoort Racing'),
  22),
(2, --- Rafael Villagómez ---
  (SELECT id FROM driver_seasons WHERE driver_id = 35 AND season = 2025),
  (SELECT id FROM constructors WHERE name='Van Amersfoort Racing'),
  23);
