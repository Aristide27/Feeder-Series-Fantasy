INSERT INTO race_entries (race_weekend_id, driver_season_id, constructor_id, car_number)
VALUES
/* ========= INVICTA RACING ========= */
(1, --- Leonardo Fornaroli ---
  (SELECT id FROM driver_seasons WHERE driver_id = 23 AND season = 2025),
  (SELECT id FROM constructors WHERE name='Invicta Racing'),
  1),
(1, --- Roman Staněk ---
  (SELECT id FROM driver_seasons WHERE driver_id = 24 AND season = 2025),
  (SELECT id FROM constructors WHERE name='Invicta Racing'),
  2),

/* ========= CAMPOS RACING ========= */
(1, --- Pepe Martí ---
  (SELECT id FROM driver_seasons WHERE driver_id = 25 AND season = 2025),
  (SELECT id FROM constructors WHERE name='Campos Racing'),
  5),
(1, --- Arvid Lindblad ---
  (SELECT id FROM driver_seasons WHERE driver_id = 26 AND season = 2025),
  (SELECT id FROM constructors WHERE name='Campos Racing'),
  6),

/* ========= MP MOTORSPORT ========= */
(1, --- Oliver Goethe ---
  (SELECT id FROM driver_seasons WHERE driver_id = 10 AND season = 2025),
  (SELECT id FROM constructors WHERE name='MP Motorsport'),
  9),
(1, --- Richard Verschoor ---
  (SELECT id FROM driver_seasons WHERE driver_id = 27 AND season = 2025),
  (SELECT id FROM constructors WHERE name='MP Motorsport'),
  10),

/* ========= HITECH TGR ========= */
(1, --- Luke Browning ---
  (SELECT id FROM driver_seasons WHERE driver_id = 28 AND season = 2025),
  (SELECT id FROM constructors WHERE name='Hitech TGR'),
  3),
(1, --- Dino Beganovic ---
  (SELECT id FROM driver_seasons WHERE driver_id = 7 AND season = 2025),
  (SELECT id FROM constructors WHERE name='Hitech TGR'),
  4),

/* ========= PREMA RACING ========= */
(1, --- Sebastián Montoya ---
  (SELECT id FROM driver_seasons WHERE driver_id = 11 AND season = 2025),
  (SELECT id FROM constructors WHERE name='PREMA Racing'),
  11),
(1, --- Gabriele Minì ---
  (SELECT id FROM driver_seasons WHERE driver_id = 9 AND season = 2025),
  (SELECT id FROM constructors WHERE name='PREMA Racing'),
  12),

/* ========= DAMS LUCAS OIL ========= */
(1, --- Jak Crawford ---
  (SELECT id FROM driver_seasons WHERE driver_id = 29 AND season = 2025),
  (SELECT id FROM constructors WHERE name='DAMS Lucas Oil'),
  7),
(1, --- Kush Maini ---
  (SELECT id FROM driver_seasons WHERE driver_id = 15 AND season = 2025),
  (SELECT id FROM constructors WHERE name='DAMS Lucas Oil'),
  8),

/* ========= ART GRAND PRIX ========= */
(1, --- Victor Martins ---
  (SELECT id FROM driver_seasons WHERE driver_id = 30 AND season = 2025),
  (SELECT id FROM constructors WHERE name='ART Grand Prix'),
  16),
(1, --- Ritomo Miyata ---
  (SELECT id FROM driver_seasons WHERE driver_id = 3 AND season = 2025),
  (SELECT id FROM constructors WHERE name='ART Grand Prix'),
  17),

/* ========= RODIN MOTORSPORT ========= */
(1, --- Amaury Cordeel ---
  (SELECT id FROM driver_seasons WHERE driver_id = 31 AND season = 2025),
  (SELECT id FROM constructors WHERE name='Rodin Motorsport'),
  14),
(1, --- Alexander Dunne ---
  (SELECT id FROM driver_seasons WHERE driver_id = 14 AND season = 2025),
  (SELECT id FROM constructors WHERE name='Rodin Motorsport'),
  15),

/* ========= AIX RACING ========= */
(1, --- Joshua Dürksen ---
  (SELECT id FROM driver_seasons WHERE driver_id = 2 AND season = 2025),
  (SELECT id FROM constructors WHERE name='AIX Racing'),
  20),
(1, --- Cian Shields ---
  (SELECT id FROM driver_seasons WHERE driver_id = 18 AND season = 2025),
  (SELECT id FROM constructors WHERE name='AIX Racing'),
  21),

/* ========= TRIDENT ========= */
(1, --- Sami Meguetounif ---
  (SELECT id FROM driver_seasons WHERE driver_id = 32 AND season = 2025),
  (SELECT id FROM constructors WHERE name='Trident'),
  24),
(1, --- Max Esterson ---
  (SELECT id FROM driver_seasons WHERE driver_id = 33 AND season = 2025),
  (SELECT id FROM constructors WHERE name='Trident'),
  25),

/* ========= VAN AMERSFOORT RACING ========= */
(1, --- John Bennett ---
  (SELECT id FROM driver_seasons WHERE driver_id = 22 AND season = 2025),
  (SELECT id FROM constructors WHERE name='Van Amersfoort Racing'),
  22),
(1, --- Rafael Villagómez ---
  (SELECT id FROM driver_seasons WHERE driver_id = 35 AND season = 2025),
  (SELECT id FROM constructors WHERE name='Van Amersfoort Racing'),
  23);
