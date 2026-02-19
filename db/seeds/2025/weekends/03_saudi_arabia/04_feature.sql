INSERT INTO feature_results
(driver_id, race_weekend_id, start_position, finish_position, status, fastest_lap)
VALUES
(27, 3, 9, 1, 'OK', 1),   -- Richard Verschoor (fastest lap)
(29, 3, 1, 2, 'OK', 0),   -- Jak Crawford
(30, 3, 2, 3, 'OK', 0),   -- Victor Martins
(23, 3, 3, 4, 'OK', 0),   -- Leonardo Fornaroli
(25, 3, 7, 5, 'OK', 0),   -- Pepe Martí
(28, 3, 4, 6, 'OK', 0),   -- Luke Browning
(26, 3, 5, 7, 'OK', 0),   -- Arvid Lindblad
(14, 3, 6, 8, 'OK', 0),   -- Alexander Dunne
(9, 3, 8, 9, 'OK', 0),   -- Gabriele Minì
(15, 3, 12, 10, 'OK', 0),   -- Kush Maini
(2, 3, 18, 11, 'OK', 0),   -- Joshua Dürksen
(24, 3, 10, 12, 'OK', 0),   -- Roman Staněk
(7, 3, 13, 13, 'OK', 0),   -- Dino Beganovic
(10, 3, 11, 14, 'OK', 0),   -- Oliver Goethe
(31, 3, 14, 15, 'OK', 0),   -- Amaury Cordeel
(3, 3, 16, 16, 'OK', 0),   -- Ritomo Miyata
(20, 3, 20, 17, 'OK', 0),   -- Rafael Villagómez
(33, 3, 19, 18, 'OK', 0),   -- Max Esterson
(18, 3, 22, 19, 'OK', 0),   -- Cian Shields
(22, 3, 21, 20, 'OK', 0),   -- John Bennett
(11, 3, 17, NULL, 'DNF', 0),   -- Sebastián Montoya
(32, 3, 15, NULL, 'DNF', 0)
ON CONFLICT (driver_id, race_weekend_id) DO NOTHING;
