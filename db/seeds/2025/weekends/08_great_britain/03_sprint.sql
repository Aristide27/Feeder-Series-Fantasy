INSERT INTO sprint_results
(driver_id, race_weekend_id, start_position, finish_position, status, fastest_lap)
VALUES
(23, 8, 10, 1, 'OK', 0),   -- Leonardo Fornaroli
(11, 8, 5, 2, 'OK', 1),   -- Sebastián Montoya (fastest lap)
(24, 8, 4, 3, 'OK', 0),   -- Roman Staněk
(15, 8, 9, 4, 'OK', 0),   -- Kush Maini
(2, 8, 6, 5, 'OK', 0),   -- Joshua Dürksen
(29, 8, 3, 6, 'OK', 0),   -- Jak Crawford
(27, 8, 7, 7, 'OK', 0),   -- Richard Verschoor
(30, 8, 1, 8, 'OK', 0),   -- Victor Martins
(26, 8, 11, 9, 'OK', 0),   -- Arvid Lindblad
(25, 8, 19, 10, 'OK', 0),   -- Pepe Martí
(10, 8, 18, 11, 'OK', 0),   -- Oliver Goethe
(28, 8, 12, 12, 'OK', 0),   -- Luke Browning
(32, 8, 13, 13, 'OK', 0),   -- Sami Meguetounif
(9, 8, 16, 14, 'OK', 0),   -- Gabriele Minì
(22, 8, 17, 15, 'OK', 0),   -- John Bennett
(20, 8, 15, 16, 'OK', 0),   -- Rafael Villagómez
(18, 8, 20, 17, 'OK', 0),   -- Cian Shields
(7, 8, 8, 18, 'OK', 0),   -- Dino Beganovic
(31, 8, 21, 19, 'OK', 0),   -- Amaury Cordeel
(3, 8, 13, 20, 'OK', 0),   -- Ritomo Miyata
(33, 8, 14, 21, 'OK', 0),   -- Max Esterson
(14, 8, 2, NULL, 'DNF', 0)
ON CONFLICT (driver_id, race_weekend_id) DO NOTHING;
