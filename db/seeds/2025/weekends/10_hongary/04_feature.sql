INSERT INTO feature_results
(driver_id, race_weekend_id, start_position, finish_position, status, fastest_lap)
VALUES
(23, 10, 2, 1, 'OK', 0),   -- Leonardo Fornaroli
(24, 10, 1, 2, 'OK', 0),   -- Roman Staněk
(29, 10, 3, 3, 'OK', 0),   -- Jak Crawford
(28, 10, 4, 4, 'OK', 0),   -- Luke Browning
(27, 10, 11, 5, 'OK', 0),   -- Richard Verschoor
(26, 10, 8, 6, 'OK', 0),   -- Arvid Lindblad
(7, 10, 14, 7, 'OK', 1),   -- Dino Beganovic (fastest lap)
(10, 10, 6, 8, 'OK', 0),   -- Oliver Goethe
(14, 10, 9, 9, 'OK', 0),   -- Alexander Dunne
(25, 10, 10, 10, 'OK', 0),   -- Pepe Martí
(15, 10, 20, 11, 'OK', 0),   -- Kush Maini
(2, 10, 5, 12, 'OK', 0),   -- Joshua Dürksen
(20, 10, 16, 13, 'OK', 0),   -- Rafael Villagómez
(32, 10, 19, 14, 'OK', 0),   -- Sami Meguetounif
(11, 10, 18, 15, 'OK', 0),   -- Sebastián Montoya
(18, 10, 22, 16, 'OK', 0),   -- Cian Shields
(9, 10, 12, 17, 'OK', 0),   -- Gabriele Minì
(3, 10, 17, 18, 'OK', 0),   -- Ritomo Miyata
(33, 10, 21, 19, 'OK', 0),   -- Max Esterson
(22, 10, 15, NULL, 'DNF', 0),   -- John Bennett
(30, 10, 7, NULL, 'DNF', 0),   -- Victor Martins
(31, 10, 13, NULL, 'DNF', 0)
ON CONFLICT (driver_id, race_weekend_id) DO NOTHING;
