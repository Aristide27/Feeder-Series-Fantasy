INSERT INTO feature_results
(driver_id, race_weekend_id, start_position, finish_position, status, fastest_lap)
VALUES
(24, 9, 3, 1, 'OK', 0),   -- Roman Staněk
(3, 9, 2, 2, 'OK', 0),   -- Ritomo Miyata
(28, 9, 12, 3, 'OK', 0),   -- Luke Browning
(25, 9, 6, 4, 'OK', 0),   -- Pepe Martí
(23, 9, 7, 5, 'OK', 0),   -- Leonardo Fornaroli
(9, 9, 8, 6, 'OK', 0),   -- Gabriele Minì
(7, 9, 13, 7, 'OK', 1),   -- Dino Beganovic (fastest lap)
(30, 9, 4, 8, 'OK', 0),   -- Victor Martins
(14, 9, 1, 9, 'OK', 0),   -- Alexander Dunne
(31, 9, 9, 10, 'OK', 0),   -- Amaury Cordeel
(2, 9, 21, 11, 'OK', 0),   -- Joshua Dürksen
(22, 9, 15, 12, 'OK', 0),   -- John Bennett
(10, 9, 10, 13, 'OK', 0),   -- Oliver Goethe
(20, 9, 18, 14, 'OK', 0),   -- Rafael Villagómez
(32, 9, 19, 15, 'OK', 0),   -- Sami Meguetounif
(33, 9, 17, 16, 'OK', 0),   -- Max Esterson
(29, 9, 14, 17, 'OK', 0),   -- Jak Crawford
(27, 9, 11, 18, 'OK', 0),   -- Richard Verschoor
(18, 9, 22, 19, 'OK', 0),   -- Cian Shields
(15, 9, 20, 20, 'OK', 0),   -- Kush Maini
(11, 9, 16, NULL, 'DNF', 0),   -- Sebastián Montoya
(26, 9, 5, NULL, 'DSQ', 0)
ON CONFLICT (driver_id, race_weekend_id) DO NOTHING;
