INSERT INTO driver_seasons (driver_id, season, constructor_id, rookie, price)
VALUES
--------------------------------------
/* ========= 2026 drivers ========= */
--------------------------------------

/* ========= INVICTA RACING ========= */
((SELECT id FROM drivers WHERE name = 'Rafael Câmara'),
  2026,
  (SELECT id FROM constructors WHERE name = 'Invicta Racing'),
  1,
  24.0),
((SELECT id FROM drivers WHERE name = 'Joshua Dürksen'),
  2026,
  (SELECT id FROM constructors WHERE name = 'Invicta Racing'),
  0,
  21.0),

/* ========= HITECH TGR ========= */
((SELECT id FROM drivers WHERE name = 'Ritomo Miyata'),
  2026,
  (SELECT id FROM constructors WHERE name = 'Hitech TGR'),
  0,
  14),
((SELECT id FROM drivers WHERE name = 'Colton Herta'),
  2026,
  (SELECT id FROM constructors WHERE name = 'Hitech TGR'),
  1,
  13.0),

/* ========= CAMPOS RACING ========= */
((SELECT id FROM drivers WHERE name = 'Noel León'),
  2026,
  (SELECT id FROM constructors WHERE name = 'Campos Racing'),
  1,
  16.0),
((SELECT id FROM drivers WHERE name = 'Nikola Tsolov'),
  2026,
  (SELECT id FROM constructors WHERE name = 'Campos Racing'),
  1,
  20.0),

/* ========= DAMS LUCAS OIL ========= */
((SELECT id FROM drivers WHERE name = 'Dino Beganovic'),
  2026,
  (SELECT id FROM constructors WHERE name = 'DAMS Lucas Oil'),
  0,
  21.0),
((SELECT id FROM drivers WHERE name = 'Roman Bilinski'),
  2026,
  (SELECT id FROM constructors WHERE name = 'DAMS Lucas Oil'),
  1,
  14.0),

/* ========= MP MOTORSPORT ========= */
((SELECT id FROM drivers WHERE name = 'Gabriele Minì'),
  2026,
  (SELECT id FROM constructors WHERE name = 'MP Motorsport'),
  0,
  17.0),
((SELECT id FROM drivers WHERE name = 'Oliver Goethe'),
  2026,
  (SELECT id FROM constructors WHERE name = 'MP Motorsport'),
  0,
  19.0),

/* ========= PREMA RACING ========= */
((SELECT id FROM drivers WHERE name = 'Sebastián Montoya'),
  2026,
  (SELECT id FROM constructors WHERE name = 'PREMA Racing'),
  0,
  14.0),
((SELECT id FROM drivers WHERE name = 'Mari Boya'),
  2026,
  (SELECT id FROM constructors WHERE name = 'PREMA Racing'),
  1,
  18.0),

/* ========= RODIN MOTORSPORT ========= */
((SELECT id FROM drivers WHERE name = 'Martinius Stenshorne'),
  2026,
  (SELECT id FROM constructors WHERE name = 'Rodin Motorsport'),
  1,
  20.0),
((SELECT id FROM drivers WHERE name = 'Alexander Dunne'),
  2026,
  (SELECT id FROM constructors WHERE name = 'Rodin Motorsport'),
  0,
  22.0),

/* ========= ART GRAND PRIX ========= */
((SELECT id FROM drivers WHERE name = 'Kush Maini'),
  2026,
  (SELECT id FROM constructors WHERE name = 'ART Grand Prix'),
  0,
  8.0),
((SELECT id FROM drivers WHERE name = 'Tasanapol Inthraphuvasak'),
  2026,
  (SELECT id FROM constructors WHERE name = 'ART Grand Prix'),
  1,
  10.0),

/* ========= AIX RACING ========= */
((SELECT id FROM drivers WHERE name = 'Emerson Fittipaldi Jr.'),
  2026,
  (SELECT id FROM constructors WHERE name = 'AIX Racing'),
  1,
  7.0),
((SELECT id FROM drivers WHERE name = 'Cian Shields'),
  2026,
  (SELECT id FROM constructors WHERE name = 'AIX Racing'),
  0,
  5.0),

/* ========= VAN AMERSFOORT RACING ========= */
((SELECT id FROM drivers WHERE name = 'Nicolás Varrone'),
  2026,
  (SELECT id FROM constructors WHERE name = 'Van Amersfoort Racing'),
  1,
  7.0),
((SELECT id FROM drivers WHERE name = 'Driver 23'),
  2026,
  (SELECT id FROM constructors WHERE name = 'Van Amersfoort Racing'),
  1,
  5.0),
  
/* ========= TRIDENT ========= */
((SELECT id FROM drivers WHERE name = 'Laurens van Hoepen'),
  2026,
  (SELECT id FROM constructors WHERE name = 'Trident'),
  1,
  10.0),
((SELECT id FROM drivers WHERE name = 'John Bennett'),
  2026,
  (SELECT id FROM constructors WHERE name = 'Trident'),
  0,
  7.0);
