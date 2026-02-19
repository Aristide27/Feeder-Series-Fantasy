INSERT INTO qualifying_results (driver_id, race_weekend_id, position, status)
VALUES
(10, 13, 1, 'OK'),   -- Oliver Goethe
(23, 13, 2, 'OK'),   -- Leonardo Fornaroli
(30, 13, 3, 'OK'),   -- Victor Martins
(24, 13, 4, 'OK'),   -- Roman Staněk
(14, 13, 5, 'OK'),   -- Alexander Dunne
(11, 13, 6, 'OK'),   -- Sebastián Montoya
(6, 13, 7, 'OK'),   -- Nikola Tsolov
(20, 13, 8, 'OK'),   -- Rafael Villagómez
(2, 13, 9, 'OK'),   -- Joshua Dürksen
(27, 13, 10, 'OK'),   -- Richard Verschoor
(7, 13, 11, 'OK'),   -- Dino Beganovic
(13, 13, 12, 'OK'),   -- Martinius Stenshorne
(22, 13, 13, 'OK'),   -- John Bennett
(9, 13, 14, 'OK'),   -- Gabriele Minì
(29, 13, 15, 'OK'),   -- Jak Crawford
(3, 13, 16, 'OK'),   -- Ritomo Miyata
(26, 13, 17, 'OK'),   -- Arvid Lindblad
(28, 13, 18, 'OK'),   -- Luke Browning
(18, 13, 19, 'OK'),   -- Cian Shields
(15, 13, 20, 'OK'),   -- Kush Maini
(34, 13, 21, 'OK'),   -- James Wharton
(21, 13, 22, 'OK')
ON CONFLICT (driver_id, race_weekend_id) DO NOTHING;
