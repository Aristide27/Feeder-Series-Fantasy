INSERT INTO race_entries (race_weekend_id, driver_season_id, constructor_id, car_number)
VALUES
/* ========= INVICTA RACING ========= */
(1, --- Rafael Câmara ---
  (SELECT id FROM driver_seasons WHERE driver_id = 1 AND season = 2026),
  (SELECT id FROM constructors WHERE name='Invicta Racing'),
  1),
(1, --- Joshua Dürksen ---
  (SELECT id FROM driver_seasons WHERE driver_id = 2 AND season = 2026),
  (SELECT id FROM constructors WHERE name='Invicta Racing'),
  2),

/* ========= HITECH TGR ========= */
(1, --- Ritomo Miyata ---
  (SELECT id FROM driver_seasons WHERE driver_id = 3 AND season = 2026),
  (SELECT id FROM constructors WHERE name='Hitech TGR'),
  3),
(1, --- Colton Herta ---
  (SELECT id FROM driver_seasons WHERE driver_id = 4 AND season = 2026),
  (SELECT id FROM constructors WHERE name='Hitech TGR'),
  4),

/* ========= CAMPOS RACING ========= */
(1, --- Noel León ---
  (SELECT id FROM driver_seasons WHERE driver_id = 5 AND season = 2026),
  (SELECT id FROM constructors WHERE name='Campos Racing'),
  5),
(1, --- Nikola Tsolov ---
  (SELECT id FROM driver_seasons WHERE driver_id = 6 AND season = 2026),
  (SELECT id FROM constructors WHERE name='Campos Racing'),
  6),

/* ========= DAMS LUCAS OIL ========= */
(1, --- Dino Beganovic ---
  (SELECT id FROM driver_seasons WHERE driver_id = 7 AND season = 2026),
  (SELECT id FROM constructors WHERE name='DAMS Lucas Oil'),
  7),
(1, --- Roman Bilinski ---
  (SELECT id FROM driver_seasons WHERE driver_id = 8 AND season = 2026),
  (SELECT id FROM constructors WHERE name='DAMS Lucas Oil'),
  8),

/* ========= MP MOTORSPORT ========= */
(1, --- Gabriele Minì ---
  (SELECT id FROM driver_seasons WHERE driver_id = 9 AND season = 2026),
  (SELECT id FROM constructors WHERE name='MP Motorsport'),
  9),
(1, --- Oliver Goethe ---
  (SELECT id FROM driver_seasons WHERE driver_id = 10 AND season = 2026),
  (SELECT id FROM constructors WHERE name='MP Motorsport'),
  10),

/* ========= PREMA RACING ========= */
(1, --- Sebastián Montoya ---
  (SELECT id FROM driver_seasons WHERE driver_id = 11 AND season = 2026),
  (SELECT id FROM constructors WHERE name='PREMA Racing'),
  11),
(1, --- Mari Boya ---
  (SELECT id FROM driver_seasons WHERE driver_id = 12 AND season = 2026),
  (SELECT id FROM constructors WHERE name='PREMA Racing'),
  12),

/* ========= RODIN MOTORSPORT ========= */
(1, --- Martinius Stenshorne ---
  (SELECT id FROM driver_seasons WHERE driver_id = 13 AND season = 2026),
  (SELECT id FROM constructors WHERE name='Rodin Motorsport'),
  14),
(1, --- Alexander Dunne ---
  (SELECT id FROM driver_seasons WHERE driver_id = 14 AND season = 2026),
  (SELECT id FROM constructors WHERE name='Rodin Motorsport'),
  15),

/* ========= ART GRAND PRIX ========= */
(1, --- Kush Maini ---
  (SELECT id FROM driver_seasons WHERE driver_id = 15 AND season = 2026),
  (SELECT id FROM constructors WHERE name='ART Grand Prix'),
  16),
(1, --- Tasanapol Inthraphuvasak ---
  (SELECT id FROM driver_seasons WHERE driver_id = 16 AND season = 2026),
  (SELECT id FROM constructors WHERE name='ART Grand Prix'),
  17),

/* ========= AIX RACING ========= */
(1, --- Emerson Fittipaldi Jr. ---
  (SELECT id FROM driver_seasons WHERE driver_id = 17 AND season = 2026),
  (SELECT id FROM constructors WHERE name='AIX Racing'),
  20),
(1, --- Cian Shields ---
  (SELECT id FROM driver_seasons WHERE driver_id = 18 AND season = 2026),
  (SELECT id FROM constructors WHERE name='AIX Racing'),
  21),

/* ========= VAN AMERSFOORT RACING ========= */
(1, --- Nicolás Varrone ---
  (SELECT id FROM driver_seasons WHERE driver_id = 19 AND season = 2026),
  (SELECT id FROM constructors WHERE name='Van Amersfoort Racing'),
  22),
(1, --- Driver 23 ---
  (SELECT id FROM driver_seasons WHERE driver_id = 20 AND season = 2026),
  (SELECT id FROM constructors WHERE name='Van Amersfoort Racing'),
  23);

/* ========= TRIDENT ========= */
(1, --- Laurens van Hoepen ---
  (SELECT id FROM driver_seasons WHERE driver_id = 21 AND season = 2026),
  (SELECT id FROM constructors WHERE name='Trident'),
  24),
(1, --- John Bennett ---
  (SELECT id FROM driver_seasons WHERE driver_id = 22 AND season = 2026),
  (SELECT id FROM constructors WHERE name='Trident'),
  25),
