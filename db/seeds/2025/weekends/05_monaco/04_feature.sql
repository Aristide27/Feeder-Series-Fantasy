INSERT INTO feature_results
(driver_id, race_weekend_id, start_position, finish_position, status, fastest_lap)
VALUES
(29, 5, 14, 1, 'OK', 0),   -- Jak Crawford
(23, 5, 7, 2, 'OK', 0),   -- Leonardo Fornaroli
(11, 5, 16, 3, 'OK', 0),   -- Sebastián Montoya
(28, 5, 12, 4, 'OK', 0),   -- Luke Browning
(26, 5, 5, 5, 'OK', 0),   -- Arvid Lindblad
(15, 5, 20, 6, 'OK', 0),   -- Kush Maini
(24, 5, 3, 7, 'OK', 0),   -- Roman Staněk
(31, 5, 9, 8, 'OK', 0),   -- Amaury Cordeel
(20, 5, 18, 9, 'OK', 0),   -- Rafael Villagómez
(10, 5, 10, 10, 'OK', 0),   -- Oliver Goethe
(22, 5, 15, 11, 'OK', 0),   -- John Bennett
(32, 5, 19, 12, 'OK', 0),   -- Sami Meguetounif
(18, 5, 22, 13, 'OK', 0),   -- Cian Shields
(7, 5, 13, NULL, 'DNF', 1),   -- Dino Beganovic (fastest lap)
(2, 5, 21, NULL, 'DNF', 0),   -- Joshua Dürksen
(30, 5, 4, NULL, 'DNF', 0),   -- Victor Martins
(27, 5, 11, NULL, 'DNF', 0),   -- Richard Verschoor
(3, 5, 2, NULL, 'DNF', 0),   -- Ritomo Miyata
(33, 5, 17, NULL, 'DNF', 0),   -- Max Esterson
(25, 5, 6, NULL, 'DNF', 0),   -- Pepe Martí
(9, 5, 8, NULL, 'DNF', 0),   -- Gabriele Minì
(14, 5, 1, NULL, 'DNF', 0)
ON CONFLICT (driver_id, race_weekend_id) DO NOTHING;
