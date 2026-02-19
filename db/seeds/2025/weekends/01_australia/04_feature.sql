INSERT INTO feature_results
(driver_id, race_weekend_id, start_position, finish_position, status, fastest_lap)
VALUES
(2, 1, 1, 1, 'CANCELLED', 0),   -- Joshua Dürksen
(23, 1, 2, 2, 'CANCELLED', 0),   -- Leonardo Fornaroli
(28, 1, 3, 3, 'CANCELLED', 0),   -- Luke Browning
(27, 1, 4, 4, 'CANCELLED', 0),   -- Richard Verschoor
(24, 1, 5, 5, 'CANCELLED', 0),   -- Roman Staněk
(11, 1, 6, 6, 'CANCELLED', 0),   -- Sebastián Montoya
(9, 1, 7, 7, 'CANCELLED', 0),   -- Gabriele Minì
(25, 1, 8, 8, 'CANCELLED', 0),   -- Pepe Martí
(14, 1, 9, 9, 'CANCELLED', 0),   -- Alexander Dunne
(26, 1, 10, 10, 'CANCELLED', 0),   -- Arvid Lindblad
(10, 1, 11, 11, 'CANCELLED', 0),   -- Oliver Goethe
(3, 1, 12, 12, 'CANCELLED', 0),   -- Ritomo Miyata
(20, 1, 13, 13, 'CANCELLED', 0),   -- Rafael Villagómez
(7, 1, 14, 14, 'CANCELLED', 0),   -- Dino Beganovic
(31, 1, 15, 15, 'CANCELLED', 0),   -- Amaury Cordeel
(15, 1, 16, 16, 'CANCELLED', 0),   -- Kush Maini
(18, 1, 17, 17, 'CANCELLED', 0),   -- Cian Shields
(22, 1, 18, 18, 'CANCELLED', 0),   -- John Bennett
(32, 1, 19, 19, 'CANCELLED', 0),   -- Sami Meguetounif
(33, 1, 20, 20, 'CANCELLED', 0),   -- Max Esterson
(29, 1, 21, 21, 'CANCELLED', 0),   -- Jak Crawford
(30, 1, 22, 22, 'CANCELLED', 0)
ON CONFLICT (driver_id, race_weekend_id) DO NOTHING;
