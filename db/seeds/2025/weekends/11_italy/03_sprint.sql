INSERT INTO sprint_results
(driver_id, race_weekend_id, start_position, finish_position, status, fastest_lap)
VALUES
(23, 11, 8, 1, 'OK', 0),   -- Leonardo Fornaroli
(26, 11, 6, 2, 'OK', 0),   -- Arvid Lindblad
(2, 11, 7, 3, 'OK', 0),   -- Joshua Dürksen
(27, 11, 14, 4, 'OK', 0),   -- Richard Verschoor
(24, 11, 3, 5, 'OK', 0),   -- Roman Staněk
(7, 11, 10, 6, 'OK', 0),   -- Dino Beganovic
(9, 11, 15, 7, 'OK', 0),   -- Gabriele Minì
(28, 11, 1, 8, 'OK', 0),   -- Luke Browning
(25, 11, 13, 9, 'OK', 0),   -- Pepe Martí
(11, 11, 21, 10, 'OK', 0),   -- Sebastián Montoya
(3, 11, 18, 11, 'OK', 0),   -- Ritomo Miyata
(20, 11, 16, 12, 'OK', 0),   -- Rafael Villagómez
(14, 11, 5, 13, 'OK', 0),   -- Alexander Dunne
(22, 11, 17, 14, 'OK', 0),   -- John Bennett
(18, 11, 19, 15, 'OK', 0),   -- Cian Shields
(29, 11, 11, 16, 'OK', 0),   -- Jak Crawford
(31, 11, 20, 17, 'OK', 0),   -- Amaury Cordeel
(10, 11, 4, 18, 'OK', 1),   -- Oliver Goethe (fastest lap)
(30, 11, 12, 19, 'OK', 0),   -- Victor Martins
(33, 11, 22, NULL, 'DNF', 0),   -- Max Esterson
(32, 11, 9, NULL, 'DNF', 0),   -- Sami Meguetounif
(15, 11, 2, NULL, 'DNF', 0)
ON CONFLICT (driver_id, race_weekend_id) DO NOTHING;
