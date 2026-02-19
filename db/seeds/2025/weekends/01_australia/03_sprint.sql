INSERT INTO sprint_results
(driver_id, race_weekend_id, start_position, finish_position, status, fastest_lap)
VALUES
(2, 1, 9, 1, 'OK', 0),   -- Joshua Dürksen
(23, 1, 10, 2, 'OK', 0),   -- Leonardo Fornaroli
(28, 1, 8, 3, 'OK', 0),   -- Luke Browning
(27, 1, 4, 4, 'OK', 0),   -- Richard Verschoor
(24, 1, 6, 5, 'OK', 0),   -- Roman Staněk
(11, 1, 11, 6, 'OK', 0),   -- Sebastián Montoya
(9, 1, 1, 7, 'OK', 1),   -- Gabriele Minì (fastest lap)
(25, 1, 16, 8, 'OK', 0),   -- Pepe Martí
(14, 1, 5, 9, 'OK', 0),   -- Alexander Dunne
(26, 1, 14, 10, 'OK', 0),   -- Arvid Lindblad
(10, 1, 19, 11, 'OK', 0),   -- Oliver Goethe
(3, 1, 12, 12, 'OK', 0),   -- Ritomo Miyata
(20, 1, 18, 13, 'OK', 0),   -- Rafael Villagómez
(7, 1, 7, 14, 'OK', 0),   -- Dino Beganovic
(31, 1, 17, 15, 'OK', 0),   -- Amaury Cordeel
(15, 1, 13, 16, 'OK', 0),   -- Kush Maini
(18, 1, 21, 17, 'OK', 0),   -- Cian Shields
(22, 1, 20, 18, 'OK', 0),   -- John Bennett
(32, 1, 15, NULL, 'OK', 0),   -- Sami Meguetounif (DNF)
(33, 1, 22, NULL, 'OK', 0),   -- Max Esterson (DNF)
(29, 1, 3, NULL, 'OK', 0),   -- Jak Crawford (DNF)
(30, 1, 2, NULL, 'OK', 0)
ON CONFLICT (driver_id, race_weekend_id) DO NOTHING;
