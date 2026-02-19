INSERT INTO qualifying_results (driver_id, race_weekend_id, position, status)
VALUES
(24, 14, 1, 'OK'),   -- Roman Staněk
(29, 14, 2, 'OK'),   -- Jak Crawford
(23, 14, 3, 'OK'),   -- Leonardo Fornaroli
(7, 14, 4, 'OK'),   -- Dino Beganovic
(11, 14, 5, 'OK'),   -- Sebastián Montoya
(10, 14, 6, 'OK'),   -- Oliver Goethe
(30, 14, 7, 'OK'),   -- Victor Martins
(2, 14, 8, 'OK'),   -- Joshua Dürksen
(6, 14, 9, 'OK'),   -- Nikola Tsolov
(26, 14, 10, 'OK'),   -- Arvid Lindblad
(14, 14, 11, 'OK'),   -- Alexander Dunne
(27, 14, 12, 'OK'),   -- Richard Verschoor
(9, 14, 13, 'OK'),   -- Gabriele Minì
(3, 14, 14, 'OK'),   -- Ritomo Miyata
(22, 14, 15, 'OK'),   -- John Bennett
(20, 14, 16, 'OK'),   -- Rafael Villagómez
(28, 14, 17, 'OK'),   -- Luke Browning
(13, 14, 18, 'OK'),   -- Martinius Stenshorne
(21, 14, 19, 'OK'),   -- Laurens van Hoepen
(15, 14, 20, 'OK'),   -- Kush Maini
(18, 14, 21, 'OK'),   -- Cian Shields
(16, 14, 22, 'OK')
ON CONFLICT (driver_id, race_weekend_id) DO NOTHING;
