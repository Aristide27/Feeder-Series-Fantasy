INSERT INTO qualifying_results (driver_id, race_weekend_id, position, status)
VALUES
(7,  15,  1, 'OK'),  -- Dino Beganovic
(13, 15,  2, 'OK'),  -- Martinius Stenshorne
(14, 15,  3, 'OK'),  -- Alexander Dunne
(5,  15,  4, 'OK'),  -- Noel León
(6,  15,  5, 'OK'),  -- Nikola Tsolov
(1,  15,  6, 'OK'),  -- Rafael Câmara
(15, 15,  7, 'OK'),  -- Kush Maini
(10, 15,  8, 'OK'),  -- Oliver Goethe
(2,  15,  9, 'OK'),  -- Joshua Dürksen
(16, 15, 10, 'OK'),  -- Tasanapol Inthraphuvasak
(21, 15, 11, 'OK'),  -- Laurens Van Hoepen
(8,  15, 12, 'OK'),  -- Roman Bilinski
(3,  15, 13, 'OK'),  -- Ritomo Miyata
(4,  15, 14, 'OK'),  -- Colton Herta
(11, 15, 15, 'OK'),  -- Sebastián Montoya
(20, 15, 16, 'OK'),  -- Rafael Villagómez
(22, 15, 17, 'OK'),  -- John Bennett
(17, 15, 18, 'OK'),  -- Emerson Fittipaldi Jr.
(19, 15, 19, 'OK'),  -- Nicolás Varrone
(18, 15, 20, 'OK'),  -- Cian Shields
(9,  15, 21, 'OK'),  -- Gabriele Minì
(12, 15, 22, 'OK')   -- Mari Boya
ON CONFLICT (driver_id, race_weekend_id) DO NOTHING;