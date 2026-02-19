INSERT INTO sprint_results
(driver_id, race_weekend_id, start_position, finish_position, status, fastest_lap)
VALUES
(26, 3, 5, 1, 'OK', 0),   -- Arvid Lindblad
(25, 3, 7, 2, 'OK', 0),   -- Pepe Martí
(14, 3, 6, 3, 'OK', 0),   -- Alexander Dunne
(27, 3, 9, 4, 'OK', 1),   -- Richard Verschoor (fastest lap)
(24, 3, 10, 5, 'OK', 0),   -- Roman Staněk
(9, 3, 8, 6, 'OK', 0),   -- Gabriele Minì
(23, 3, 3, 7, 'OK', 0),   -- Leonardo Fornaroli
(30, 3, 2, 8, 'OK', 0),   -- Victor Martins
(28, 3, 4, 9, 'OK', 0),   -- Luke Browning
(15, 3, 12, 10, 'OK', 0),   -- Kush Maini
(10, 3, 11, 11, 'OK', 0),   -- Oliver Goethe
(2, 3, 18, 12, 'OK', 0),   -- Joshua Dürksen
(11, 3, 17, 13, 'OK', 0),   -- Sebastián Montoya
(31, 3, 14, 14, 'OK', 0),   -- Amaury Cordeel
(7, 3, 13, 15, 'OK', 0),   -- Dino Beganovic
(32, 3, 15, 16, 'OK', 0),   -- Sami Meguetounif
(20, 3, 20, 17, 'OK', 0),   -- Rafael Villagómez
(33, 3, 19, 18, 'OK', 0),   -- Max Esterson
(3, 3, 16, 19, 'OK', 0),   -- Ritomo Miyata
(22, 3, 21, 20, 'OK', 0),   -- John Bennett
(29, 3, 1, NULL, 'DNF', 0),   -- Jak Crawford
(18, 3, 22, NULL, 'DNF', 0)
ON CONFLICT (driver_id, race_weekend_id) DO NOTHING;
