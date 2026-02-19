INSERT INTO qualifying_results (driver_id, race_weekend_id, position, status)
VALUES
(1, 15, 1, 'OK'),    -- Rafael Câmara
(14, 15, 2, 'OK'),   -- Alexander Dunne
(2, 15, 3, 'OK'),    -- Joshua Dürksen
(6, 15, 4, 'OK'),    -- Nikola Tsolov
(7, 15, 5, 'OK'),    -- Dino Beganovic
(13, 15, 6, 'OK'),   -- Martinius Stenshorne
(10, 15, 7, 'OK'),   -- Oliver Goethe
(12, 15, 8, 'OK'),   -- Mari Boya
(9, 15, 9, 'OK'),    -- Gabriele Minì
(5, 15, 10, 'OK'),   -- Noel León
(3, 15, 11, 'OK'),   -- Ritomo Miyata
(11, 15, 12, 'OK'),  -- Sebastián Montoya
(4, 15, 13, 'OK'),   -- Colton Herta
(8, 15, 14, 'OK'),   -- Roman Bilinski
(21, 15, 15, 'OK'),  -- Laurens van Hoepen
(16, 15, 16, 'OK'),  -- Tasanapol Inthraphuvasak
(15, 15, 17, 'OK'),  -- Kush Maini
(19, 15, 18, 'OK'),  -- Nicolás Varrone
(20, 15, 19, 'OK'),  -- Rafael Villagómez
(17, 15, 20, 'OK'),  -- Emerson Fittipaldi Jr.
(22, 15, 21, 'OK'),  -- John Bennett
(18, 15, 22, 'OK')
ON CONFLICT (driver_id, race_weekend_id) DO NOTHING;
